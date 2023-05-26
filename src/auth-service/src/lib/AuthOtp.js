import crypto from "crypto";
import db from "@lib/db";
import config from "@lib/config";
import MemStore from "@lib/memstore";

import Otp from "./Otp";
import Signin from "./Signin";

async function setAuthOtp(data, realm) {
  const user = await db.user.findOne({
    where: { id: data.user_id },
    raw: true
  });
  const otp_token = crypto.randomBytes(42).toString("hex");

  user.otp_transport = user.google_auth
    ? "google authenticator"
    : user.otp_transport;
  const otp = user.otp_transport == "test" ? "111111" : Otp.makeOtp(6);
  await MemStore.set(
    `otp-token${otp_token}`,
    JSON.stringify({ user_id: data.user_id, temp_pass: data.temp_pass, otp }),
    config.otp_timeout || 300
  );

  await Otp.sentOtpByTransport(user, otp, data, realm);
  const available_channels = await Otp.availableOtpChannels(user);

  return {
    otp_token,
    channel: user.otp_transport,
    available_channels
  };
}

async function checkAuthOtp(data, realm) {
  let otp_object = await MemStore.get(`otp-token${data.otp_token}`);
  if (!otp_object) throw "OTPNOTFOUND";
  otp_object = JSON.parse(otp_object);

  switch (data.channel) {
    case "google authenticator": {
      await Otp.verifyGA(data, otp_object, realm, otp_object.user_id).catch(
        (e) => {
          throw e;
        }
      );
      break;
    }
    default: {
      if (data.otp != otp_object.otp) {
        await Otp.incrementAttemps(otp_object, data.otp_token, "otp-token");
        throw "WRONGOTP";
      }
    }
  }

  return await Signin.signinSecondStage(otp_object, data.otp_token, realm);
}
async function resendAuthOtp(data, realm) {
  let otp_object = await MemStore.get(`otp-token${data.otp_token}`);
  if (!otp_object) throw "OTPNOTFOUND";
  otp_object = JSON.parse(otp_object);

  const user = await db.user.findOne({
    where: { id: otp_object.user_id },
    raw: true
  });
  if (!user) throw "USERNOTFOUND";

  await Otp.sentOtpByTransport(user, otp_object.otp, data, realm, data.channel);
  const available_channels = await Otp.availableOtpChannels(user);

  return {
    otp_token: data.otp_token,
    channel: data.channel,
    available_channels
  };
}

export default {
  setAuthOtp,
  checkAuthOtp,
  resendAuthOtp
};
