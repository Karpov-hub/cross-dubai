import request from "request";
import db from "@lib/db";

const URL =
  process.env.NODE_ENV == "localtest"
    ? "http://localhost:8010/currency/minapi/"
    : "https://min-api.cryptocompare.com/data/price?fsym=EUR&tsyms=";

async function getData() {
  const cryptoCurrencies = await db.currency.findAll({
    where: {
      crypto: true
    },
    attributes: ["id", "abbr", "crypto"],
    raw: true
  });

  const requestCurr = cryptoCurrencies.map((curr) => curr.abbr).join(",");

  return new Promise((resolve, reject) => {
    request(URL + requestCurr, async (err, res, body) => {
      if (err) return reject(err);
      let result = [];
      try {
        body = JSON.parse(body, null, 4);
      } catch (e) {
        return reject(e);
      }

      if (cryptoCurrencies.length) {
        for (const curr of cryptoCurrencies) {
          const abbr = curr.abbr;
          if (body[abbr]) {
            result.push({ abbr, value: Number(1 / body[abbr]) });
            if (abbr == "USDT")
              result.push({ abbr: "USTR", value: Number(1 / body[abbr]) });
          }
        }
      }

      resolve(result);
    });
  });
}

export default {
  getData
};
