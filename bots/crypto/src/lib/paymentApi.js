import request from "request";
import config from "config";

const realmToken = process.env.REALM_TOKEN || config.realm;

function callService(service, method, data) {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: config.apiUrl,
        method: "POST",
        headers: {
          authorization: "bearer" + realmToken
        },
        json: {
          header: {
            id: 0,
            version: config.apiVersion,
            service,
            method
          },
          data
        }
      },
      (error, response, body) => {
        if (body.data) resolve(body.data);
        else reject(body.error);
      }
    );
  });
}

export default {
  callService
};
