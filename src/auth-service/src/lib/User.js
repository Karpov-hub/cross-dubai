import db, { sequelize } from "@lib/db";
import sha1 from "sha1";
import Queue from "@lib/queue";
const randomize = require("randomatic");
import MemStore from "@lib/memstore";
import FileProvider from "@lib/fileprovider";
import crypto from "crypto";
import config from "@lib/config";
import OtpFunctions from "./Otp";

const pug = require("pug");

const Op = db.Sequelize.Op;

// blocking time with erroneous change password, sec
const BlockTimeout = 300;

// number of password attempts
const CountOfErrorsInPassword = 3;

async function _getUserPermissions(user) {
  const user_permission = await db.client_role.findOne({
    where: { id: user.role },
    attributes: ["permissions", "other_permissions"],
    raw: true
  });

  const permissions =
    user_permission && user_permission.permissions
      ? user_permission.permissions._arr
      : [];

  const other_permissions =
    user_permission && user_permission.other_permissions
      ? user_permission.other_permissions._arr
      : [];

  return { permissions, other_permissions };
}

async function getProfile(data, realmId, userId) {
  const user = await db.user.findOne({
    where: { id: userId, realm: realmId },
    attributes: [
      "id",
      "email",
      "first_name",
      "last_name",
      "login",
      "google_auth",
      "phone",
      "role",
      "otp_transport"
    ],
    raw: true
  });

  const { permissions, other_permissions } = await _getUserPermissions(user);

  const { role, otp_transport, ...out } = user;

  return {
    ...out,
    permissions,
    other_permissions,
    available_otp_channels: await OtpFunctions.availableOtpChannels(user),
    current_otp_channel: user.otp_transport
  };
}

async function _checkChangePassBlocked(userId) {
  const key = "cpblk" + userId;
  let count = await MemStore.get(key);
  if (count && parseInt(count) >= CountOfErrorsInPassword) return true;
  return false;
}

async function _changePassBlock(userId) {
  const key = "cpblk" + userId;
  let count = await MemStore.get(key);
  if (count) count = parseInt(count);
  else count = 0;
  await MemStore.set(key, count + 1, BlockTimeout);
}

async function comparePasswords(data, realmId, userId) {
  if (await _checkChangePassBlocked(userId)) {
    throw "CHANGE_PASSWORD_BLOCKED";
  }

  const user = await db.user.findOne({
    where: { id: userId, realm: realmId },
    attributes: ["id", "pass", "email"],
    raw: true
  });

  if (user && user.pass == sha1(data.password)) {
    return { success: true, user };
  }

  await _changePassBlock(userId);

  return { success: false };
}

async function changePassword(data, realmId, userId) {
  const passwordsCheck = await comparePasswords(data, realmId, userId);

  if (passwordsCheck && passwordsCheck.success) {
    await db.user.update(
      { pass: sha1(data.new_password) },
      {
        where: { id: userId, realm: realmId }
      }
    );

    await _closeUserSessionsWithoutCurrent(userId, arguments[7].token);

    Queue.newJob("auth-service", {
      method: "sendNotificationToTheUser",
      data: {
        code: "change-password",
        recipient: passwordsCheck.user.email,
        body: data
      },
      realmId
    });

    return { success: true };
  }

  throw "PASSWORDSDONOTMATCH";
}

async function changeSecretQuestion(data, realmId, userId) {
  await db.user.update(data, {
    where: { id: userId, realm: realmId }
  });
  return { success: true };
}

async function sendRestorePasswordCode(data, realmId) {
  const user = await db.user.findOne({
    where: { email: data.email, realm: realmId },
    raw: true
  });

  if (user) {
    const letterData = {
      restoreCode: randomize("Aa0", 10),
      lang: arguments[7].lang,
      to: user.email,
      code: "password-recovery-code"
    };

    await MemStore.set(
      letterData.restoreCode,
      user.id,
      config.RESTORE_PASS_CODE_LIFETIME
    );

    Queue.newJob("mail-service", {
      method: "send",
      data: letterData,
      realmId: realmId
    });

    const out = { success: true };

    if (config.IS_TEST) {
      out.code = letterData.restoreCode;
    }

    return out;
  }

  throw "USERNOTFOUND";
}

async function restorePassword(data, realmId) {
  const usrId = await MemStore.get(data.code);

  if (usrId) {
    await db.user.update(
      { pass: sha1(data.new_password) },
      {
        where: { id: usrId, realm: realmId }
      }
    );
    await MemStore.del(data.code);

    return { success: true };
  }

  throw "LINKACTIVATED";
}

async function getAvatar(data, realmId, userId) {
  const user = await db.user.findOne({
    where: {
      id: userId,
      realm: realmId
    }
  });

  if (user == null) throw "USERNOTFOUND";
  if (user.dataValues.avatar_id == undefined)
    return {
      avatar: null
    };

  const avatar = await db.provider.findOne({
    where: {
      code: user.dataValues.avatar_id
    }
  });

  let fileBase64 = await FileProvider.pull(avatar.dataValues);

  if (avatar && avatar.dataValues) {
    return {
      success: true,
      avatar: fileBase64.data
    };
  }
}

async function avatarUpload(data, realmId, userId) {
  await db.user.update(
    {
      avatar_id: data.files[0].code
    },
    {
      where: {
        id: userId,
        realm: realmId
      }
    }
  );

  return {
    success: true
  };
}

async function getByEmail(data) {
  return await db.user.findOne({
    where: {
      email: data.email
    }
  });
}

async function getKyc(data) {
  if (!data.id) throw "REQUESTWRONG";
  const user = await db.user.findOne({
    where: { id: data.id },
    attributes: ["kyc"]
  });
  if (!user) throw "USERNOTFOUND";
  return user;
}

async function saveIP(data, realmId, userId) {
  const res = await db.user.update(
    { ip: { _arr: data } },
    {
      where: { id: userId, realm: realmId }
    }
  );

  if (!res.length) throw "IPNOTSAVED";
  return { success: true, res };
}

async function updateProfile(data, realmId, userId) {
  const res = await db.user.update(data, {
    where: {
      id: userId,
      realm: realmId
    }
  });

  if (!res && !res.length) throw "PROFILENOTUPDATED";
  return { success: true, res };
}

async function changeToCorporate(data, realmId, userId) {
  const res = await db.user.update(
    {
      type: 1
    },
    {
      where: {
        id: userId,
        realm: realmId
      }
    }
  );

  if (!res && !res.length) throw "ACCOUNTNOTCHANGED";
  return { success: true, res };
}

async function getReferals(data, realmId, userId) {
  const count = await db.user.count({
    where: {
      ref_user: userId,
      realm: realmId
    }
  });

  const res = await db.user.findAll({
    where: {
      ref_user: userId,
      realm: realmId
    },
    offset: data.start || 0,
    limit: data.limit || 20,
    attributes: ["first_name", "last_name"]
  });

  if (!res && !res.length) return;
  return { list: res, count };
}

async function acceptCookie(data, realmId, userId) {
  let res = await db.user.update(
    { cookie: true },
    {
      where: { id: userId, realm: realmId }
    }
  );
  if (!res && !res.length) throw "ERROR";
  return { success: true };
}

async function didUserSignedFramedAgreement(data, realmId, userId) {
  const res = await db.user.findOne({
    where: {
      id: userId,
      realm: realmId
    },
    attributes: ["id", "fa"]
  });

  if (!res && !res.dataValues) return;
  return { success: true, flag: res.dataValues.fa };
}

async function changePhone(data, realmId, userId) {
  const res = await db.user.findOne({
    where: { id: userId, realm: realmId },
    attributes: ["id", "phone", "email"]
  });

  if (res && res.dataValues) {
    await db.user.update(
      { phone: data.new_phone },
      {
        where: { id: userId, realm: realmId }
      }
    );

    Queue.newJob("auth-service", {
      method: "sendNotificationToTheUser",
      data: {
        code: "change-phone",
        recipient: res.dataValues.email,
        body: data
      },
      realmId
    });
    return { success: true, new_phone: data.new_phone };
  }
  throw "ERRORWHILECHANGEPHONE";
}

async function confirmPassword(data, realmId, userId) {
  const user = await db.user.findOne({
    where: { id: userId, realm: realmId },
    attributes: ["id", "pass"]
  });

  if (user)
    if (user.pass == sha1(data.password)) {
      return { success: true };
    }

  throw "INCORRECTPASSWORD";
}

async function checkEmailForExist(data, realmId, userId) {
  const user = await db.user.findOne({
    where: { email: data.new_email, realm: realmId },
    raw: true
  });

  if (user) {
    throw "ALREADYUSED";
  }

  return { success: true };
}

async function sendNewEmailVerifyLink(data, realmId, userId) {
  await checkEmailForExist(data, realmId);

  const out = {
    verifyCode: randomize("Aa0", 10),
    userId,
    code: "verify-link",
    to: data.new_email,
    lang: arguments[7].lang
  };

  await MemStore.set(`${out.verifyCode}+email`, data.new_email, 600);
  await MemStore.set(`${out.verifyCode}+userId`, userId, 600);
  await MemStore.set(`${out.verifyCode}+cs`, arguments[7].token, 600);

  Queue.newJob("mail-service", {
    method: "send",
    data: out,
    realmId: realmId
  });

  return { success: true };
}

async function changeEmail(data, realmId, userId) {
  const new_email = await MemStore.get(`${data.code}+email`);
  const user_id = await MemStore.get(`${data.code}+userId`);
  const current_session = await MemStore.get(`${data.code}+cs`);

  if (user_id && new_email) {
    const usr = await db.user.findOne({
      where: { id: user_id, realm: realmId },
      attributes: ["id", "email"],
      raw: true
    });

    const out = {
      code: "email-changed",
      to: usr.email,
      new_email: new_email
    };

    Queue.newJob("mail-service", {
      method: "send",
      data: out,
      realmId: realmId
    });

    await db.user.update(
      { email: new_email },
      {
        where: { id: user_id, realm: realmId }
      }
    );

    await _closeUserSessionsWithoutCurrent(user_id, current_session);

    await MemStore.del(`${data.code}+email`);
    await MemStore.del(`${data.code}+userId`);
    await MemStore.del(`${data.code}+cs`);

    return { success: true };
  }

  throw "LINKNOTAVAILABLE";
}

async function getWhiteListCountries(data) {
  let res = await db.countries.findAll({
    where: {
      permission: { [Op.in]: [1, 2] },
      lang: "English"
    },
    order: [["name", "ASC"]]
  });
  if (res && res.length) return { success: true, countires_list: res };
  throw "GETWLCOUNTRIESAPIERROR";
}

async function getSystemNotifications(data) {
  let query_data = {
    where: {
      active: true,
      removed: { [Op.ne]: 1 }
    },
    raw: true
  };
  if (data && data.ids) {
    if (data.source == "admin") {
      delete query_data.where.active;
      query_data.where.date_from = { [Op.is]: null };
      query_data.where.date_to = { [Op.is]: null };
    }
    if (data.source == "cron") {
      query_data.where.date_from = { [Op.not]: null };
      query_data.where.date_to = { [Op.not]: null };
    }
    query_data.where.id = { [Op.in]: data.ids };
  }
  let system_notifications_list = await db.system_notification.findAll(
    query_data
  );
  let notifications = [],
    letter_codes_list = [];
  for (let notification of system_notifications_list) {
    letter_codes_list.push(notification.letter_template);
    notifications.push({
      id: notification.id,
      letter_template: notification.letter_template,
      data: notification.data
    });
  }

  let letters = await db.letter.findAll({
    where: { code: { [Op.in]: letter_codes_list } },
    attributes: ["id", "code", "text", "lang"],
    raw: true
  });
  let prepared_notifications = [];
  for (let notification of notifications) {
    if (
      notification.data &&
      Object.keys(notification.data) &&
      Object.keys(notification.data).length
    ) {
      let result = { id: notification.id };
      for (let lang of Object.keys(notification.data)) {
        let letter_data = letters.find((el) => {
          return notification.letter_template == el.code && el.lang == lang;
        });
        if (!letter_data)
          letter_data = letters.find((el) => {
            return (
              notification.letter_template == el.code &&
              notification.lang == "en"
            );
          });
        if (!letter_data) continue;

        result[lang] = pug
          .render(letter_data.text, {
            body: notification.data[lang]
          })
          .replace(/<[^>]{2}>/g, "\n");
        result[lang] = result[lang].replace(/<[^>]{1,}>/g, "");
      }

      prepared_notifications.push(result);
    }
  }
  return { success: true, notification_list: prepared_notifications };
}

async function closeUserSessions(data) {
  const allSessions = await MemStore.keys("usr*");
  const usrSessions = [];

  for (const sessionKey of allSessions) {
    const user_id = await MemStore.get(sessionKey);
    if (user_id === data.user_id) {
      usrSessions.push(sessionKey);
    }
  }

  if (usrSessions.length) {
    await MemStore.del(usrSessions);
  }

  return { success: true };
}

async function getUserSession(data) {
  const token = crypto.randomBytes(42).toString("hex");
  await MemStore.set("usr" + token, data.user_id, 300);
  return { success: true, token };
}

async function _closeUserSessionsWithoutCurrent(userId, token) {
  const allSessions = await MemStore.keys("usr*");
  const usrSessions = [];

  for (const session of allSessions) {
    const user_id = await MemStore.get(session);
    if (user_id === userId && session !== "usr" + token) {
      usrSessions.push(session);
    }
  }

  if (usrSessions.length) {
    await MemStore.del(usrSessions);
  }

  return { success: true };
}

async function updateSystemNotificationsStatus(data) {
  let removeTimestamp = (value) => {
    let date = new Date(value);
    let userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTimezoneOffset);
  };
  let current_date = removeTimestamp(new Date());
  let system_notifications_list = await db.system_notification.findAll({
    where: {
      [Op.or]: [
        {
          date_from: { [Op.not]: null, [Op.lte]: current_date },
          date_to: { [Op.not]: null, [Op.gte]: current_date },
          active: false
        },
        {
          date_to: { [Op.not]: null, [Op.lte]: current_date },
          active: true
        }
      ],
      removed: { [Op.ne]: 1 }
    },
    attributes: ["id", "letter_template", "active", "data"],
    raw: true
  });
  let notifications_for_deactivation = [],
    notifications_for_activation = [],
    letter_data = [];
  for (let notification of system_notifications_list) {
    if (!!notification.active)
      notifications_for_deactivation.push(notification.id);
    else {
      notifications_for_activation.push(notification.id);
      letter_data.push({
        id: notification.id,
        code: notification.letter_template,
        data: notification.data
      });
    }
  }
  if (notifications_for_deactivation.length)
    _updateNotificationsStatus(notifications_for_deactivation, false);
  if (!letter_data || !letter_data.length) return { success: true };
  _updateNotificationsStatus(notifications_for_activation, true);
  await sendMessageToRecipients(
    { letter_data, notifications_for_activation },
    "cron"
  );
  return { success: true };
}

async function sendMessageToRecipients(data, source) {
  source = data.source || source;
  let letter_data = Array.isArray(data.letter_data)
    ? data.letter_data
    : [data.letter_data];
  let recipients = await db.user.findAll({
    where: {
      activated: true
    },
    attributes: ["id", "email", "realm", "communication_lang"],
    raw: true
  });

  let recipient = recipients.find((el) => {
    return !!el.realm;
  });

  let recipients_obj = {};
  await _pushSystemNotificationToTheUsers(
    data.notifications_for_activation,
    recipients,
    source
  );
  for (let recipient_data of recipients) {
    if (!recipient_data.communication_lang)
      recipient_data.communication_lang = "en";
    if (!recipients_obj[recipient_data.communication_lang]) {
      recipients_obj[recipient_data.communication_lang] = [recipient_data];
      continue;
    }
    recipients_obj[recipient_data.communication_lang].push(recipient_data);
  }
  for (let item of letter_data) {
    if (typeof item.data == "string") item.data = JSON.parse(item.data);
    if (item.data && Object.keys(item.data) && Object.keys(item.data).length)
      for (let lang of Object.keys(recipients_obj))
        try {
          Queue.newJob("mail-service", {
            method: "send",
            data: {
              code: item.code,
              to: config.SYSTEM_NOTIFICATIONS_RECEIVER,
              bcc: recipients_obj[lang].map((el) => el.email).join(","),
              body: {
                ...(item.data[lang] || item.data.en)
              },
              lang
            },
            realmId: recipient.realm
          });
        } catch (e) {
          console.log(e);
        }
  }
  return { success: true };
}

async function _pushSystemNotificationToTheUsers(
  notifications,
  recipients,
  source = "admin"
) {
  let query_data = [];
  let { notification_list } = await getSystemNotifications({
    ids: notifications,
    source
  });
  for (let recipient of recipients) {
    for (let notification of notification_list) {
      let notification_data = { ...notification };
      delete notification_data.id;
      query_data.push({
        user_id: recipient.id,
        message: notification_data,
        system_notification_id: notification.id,
        ctime: new Date()
      });
      Queue.newJob("telegram-service", {
        method: "sendMessage",
        data: {
          message: notification_data[recipient.communication_lang],
          ref_id: recipient.id
        },
        realmId: recipient.realm
      });
    }
  }
  await db.user_system_notification.bulkCreate(query_data);

  return { success: true };
}

async function _updateNotificationsStatus(notifications, active) {
  await db.system_notification.update(
    {
      active
    },
    {
      where: {
        id: { [Op.in]: notifications }
      }
    }
  );
  if (!active)
    await db.user_system_notification.destroy({
      where: { system_notification_id: { [Op.in]: notifications } }
    });
  return { success: true };
}

async function sendNotificationToTheUser(data, realm_id) {
  let recipient_data = await _getReceiver(data.recipient, data.code);
  if (!recipient_data || !recipient_data.length)
    return { success: false, code: "RECIPIENT_NOT_FOUND" };
  for (let recipient_item of recipient_data) {
    Queue.newJob("mail-service", {
      method: "sendNotification",
      data: {
        to: recipient_item.to,
        body: data.body,
        template: recipient_item.code,
        channel: recipient_item.channel,
        lang: recipient_item.lang
      },
      realmId: realm_id
    });
  }
  return { success: true };
}

function checkUUID(str) {
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  return regexExp.test(str) ? str : null;
}

async function _getReceiver(recipient, code) {
  let wallet_data;
  try {
    wallet_data = await db.account_crypto.findOne({
      where: {
        [Op.or]: [{ address: recipient }, { id: checkUUID(recipient) }]
      },
      attributes: ["id", "acc_no"],
      raw: true
    });
  } catch (e) {
    console.log("_getReceiver error (wallet_data): ", e);
  }
  if (wallet_data) {
    let account_data = await db.account.findOne({
      where: {
        acc_no: wallet_data.acc_no
      },
      attributes: ["owner"],
      raw: true
    });
    if (!account_data || !account_data.owner) return null;
    let user_data = await _getOwnerData(account_data.owner);
    return await _prepareReceiverArray(user_data, code, wallet_data.id);
  }
  let account_data;
  try {
    account_data = await db.account.findOne({
      where: {
        [Op.or]: [{ id: checkUUID(recipient) }, { acc_no: recipient }]
      },
      attributes: ["id", "owner"],
      raw: true
    });
  } catch (e) {
    console.log("_getReceiver error (account_data)", e);
  }
  if (account_data) {
    if (!account_data.owner) return null;
    let user_data = await _getOwnerData(account_data.owner);
    return await _prepareReceiverArray(user_data, code, account_data.id);
  }
  let merchant_data;
  try {
    merchant_data = await db.merchant.findOne({
      where: {
        id: checkUUID(recipient)
      },
      attributes: ["id", "user_id"],
      raw: true
    });
  } catch (e) {
    console.log("_getReceiver error (merchant_data)", e);
  }
  if (merchant_data) {
    if (!merchant_data.user_id) return null;
    let user_data = await _getOwnerData(merchant_data.user_id);
    return await _prepareReceiverArray(user_data, code, merchant_data.id);
  }
  let user_data = await _getOwnerData(recipient);
  if (!user_data || !user_data.id) return null;
  return await _prepareReceiverArray(user_data, code, user_data.id);
}

async function _prepareReceiverArray(owner_data, code, entity_id) {
  let receiver_array = [];
  let notification_settings = await _getNotificationSettings(owner_data, code);
  for (let channel of notification_settings) {
    let to;
    switch (channel) {
      case "sms": {
        to = owner_data.phone;
        break;
      }
      default: {
        to = owner_data.email;
        break;
      }
    }
    receiver_array.push({
      lang: owner_data.communication_lang || "en",
      code,
      to,
      channel
    });
  }
  for (let to of [owner_data.id, entity_id]) {
    receiver_array.push({
      lang: owner_data.communication_lang || "en",
      code,
      to,
      channel: "telegram"
    });
    if (owner_data.id == entity_id) break;
  }
  return receiver_array;
}

async function _getOwnerData(search_criteria) {
  let user_data;
  try {
    user_data = await db.user.findOne({
      where: {
        [Op.or]: [
          { id: checkUUID(search_criteria) },
          { email: search_criteria },
          { phone: search_criteria }
        ]
      },
      attributes: ["id", "email", "phone", "communication_lang"],
      raw: true
    });
  } catch (e) {
    console.log("_getOwnerData error", e);
  }
  return user_data;
}

async function _getNotificationSettings(user_data, code) {
  let settings = await db.user_notification_setting.findOne({
    where: { user_id: user_data.id },
    attributes: ["notification_settings"],
    raw: true
  });

  //при отсутствии настроек у пользователя, пытаемся отослать по всем базовым каналам
  if (!settings || !settings.notification_settings) return ["email"];

  let setting = settings.notification_settings._arr.find((el) => {
    return el.code == code;
  });
  if (!setting) return ["email"];
  return setting.channels;
}

async function getSystemNotificationsList(data, realm, user) {
  let search_options = { where: { user_id: user }, raw: true };
  try {
    if (data.start || data.start === 0)
      search_options.offset = Number(data.start);
    if (data.limit) search_options.limit = Number(data.limit);
    search_options.order = [["ctime", "DESC"]];
  } catch (e) {
    throw "WRONGPARAMETERS";
  }

  let {
    count = 0,
    rows = []
  } = await db.user_system_notification.findAndCountAll(search_options);

  return { count, rows };
}

async function markAsReadedSystemNotificationsList(data, realm, user) {
  let query_data = [];
  for (let notification_id of data.list)
    query_data.push({
      id: notification_id,
      new_record: false,
      ctime: new Date()
    });
  await db.user_system_notification.bulkCreate(query_data, {
    updateOnDuplicate: ["new_record"]
  });
  return { success: true };
}

async function removeSystemNotification(data, realm, user) {
  await _destroySysNotification({ ids: [data.notification_id], user }).catch(
    (e) => {
      console.log("auth-service removeSystemNotification: ", e);
      throw "CANNOTDELETESYSTEMNOTIFICATION";
    }
  );
  return { success: true };
}

async function removeSystemNotifications(data) {
  await _destroySysNotification({ parent_id: data.parent_id }).catch((e) => {
    console.log("auth-service removeSystemNotifications: ", e);
    throw "CANNOTDELETESYSTEMNOTIFICATIONS";
  });
  return { success: true };
}

async function _destroySysNotification(options) {
  let query_data = {
    where: {
      id: { [Op.in]: options.ids }
    }
  };
  if (options.user) query_data.where.user_id = options.user;
  if (options.parent_id)
    query_data.where = { system_notification_id: options.parent_id };
  await db.user_system_notification.destroy(query_data);
  return { success: true };
}

async function getTelegramChannels(data, realm, user) {
  let { id: tg_app = null } =
    (await db.telegram_app.findOne({
      where: {
        user_id: user
      },
      attributes: ["id"],
      raw: true
    })) || {};
  if (!tg_app) return { code: "TG_APP_NOT_FOUND" };
  let accounts_list = await db.account.findAll({
    where: {
      owner: user,
      status: 1
    },
    attributes: ["acc_no"],
    raw: true
  });
  let wallets = await db.account_crypto.findAll({
    where: {
      acc_no: accounts_list.map((el) => el.acc_no),
      wallet_type: 0
    },
    attributes: ["id", "address"],
    raw: true
  });

  let tg_channels = await db.telegram_channel.findAll({
    where: {
      ref_id: [user].concat(wallets.map((el) => el.id))
    },
    attributes: ["join_link", "ref_id"],
    raw: true
  });
  let result = {
    user_data: {},
    wallets_data: []
  };
  let user_tg = tg_channels.find((el) => {
    return el.ref_id == user;
  });
  if (user_tg) result.user_data.join_link = user_tg.join_link;

  if (wallets && wallets.length)
    for (let wallet of wallets) {
      let existed_wallet_idx = result.wallets_data.findIndex((el) => {
        return el.address == wallet.address;
      });
      if (existed_wallet_idx === -1) {
        let wallet_item = {};
        let wallet_tg_data = tg_channels.find((el) => {
          return el.ref_id == wallet.id;
        });
        if (wallet_tg_data) wallet_item.join_link = wallet_tg_data.join_link;
        wallet_item.address = wallet.address;
        wallet_item.id = [wallet.id];
        result.wallets_data.push(wallet_item);
        continue;
      }
      result.wallets_data[existed_wallet_idx].id.push(wallet.id);
    }
  return result;
}

export default {
  getProfile,
  changePassword,
  changeSecretQuestion,
  sendRestorePasswordCode,
  restorePassword,
  getAvatar,
  avatarUpload,
  getByEmail,
  getKyc,
  saveIP,
  updateProfile,
  changeToCorporate,
  getReferals,
  acceptCookie,
  didUserSignedFramedAgreement,
  changePhone,
  confirmPassword,
  sendNewEmailVerifyLink,
  changeEmail,
  getWhiteListCountries,
  getSystemNotifications,
  closeUserSessions,
  getUserSession,
  comparePasswords,
  checkEmailForExist,
  updateSystemNotificationsStatus,
  sendMessageToRecipients,
  sendNotificationToTheUser,
  getSystemNotificationsList,
  markAsReadedSystemNotificationsList,
  removeSystemNotification,
  removeSystemNotifications,
  getTelegramChannels
};
