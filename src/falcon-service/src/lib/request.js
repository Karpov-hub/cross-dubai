import request from "request";
import config from "@lib/config";

async function sendRequest(data) {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: config.b2c2_host + data.request.path,
        method: data.request.method,
        headers: {
          Authorization: config.b2c2_api_token
        },
        json: data.json
      },
      (error, response, body) => {
        if (!error) resolve(body);
        reject(error);
      }
    );
  });
}

async function sendCursorRequest(path) {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: config.b2c2_host + path,
        method: "GET",
        headers: {
          Authorization: config.b2c2_api_token
        },
        json: {}
      },
      (error, response, body) => {
        if (!error) resolve({ link: response.caseless.dict.link, body });
        reject(error);
      }
    );
  });
}

export default {
  sendRequest,
  sendCursorRequest
};
