import axios from "axios";

let token;

async function authorisation() {
  const res = await axios({
    method: "post",
    url: "https://sms.jooksms.com/api/v1/oauth/access_token",
    data: {
      client_id: process.env.SMS_CLIENT_ID,
      client_secret: process.env.SMS_CLIENT_SECRET
    }
  });

  if (res && res.data && res.data.access_token) {
    token = res.data.access_token;
    return;
  }
  throw "SMSGATEWAYACCESSERROR";
}

async function callApi(phone, text) {
  return await axios({
    method: "post",
    url: "https://sms.jooksms.com/api/v1/sms/",
    headers: { Authorization: `Bearer ${token}` },
    data: {
      to: phone,
      from: "111",
      body: text
    }
  });
}

async function send(phone, text) {
  if (!process.env.SMS_CLIENT_ID || !process.env.SMS_CLIENT_SECRET) {
    return { result: "SMS GATEWAY is disabled" };
  }

  if (!token) await authorisation();
  let res = await callApi(phone, text);

  if (!res.data || res.data.result != "ok") {
    await authorisation();
    res = await callApi(phone, text);
    if (!res.data || res.data.result != "ok") {
      console.log(res);
      throw "SMSGATEWAYERROR";
    }
  }
  return res.data;
}

export default {
  send
};
