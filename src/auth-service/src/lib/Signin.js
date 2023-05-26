import db from "@lib/db";
import config from "@lib/config";
import crypto from "crypto";
import sha1 from "sha1";
import MemStore from "@lib/memstore";
import Queue from "@lib/queue";

import OTP from "./AuthOtp";

// blocking time with erroneous login, sec
const BlockTimeout = 180;

// number of password attempts
const CountOfErrorsInPassword = 3;

function getIpsString(ips) {
  let out = [];
  if (!ips || !ips._arr) return "";
  ips._arr.forEach((item) => {
    if (item && item.ip) out.push(item.ip);
  });
  return out.length ? out.join(",") : "";
}

async function sendTempPassToUser(data, realm) {
  let temp_pass = await generateTempPass();
  await db.user.update(
    { temp_pass: sha1(temp_pass) },
    { where: { id: data.id } }
  );
  sendMessage(data, temp_pass, realm);
  return { success: true };
  // if (await sendMessage(data, temp_pass, realm)) {
  //   return { success: true };
  // }
  // throw "MESSAGENOTSENT";
}
async function sendMessage(data, temp_pass, realmId) {
  return await Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: arguments[7] && arguments[7].lang ? arguments[7].lang : "en",
      code: "signup-temppass",
      to: data.email,
      body: {
        temp_pass
      }
    },
    realmId
  });
}

async function generateTempPass() {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

async function signin(data, realm) {
  if (await checkLoginBlocked(data.login, realm)) throw "LOGINBLOCKED";

  const user = await db.user.findOne({
    where: { email: data.login, realm },
    attributes: ["id", "pass", "blocked", "temp_pass"],
    raw: true
  });

  if (!user) {
    throw "LOGINERROR";
  }

  if (user.blocked === true) {
    throw "USERBLOCKED";
  }

  if (user) {
    if (user.pass && user.pass == sha1(data.password)) {
      await removeTempPass(user.id);
      return await OTP.setAuthOtp({ user_id: user.id }, realm);
    }
    if (user.temp_pass && user.temp_pass == sha1(data.password)) {
      return await OTP.setAuthOtp({ user_id: user.id, temp_pass: true }, realm);
    }
    await loginBlock(data.login, realm);
  }

  throw "LOGINERROR";
}

async function signout(data, realm, userId) {
  await MemStore.del("usr" + data.token);
  return { success: true };
}

async function removeTempPass(user_id) {
  return await db.user.update({ temp_pass: "" }, { where: { id: user_id } });
}

async function signinSecondStage(data, otp_token, realm) {
  if (!data.temp_pass) {
    await MemStore.del(`otp-token${otp_token}`);
    const token = crypto.randomBytes(42).toString("hex");
    await MemStore.set("usr" + token, data.user_id, 300);
    return { success: true, user_token: token };
  }
  return { success: true, temp_pass: true, otp_token };
}

async function setPermanentPassword(data, realm) {
  let otp_object = await MemStore.get(`otp-token${data.otp_token}`);
  if (!otp_object) throw "OTPNOTFOUND";
  otp_object = JSON.parse(otp_object);
  await db.user.update(
    {
      pass: sha1(data.password),
      pass_chng_date: new Date(),
      activated: true
    },
    { where: { id: otp_object.user_id } }
  );
  await removeTempPass(otp_object.user_id);
  delete otp_object.temp_pass;
  return await signinSecondStage(otp_object, data.otp_token, realm);
}

async function setPassword(data, realmId, userId) {
  let res = await db.user.upsert({
    id: userId,
    pass: sha1(data.password),
    pass_chng_date: new Date(),
    activated: true
  });
  await removeTempPass(userId);
  return { success: true };
}

async function checkGoogleAuth(data) {
  if (data && data.google_auth != undefined) {
    return data.google_auth;
  }
}

async function checkLoginBlocked(login, realm) {
  const key = "blk" + sha1(login + "-" + realm);
  let count = await MemStore.get(key);
  if (count && parseInt(count) >= CountOfErrorsInPassword) return true;
  return false;
}

async function loginBlock(login, realm) {
  const key = "blk" + sha1(login + "-" + realm);
  let count = await MemStore.get(key);
  if (count) count = parseInt(count);
  else count = 0;
  await MemStore.set(key, count + 1, BlockTimeout);
}

export default {
  signin,
  sendTempPassToUser,
  signinSecondStage,
  setPassword,
  signout,
  setPermanentPassword
};
