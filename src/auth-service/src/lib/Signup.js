import passwordValidator from "password-validator";
import Captcha from "./Captcha";
import MemStore from "@lib/memstore";
import db from "@lib/db";
import sha1 from "sha1";
import Queue from "@lib/queue";
import randomize from "randomatic";
import axios from "axios";

const passwordSchema = new passwordValidator();
const reCaptchaUrl = "https://www.google.com/recaptcha/api/siteverify";
const reCaptchaSecretKey = "6Lfe0LYZAAAAAHmzqvnlc2W86y7EXrC8ICzahLCC";

passwordSchema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(40) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits() // Must have digits
  .has()
  .not()
  .spaces(); // Should not have spaces
//.is().not().oneOf(['Passw0rd', 'Password123']);

function isUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str
  );
}

function checkPersonalSignupData(data) {
  if (
    !data.email ||
    !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      data.email
    )
  )
    throw "INVALIDEMAIL";

  // if (!passwordSchema.validate(data.password)) throw "INVALIDPASSWORD";

  if (data.type == 1 && !data.legalname) throw "LEGALNAMEISEMPTY";

  return true;
}

async function checkUniqueUser(data, realmId) {
  const res = await db.user.findOne({
    where: {
      login: data.login,
      realm: realmId
    }
  });

  return !(!!res && !!res.dataValues);
}

async function checkUserRef(data, realmId) {
  if (!data.ref_user) return false;
  const res = await db.user.findOne({
    where: {
      id: data.ref_user
    }
  });

  return !(!!res && !!res.dataValues);
}

async function signup(data, realmId) {
  //
  // if (await checkUserRef(data, realmId)) throw "USERREFDOESNOTEXIST";
  if (data.mobile) data.login = data.mobile;
  if (data.email) data.login = data.email;
  if (!realmId) throw "REALMUNEXPECTED";
  if (!(await Captcha.checkCaptcha(data))) throw "CAPTCHAEXPECTED";
  if (!data.hasOwnProperty("registred_using_bot"))
    if (!checkPersonalSignupData(data)) return;
  if (!(await checkUniqueUser(data, realmId))) throw "USEREXISTS";
  data.realm = realmId;
  data.pass = null; //sha1(data.password);
  data.otp_transport = "email";
  let temp_pass = await makeTempPass();

  data.temp_pass = sha1(temp_pass);
  if (!data.ref_user || !isUUID(data.ref_user)) data.ref_user = null;
  const user = await db.user.createWF(data);
  await db.user.update(
    { otp_transport: "sms" },
    { where: { id: user.get("id") } }
  );
  await MemStore.del("cpt" + data.token);
  await sendTempPassword(user, temp_pass, realmId, arguments[7].lang);
  return await sendEmail(user, realmId, arguments[7].lang);
  // return sendEmail(user, realmId, arguments[7].lang);
}

async function makeTempPass() {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

async function sendTempPassword(user, temp_pass, realmId, lang) {
  return await Queue.newJob("mail-service", {
    method: "sms",
    data: {
      lang: lang,
      code: "signup-temppass",
      to: user.phone,
      body: { temp_pass }
    },
    realmId
  });
}

async function sendEmail(user, realmId, lang) {
  user = user.toJSON();
  Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang,
      code: "signup-welcomemess",
      to: user.email,
      body: user
    },
    realmId
  });
  return user;
}

async function activate(data, realmId) {
  if (
    !data.user_id ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89AB][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      data.user_id
    )
  )
    throw "THEREISNTUSERID";

  let activateCode = await MemStore.get(data.user_id);
  if (!activateCode) throw "ALREADYACTIVATED";
  if (data.code !== activateCode) throw "INVALIDACTIVATECODE";
  await MemStore.del(data.user_id);

  const user = await db.user.findOne({
    where: { id: data.user_id },
    attributes: ["activated", "email"]
  });
  if (!user) throw "USERNOTFOUND";
  if (user.activated) throw "USERACTIVATED";
  await db.user.update({ activated: true }, { where: { id: data.user_id } });
  Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: arguments[7].lang,
      code: "user-activated",
      to: user.email,
      body: user
    },
    realmId
  });
  return { success: true };
}

async function createCode(token, item) {
  let counter = await MemStore.get("chk-" + item);
  if (counter) {
    counter = parseInt(counter);
    if (counter >= 3) {
      // no more than 3 attemptsno more than 3 attempts
      throw "ATTEMPSEXCEEDED";
    }
  } else {
    counter = 0;
  }
  counter++;
  await MemStore.set("chk-" + item, counter, 300);

  let code = await MemStore.get("wcd" + token);
  if (code) code = code.split(":")[0];
  else {
    code = randomize("0", 6);
    await MemStore.set("wcd" + token, code + ":" + item, 300);
  }
  return code;
}

async function delCode(token, item) {
  try {
    await MemStore.del("chk-" + item);
  } catch (e) {}
  try {
    await MemStore.del("wcd" + token);
  } catch (e) {}
}

async function getCode(token) {
  return await MemStore.get("wcd" + token);
}
async function checkReCaptcha(data) {
  let res = await axios.post(
    reCaptchaUrl + "?secret=" + reCaptchaSecretKey + "&response=" + data.captcha
  );
  // console.log(res.data);
  return res.data;
}

async function checkIfUserExistsAndActivated(param) {
  let user = await db.user.findOne({ where: param });
  if (user && user.activated === true) return true;
  if (user && user.activated === false)
    db.user.destroy({ where: { id: user.id } });
  return false;
}

async function verifyEmail(data, realmId) {
  if (!data.email || !data.captcha || !data.token) throw "INVALIDREQUEST";
  // if (!(await Captcha.checkCaptcha(data))) throw "CAPTCHAEXPECTED";
  let checkCaptcha = await checkReCaptcha(data);

  // const user = await db.user.findOne({ where: { email: data.email } });
  // if (user) {
  //   throw "USERALREADYEXISTS";
  // }

  if (!checkCaptcha) throw "CAPTCHAEXPECTED";
  if (checkCaptcha) {
    if (checkCaptcha.score < 0.5 && checkCaptcha.success == false)
      throw "PLEASECONTACTTHEADMINISTRATOR";
  }
  let userExists = await checkIfUserExistsAndActivated({ email: data.email });
  if (userExists) throw "USERALREADYEXISTS";
  const user = await db.user.findOne({ where: { email: data.email } });
  if (user) {
    throw "USERALREADYEXISTS";
  }

  const code = await createCode(data.token, data.email);

  // console.log("code to email:", code);

  await Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: arguments[7].lang,
      code: "verify-email",
      to: data.email,
      body: { code }
    },
    realmId
  });

  return { success: true };
}

async function checkEmailCode(data, realm) {
  if (!data.code || !data.token || !data.user_id) throw "INVALIDREQUEST";
  const st = await getCode(data.token);
  const code_email = st.split(":");
  if (code_email[0] == data.code) {
    await db.user.upsert({
      id: data.user_id,
      email: code_email[1],
      login: code_email[1],
      realm
    });
    await delCode(data.token, code_email[1]);
    return { success: true };
  }
  return { success: false };
}

async function verifyPhone(data, realmId) {
  if (!data.phone || !data.captcha || !data.token) throw "INVALIDREQUEST";
  // if (!(await Captcha.checkCaptcha(data))) throw "CAPTCHAEXPECTED";
  let checkCaptcha = await checkReCaptcha(data);

  if (!checkCaptcha) throw "CAPTCHAEXPECTED";
  if (checkCaptcha) {
    if (checkCaptcha.score < 0.5 && checkCaptcha.success == false)
      throw "PLEASECONTACTTHEADMINISTRATOR";
  }

  // const user = await db.user.findOne({ where: { phone: data.phone } });
  // if (user) {
  //   throw "USERALREADYEXISTS";
  // }
  let check = await checkIfUserExistsAndActivated({ phone: data.phone });
  if (!check) throw "USERALREADYEXISTS";

  const code = await createCode(data.token, data.phone);

  await Queue.newJob("mail-service", {
    method: "sms",
    data: {
      lang: arguments[7].lang,
      code: "verify-phone",
      to: data.phone,
      body: { code }
    },
    realmId
  });

  return { success: true };
}

async function checkPhoneCode(data, realm) {
  if (!data.code || !data.token || !data.user_id) throw "INVALIDREQUEST";
  const st = await getCode(data.token);
  const code_phone = st.split(":");
  if (code_phone[0] == data.code) {
    await db.user.upsert({
      id: data.user_id,
      phone: code_phone[1],
      realm
    });
    await delCode(data.token, code_phone[1]);
    return { success: true };
  }
  return { success: false };
}

async function verifyPassword(data, realm) {
  if (!data.password || !data.token || !data.user_id) throw "INVALIDREQUEST";
  const user = await db.user.findOne({
    where: {
      id: data.user_id
    },
    attributes: ["id", "pass"]
  });
  if (user && !user.get("pass")) {
    await db.user.update(
      {
        pass: sha1(data.password),
        activated: true
      },
      { where: { id: user.get("id") } }
    );
    return { success: true };
  }
  return { success: false };
}

export default {
  signup,
  activate,
  verifyPhone,
  verifyEmail,
  checkEmailCode,
  checkPhoneCode,
  verifyPassword
};
