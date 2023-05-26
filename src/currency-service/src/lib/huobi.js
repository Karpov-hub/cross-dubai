import request from "request";
import db from "@lib/db";

let URL;

async function getData() {
  let result = [];

  const cryptoCurrencies = await db.currency.findAll({
    where: {
      crypto: true
    },
    attributes: ["id", "abbr"]
  });

  return new Promise(async (resolve, reject) => {
    let res;
    for (const curr of cryptoCurrencies) {
      let currency = curr.abbr.toLowerCase();
      URL = `https://api.huobi.pro/market/history/kline?period=1min&size=1&symbol=${currency}usdt`;
      res = await sendRequest(URL, currency, result);
      result.push(res);
    }
    resolve(result);
  });
}

function sendRequest(URL, currency, result) {
  return new Promise((resolve, reject) => {
    request(URL, (err, res, body) => {
      if (err) return reject(err);

      try {
        body = JSON.parse(body, null, 4);
      } catch (e) {
        return reject(e);
      }

      console.log("body:", body);

      let hight = parseFloat(body.data[0].high);
      let low = parseFloat(body.data[0].low);
      let amount = (hight + low) / 2;
      resolve({ abbr: currency.toUpperCase(), value: amount });
    });
  });
}

export default {
  getData
};
