import db from "@lib/db";
import config from "@lib/config";
import MemStore from "@lib/memstore";
import Queue from "@lib/queue";
import uuid from "uuid/v4";

async function verifyGA(data, otp_object, realm, user) {
  const ga = await Queue.newJob("auth-service", {
    method: "googleAuthVerify",
    data: {
      user_token: data.otp
    },
    realmId: realm,
    userId: user
  });

  if (ga.error) {
    if (data.key) await incrementAttemps(otp_object, user, data.key);
    else await incrementAttemps(otp_object, user);
    throw ga.error;
  }
  return { success: true };
}

async function resendOtp(data, realm_id, user_id) {
  const otpJsonString = await MemStore.get(`otp${user_id}`);
  if (!otpJsonString) throw "OTPNOTFOUND";

  const user = await db.user.findOne({ where: { id: user_id } });
  if (!user) throw "USERNOTFOUND";

  const otpObject = JSON.parse(otpJsonString);
  await sentOtpByTransport(user, otpObject.otp, data, realm_id, data.transport);

  const availableChannels = await availableOtpChannels(user);

  return { success: true, availableChannels };
}

async function check(data, realm_id, user_id) {
  if (!data.otp) throw "INVALIDOTPREQUEST";

  const otpJsonString = await MemStore.get(`otp${user_id}`);
  if (!otpJsonString) throw "OTPNOTFOUND";

  const otpObject = JSON.parse(otpJsonString);

  if (data.transport == "google authenticator") {
    await verifyGA(data, otpObject, realm_id, user_id);
  } else if (
    data.transport != "google authenticator" &&
    data.otp != otpObject.otp
  ) {
    await incrementAttemps(otpObject, user_id);
    throw "WRONGOTP";
  }

  const res = await Queue.newJob(otpObject.data.header.service, {
    method: otpObject.data.header.method,
    data: otpObject.data.data,
    realmId: otpObject.data.realmId,
    userId: otpObject.data.userId,
    dataHeaders: otpObject.data.header
  });

  if (res.error) throw res.error;

  return res.result;
}
async function incrementAttemps(otpObject, user_id, key = "otp") {
  otpObject.attempt++;
  if (otpObject.attempt >= config.otp_attempts) {
    // await MemStore.del(`otp${operationId}`);
    throw "OTPATTEMPTSREACHED";
  }
  await MemStore.set(
    `${key}${user_id}`,
    JSON.stringify(otpObject),
    config.otp_timeout || 300
  );
  return;
}

function makeOtp(length) {
  let result = "";
  let characters = "0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function checkPreviouseAttempts(user_id) {
  const otpJsonString = await MemStore.get(`otp${user_id}`);
  if (otpJsonString) {
    const prevOtpSet = JSON.parse(otpJsonString);
    if (prevOtpSet && prevOtpSet.attempt >= config.otp_attempts) {
      throw "OTPATTEMPTSREACHED";
    }
    return prevOtpSet.attempt;
  }
  return 0;
}

async function setOtp(data, realm) {
  const user = await db.user.findOne({ where: { id: data.userId }, raw: true });
  if (!user) throw "USERNOTFOUND";

  const operationId = uuid();
  const otp = user.otp_transport == "test" ? "111111" : makeOtp(6);

  const attempt = await checkPreviouseAttempts(data.userId);

  data.data.stime = new Date();

  await MemStore.set(
    `otp${user.id}`,
    JSON.stringify({
      otp,
      attempt,
      data
    }),
    config.otp_timeout || 300
  );

  const transport = await sentOtpByTransport(user, otp, data, realm);

  const availableChannels = await availableOtpChannels(user);

  return {
    otpRequred: true,
    operationId,
    transport,
    availableChannels
  };
}

async function sentOtpByTransport(user, otp, data, realm, channel) {
  if (!!channel && !["email", "sms", "google authenticator"].includes(channel))
    throw "INVALID_OTP_OPTION";

  const transport = channel
    ? channel
    : user.otp_transport
    ? user.otp_transport
    : "email";

  switch (transport) {
    case "email":
      await sentOtpByEmail(user, otp, data, realm);
      break;
    case "sms":
      await sentOtpBySms(user, otp, data, realm);
      break;
    case "test":
      await sentOtpForTest(otp);
      break;
    case "google authenticator":
      break;
    default:
      throw "OTPTRANSPORTNOTDEFINED";
  }

  return transport;
}

async function sentOtpByEmail(user, otp, data, realmId) {
  // send by email
  Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: arguments[7] ? arguments[7].lang || "en" : "en",
      code: "otp",
      to: user.email,
      body: {
        otp,
        data
      }
    },
    realmId: data.realmId || realmId
  });
}

async function sentOtpBySms(user, otp, data, realmId) {
  // send by sms
  let to = user.phone;
  if (data.data) {
    if (data.data.new_phone) to = data.data.new_phone;
  }
  if (data.operation) {
    if (data.operation.new_phone) to = data.operation.new_phone;
  }

  Queue.newJob("mail-service", {
    method: "sms",
    data: {
      lang: arguments[7] ? arguments[7].lang || "en" : "en",
      code: "otp",
      to,
      body: {
        otp,
        data
      }
    },
    realmId: data.realmId || realmId
  });
}

async function sentOtpForTest(otp) {
  // send for test
  await MemStore.set(`testotp`, otp, config.otp_timeout || 300);
}

async function availableOtpChannels(user) {
  const channels = ["email"];
  if (user.google_auth) channels.push("google authenticator");
  if (config.IS_TEST) channels.push("test");
  // if (!!user.phone) channels.push("sms");

  return channels;
}

async function changeOtpChannel(data, realmId, userId) {
  const user = await db.user.findOne({
    where: {
      id: userId
    },
    attributes: ["google_auth", "phone"],
    raw: true
  });

  const availableChannels = await availableOtpChannels(user);

  if (!availableChannels.includes(data.channel)) {
    throw "NOT_AVAILABLE_CHANNEL";
  }

  await db.user.update(
    { otp_transport: data.channel },
    {
      where: { id: userId, realm: realmId }
    }
  );

  return { success: true };
}

export default {
  check,
  resendOtp,
  setOtp,
  verifyGA,
  incrementAttemps,
  sentOtpByTransport,
  availableOtpChannels,
  makeOtp,
  changeOtpChannel
};
