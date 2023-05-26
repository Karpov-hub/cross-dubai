import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import db from "@lib/db";

let globalPhoneCodePromise;
let globalPasswordPromise;
let clientStartPromise;
let clientInstance;

function _generatePromise() {
  let resolve;
  let reject;
  let promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return { resolve, reject, promise };
}

async function _getClient(t_app_id) {
  const telegramApp = await db.telegram_app.findOne({
    where: {
      id: t_app_id
    },
    raw: true
  });

  const session = new StringSession(telegramApp.session || "");

  clientInstance = new TelegramClient(
    session,
    telegramApp.app_id,
    telegramApp.api_hash,
    {
      connectionRetries: 3
    }
  );

  await clientInstance.connect();

  return;
}

async function auth(data) {
  await _getClient(data.telegram_app);

  globalPhoneCodePromise = _generatePromise();
  globalPasswordPromise = _generatePromise();

  clientStartPromise = clientInstance.start({
    phoneNumber: () => data.phone,
    phoneCode: async () => {
      const code = await globalPhoneCodePromise.promise;
      globalPhoneCodePromise = _generatePromise();
      return code;
    },
    password: async () => {
      const password = await globalPasswordPromise.promise;
      globalPasswordPromise = _generatePromise();
      return password;
    },
    onError: (err) => {
      console.log("auth ERROR:", err);
      Promise.resolve({ success: false, err });
    }
  });

  return { success: true };
}

async function verifyPhoneCode(data, realm, user) {
  globalPhoneCodePromise.resolve(data.code);
  globalPasswordPromise.resolve(data.password);

  clientStartPromise
    .then(async () => {
      await db.telegram_app.update(
        { session: clientInstance.session.save() },
        { where: { phone: data.phone, user_id: user } }
      );
    })
    .catch((err) => {
      console.log("verifyPhoneCode ERROR:", err);
      Promise.resolve({ success: false, err });
    });

  return { success: true };
}

async function sendMessage(data) {
  const { channel_id, telegram_app } = await _getChannelIdByRef(data.ref_id);

  await _getClient(telegram_app);

  await clientInstance.invoke(
    new Api.messages.SendMessage({
      peer: channel_id,
      message: data.message
    })
  );

  await clientInstance.disconnect();

  return { success: true };
}

async function createChannel(data, realm, user) {
  await _checkChannelExist(data.ref_id).catch((e) => {
    throw e;
  });

  let channelInfo = null;
  let channelId = null;

  const telegramApp = await _getTelegramAppByUser(user).catch((e) => {
    throw e;
  });
  await _getClient(telegramApp);

  const newChannel = await clientInstance.invoke(
    new Api.channels.CreateChannel({
      title: data.title,
      about: data.about || "",
      megagroup: false,
      forImport: false
    })
  );

  if (newChannel) {
    channelId = `-100${newChannel.updates[1].channelId}`;
    channelInfo = await clientInstance.invoke(
      new Api.channels.GetFullChannel({
        channel: channelId
      })
    );
  }

  if (channelInfo) {
    try {
      if (!Array.isArray(data.ref_id)) data.ref_id = [data.ref_id];
      let ins_array = [];
      for (let ref_id of data.ref_id)
        ins_array.push({
          title: data.title,
          channel_id: channelId,
          ref_id,
          join_link: channelInfo.fullChat.exportedInvite.link,
          telegram_app: telegramApp
        });
      await db.telegram_channel.bulkCreate(ins_array);
    } catch (error) {
      console.log(error);
      throw "ERROR_TELEGRAM_CHANNEL_CREATION";
    }
  }

  await clientInstance.disconnect();

  return { success: true };
}

async function deleteChannel(data) {
  const { channel_id, telegram_app } = await _getChannelIdByRecordId(data.id);

  await _getClient(telegram_app);

  try {
    const result = await clientInstance.invoke(
      new Api.channels.DeleteChannel({
        channel: channel_id
      })
    );

    if (result) {
      await db.telegram_channel.destroy({
        where: {
          channel_id
        }
      });
    }
  } catch (error) {
    const err = String(error);
    if (err.indexOf("Could not find the input entity") !== -1) {
      await db.telegram_channel.destroy({
        where: {
          id: data.id
        }
      });
    } else {
      throw err;
    }
  }
  await clientInstance.disconnect();

  return { success: true };
}

async function editAdmin(data) {
  const { channel_id, telegram_app } = await _getChannelIdByRef(data.ref_id);

  await _getClient(telegram_app);

  await clientInstance.invoke(
    new Api.channels.EditAdmin({
      channel: channel_id,
      userId: data.user_name,
      adminRights: new Api.ChatAdminRights({
        changeInfo: true,
        postMessages: true,
        editMessages: true,
        deleteMessages: true,
        banUsers: true,
        inviteUsers: true,
        pinMessages: true,
        addAdmins: true,
        anonymous: true,
        manageCall: true,
        other: true
      }),
      rank: "Administrator"
    })
  );

  await clientInstance.disconnect();

  return { success: true };
}

async function _getChannelIdByRef(ref_id) {
  const tChannel = await db.telegram_channel.findOne({
    where: { ref_id },
    attributes: ["channel_id", "telegram_app"],
    raw: true
  });

  if (!tChannel) {
    throw "CHANNEL_NOT_FOUND";
  }

  return tChannel;
}

async function _getChannelIdByRecordId(id) {
  const tChannel = await db.telegram_channel.findOne({
    where: { id },
    attributes: ["channel_id", "telegram_app"],
    raw: true
  });

  return tChannel;
}

async function _getTelegramAppByUser(user_id) {
  const tApp = await db.telegram_app.findOne({
    where: { user_id, active: true },
    attributes: ["id"],
    raw: true
  });

  if (!tApp) {
    throw "NO_ACTIVE_APP";
  }

  return tApp.id;
}

async function _checkChannelExist(ref_id) {
  const tChannel = await db.telegram_channel.findAll({
    where: { ref_id },
    attributes: ["id"],
    raw: true
  });

  if (tChannel && tChannel.length) {
    throw "CHANNEL_EXIST";
  }

  return;
}

async function logout(data, realm, user) {
  await _getClient(data.telegram_app);

  try {
    const result = await clientInstance.invoke(new Api.auth.LogOut({}));

    if (result) {
      await db.telegram_app.update(
        { session: null },
        { where: { id: data.telegram_app } }
      );
    }
  } catch (error) {
    throw String(error);
  }

  await clientInstance.disconnect();

  return { success: true };
}

async function editChannelName({ id, title }) {
  const { channel_id: channel, telegram_app } = await _getChannelIdByRecordId(id);
  await _getClient(telegram_app);

  const result = await clientInstance.invoke(
    new Api.channels.EditTitle({ channel, title })
  );

  if (result) await db.telegram_channel.update({ title }, { where: { id } });

  return { success: true };
}

export default {
  auth,
  verifyPhoneCode,
  sendMessage,
  createChannel,
  deleteChannel,
  editAdmin,
  logout,
  editChannelName
};
