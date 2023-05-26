import db from "@lib/db";
import axios from "axios";
import config from "@lib/config";
import sha256 from "sha256";

async function getApiByAbbr(abbr) {
  const res = await db.currency.findOne({
    where: { abbr },
    raw: true,
    attributes: ["api", "apitoken"]
  });
  return res;
}

async function sendPostRequest(api, action, data) {
  const opt = {};

  if (!api) throw "POSTPARAMAPIEMPTY";

  if (api.apitoken)
    opt.headers = {
      Authorization: api.apitoken
    };

  const res = await axios.post(`${api.api}${action}`, data, opt);

  if (!["localtest", "test"].includes(process.env["NODE_ENV"])) {
    try {
      await db.logs_crypto.create({
        url: api.api,
        action,
        data: JSON.stringify(data),
        response: JSON.stringify(res.data)
      });
    } catch (error) {
      console.log("CATCH ERROR SAVING SENDPOSTREQUEST");
    }
  }

  return res;
}

async function sendGetRequest(api, action, params, timeout) {
  const opt = {};
  if (api.apitoken)
    opt.headers = {
      Authorization: api.apitoken
    };

  if (params) opt.params = params;
  if (timeout) opt.timeout = timeout;
  const res = await axios.get(`${api.api}${action}`, opt);
  if (!["localtest", "test"].includes(process.env["NODE_ENV"])) {
    try {
      await db.logs_crypto.create({
        url: api.api,
        action,
        data: "",
        response: JSON.stringify(res.data)
      });
    } catch (error) {
      console.log("CATCH ERROR SAVING SENDGETREQUEST");
    }
  }

  return res;
}

function sign(data, secretKey) {
  let s = "";
  for (let key in data) {
    s += data[key];
  }
  s += secretKey || config.cryptoMasterKey;
  return Buffer.from(sha256(s, { asBytes: true })).toString("base64");
}

export default {
  sign,
  sendGetRequest,
  sendPostRequest,
  getApiByAbbr
};
