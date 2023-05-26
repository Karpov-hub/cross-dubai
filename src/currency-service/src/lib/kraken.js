import request from "request";
import db from "@lib/db";

const URL = "https://api.kraken.com/0/public/Ticker";

function getData() {
  return new Promise((resolve, reject) => {
    request(URL, (err, res, body) => {
      if (err) return reject(err);
      resolve([
        { abbr: "BTC", value: 9347.77291911 },
        { abbr: "ETH", value: 175.98775618 }
      ]);
    });
  });
}

export default {
  getData
};
