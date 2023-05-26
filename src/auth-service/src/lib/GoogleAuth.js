import QRCode from "qrcode";
import speakeasy from "speakeasy";
import db from "@lib/db";

async function googleAuthGenerateQR(data, realmId, userId) {
  const res = await db.user.findOne({
    where: { id: userId, realm: realmId },
    raw: true,
    attributes: ["email", "google_auth"]
  });

  if (res.google_auth === true) return;

  const secret = await speakeasy.generateSecret({
    length: 10,
    name: `cr.money (${res.email})`
  });

  const qr = await QRCode.toDataURL(secret.otpauth_url);

  await db.user.update(
    { base32secret: secret.base32 },
    {
      where: { id: userId, realm: realmId }
    }
  );

  return { success: true, qr_code: qr, secret_key: secret.base32 };
}

async function googleAuthVerify(data, realmId, userId) {
  const res = await db.user.findOne({
    where: { id: userId, realm: realmId },
    raw: true,
    attributes: ["id", "base32secret"]
  });

  if (!data.user_token) throw "USERTOKENISEMPTY";

  if (res && res.base32secret != undefined) {
    const base32secret = res.base32secret;
    const verified = speakeasy.totp.verify({
      secret: base32secret,
      encoding: "base32",
      token: data.user_token,
      window: 10
    });

    if (verified) {
      return { success: true, verified: verified };
    }

    throw "NOTVERIFIED";
  }
  throw "ERROR";
}

async function enableDisableGoogleAuth(data, realmId, userId) {
  let isVerified = await googleAuthVerify(data, realmId, userId);

  if (!isVerified.verified) {
    throw "NOTVERIFIED";
  }

  if (isVerified.verified) {
    await db.user.update(
      data.status
        ? { google_auth: true, otp_transport: "google authenticator" }
        : { google_auth: false, base32secret: null, otp_transport: "email" },
      {
        where: { id: userId, realm: realmId }
      }
    );
    return { success: true };
  }
}

export default {
  googleAuthGenerateQR,
  googleAuthVerify,
  enableDisableGoogleAuth
};
