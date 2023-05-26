import db from "@lib/db";
import FileProvider from "@lib/fileprovider";
import crypto from "crypto";
import MemStore from "@lib/memstore";
import Queue from "@lib/queue";
const randomize = require("randomatic");

async function sendEmail(data, realmId, userId) {
  let usr = await db.user.findOne({
    where: { id: userId, realm: realmId },
  });

  const { result } = await Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: arguments[7] ? arguments[7].lang : "en",
      code: data.code,
      to: usr.dataValues.email,
      body: "",
    },
    realmId: realmId,
  });
}

async function saveProfileKYC(data, realmId, userId) {
  data.var_kyc = "profile_kyc";
  return await saveKYC(data, realmId, userId);
}
async function saveAddressKYC(data, realmId, userId) {
  data.var_kyc = "address_kyc";
  return await saveKYC(data, realmId, userId);
}
async function saveCompanyKYC(data, realmId, userId) {
  data.var_kyc = "company_kyc";
  return await saveKYC(data, realmId, userId);
}

async function rejectProfileKYC(data, realmId, userId) {
  data.var_kyc = "profile_kyc";
  data.code = "reject-profile-kyc";
  sendEmail(data, realmId, userId);
  return await rejectKYC(data);
}
async function rejectAddressKYC(data, realmId, userId) {
  data.var_kyc = "address_kyc";
  data.code = "reject-address-kyc";
  sendEmail(data, realmId, userId);
  return await rejectKYC(data);
}
async function rejectCompanyKYC(data, realmId, userId) {
  data.var_kyc = "company_kyc";
  data.code = "reject-company-kyc";
  sendEmail(data, realmId, userId);
  return await rejectKYC(data);
}

async function resolveProfileKYC(data, realmId, userId) {
  data.var_kyc = "profile_kyc";
  data.code = "resolve-profile-kyc";
  sendEmail(data, realmId, userId);
  return await resolveKYC(data);
}
async function resolveAddressKYC(data, realmId, userId) {
  data.var_kyc = "address_kyc";
  data.code = "resolve-address-kyc";
  sendEmail(data, realmId, userId);
  return await resolveKYC(data);
}
async function resolveCompanyKYC(data, realmId, userId) {
  data.var_kyc = "company_kyc";
  data.code = "resolve-company-kyc";
  sendEmail(data, realmId, userId);
  return await resolveKYC(data);
}

function emptyKey(obj) {
  for (var key in obj) {
    if (
      obj[key] == undefined ||
      obj[key] == null ||
      obj[key] == [] ||
      obj[key] == ""
    )
      throw "HASEMPTYFIELDS";
  }
}

// 0 - Not upload
// 1 - Pending
// 2 - Resolved
// 3 - Rejected
async function saveKYC(data, realmId, userId) {
  let filesID = [];
  let filesName = [];
  let filesSize = [];

  await emptyKey(data);

  for (const file of data.files) {
    await FileProvider.watermarkFile(file);
    filesID.push(file.code);
    filesSize.push(file.size);
    filesName.push(file.name);
  }

  data.user_id = userId;
  data.realm_id = realmId;
  data.file = filesID;
  data.file_name = filesName;
  data.file_size = filesSize;
  data.verified = 1;

  if (!["profile_kyc", "address_kyc", "company_kyc"].includes(data.var_kyc))
    throw "MODELNOTFOUND";

  let res = await db[data.var_kyc].create(data);

  if (res.dataValues == null) throw "NOTSAVED";

  return { success: true, kyc_id: res.dataValues.id };
}

async function rejectKYC(data) {
  if (!["profile_kyc", "address_kyc", "company_kyc"].includes(data.var_kyc))
    throw "MODELNOTFOUND";
  const resReject = await db[data.var_kyc].update(
    { verified: 3 },
    {
      where: { id: data.id },
    }
  );
  if (resReject)
    await db.user.update(
      { kyc: false },
      {
        where: { id: data.user_kyc_id },
      }
    );
  return { success: true };
}

async function resolveKYC(data) {
  if (!["profile_kyc", "address_kyc", "company_kyc"].includes(data.var_kyc))
    throw "MODELNOTFOUND";
  await db[data.var_kyc].update(
    { verified: 2 },
    {
      where: { id: data.id },
    }
  );

  let options = {
    where: { user_id: data.user_kyc_id },
    attributes: ["verified"],
  };
  const user_type = await db.user.findOne({
    where: { id: data.user_kyc_id },
  });
  const profile_status = await db.profile_kyc.findOne(options);
  const address_status = await db.address_kyc.findOne(options);
  const company_status = await db.company_kyc.findOne(options);

  if (
    user_type.type == 0 &&
    profile_status.verified == 2 &&
    address_status.verified == 2
  )
    await db.user.update(
      { kyc: true },
      {
        where: { id: data.user_kyc_id },
      }
    );

  if (
    user_type.type == 1 &&
    profile_status.verified == 2 &&
    address_status.verified == 2 &&
    company_status.verified == 2
  )
    await db.user.update(
      { kyc: true },
      {
        where: { id: data.user_kyc_id },
      }
    );

  return { success: true };
}

async function legalConfirmation(data, realmId, userId) {
  await db.user.update(
    { legal_confirmation: true },
    {
      where: { id: userId, realm: realmId },
    }
  );

  return { success: true };
}

async function generateVerificationCode(data, realmId, userId) {
  let verificationCode = crypto.randomBytes(6).toString("hex");
  let res = await db.user.findOne({
    where: { id: userId, realm: realmId },
  });
  await MemStore.set("usrcode" + res.dataValues.id, verificationCode, 300);

  return { success: true, code: verificationCode };
}

async function verifyPhone(data, realmId, userId) {
  let res = await db.user.findOne({
    where: { id: userId, realm: realmId },
  });
  let verificationCode = await MemStore.get("usrcode" + res.dataValues.id);
  if (data.code == verificationCode) {
    await db.user.update(
      { registred_using_bot: true },
      {
        where: { id: userId, realm: realmId },
      }
    );
    return { success: true };
  }

  throw "PHONENOTVERIFIED";
}

async function sendCode(data, realmId) {
  const res = await db.user.findOne({
    where: { login: data.email, realm: realmId },
  });

  let activateCode = randomize("Aa0", 10);
  data.activateCode = activateCode;

  if (res && res.dataValues) {
    data.code = "verify email";
    data.to = data.email;
    data.lang = arguments[7].lang;
    // data.channel = "email"
    await MemStore.set(activateCode, res.dataValues.id, 600);
    const { result } = await Queue.newJob("mail-service", {
      method: "send",
      data: data,
      realmId: realmId,
    });
    if (result == undefined) throw "MESSAGENOTSEND";
    return { success: true, code: activateCode };
  }
  throw "USERNOTFOUND";
}

async function verifyEmail(data, realmId) {
  let usrId = await MemStore.get(data.code);

  if (usrId) {
    await db.user.update(
      { activated: true },
      {
        where: { id: usrId, realm: realmId },
      }
    );
    await MemStore.del(data.code);
    return { success: true };
  }
  throw "LINKACTIVATED";
}

export default {
  saveProfileKYC,
  saveAddressKYC,
  saveCompanyKYC,
  resolveProfileKYC,
  resolveAddressKYC,
  resolveCompanyKYC,
  rejectProfileKYC,
  rejectAddressKYC,
  rejectCompanyKYC,
  legalConfirmation,
  generateVerificationCode,
  verifyPhone,
  sendCode,
  verifyEmail,
};
