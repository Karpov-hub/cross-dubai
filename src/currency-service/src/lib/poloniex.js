import request from "request";
import db from "@lib/db";

const URL =
  process.env.NODE_ENV == "localtest"
    ? "http://localhost:8010/currency/poloniex/"
    : "https://poloniex.com/public?command=returnTicker";

function getData() {
  return new Promise((resolve, reject) => {
    request(URL, async (err, res, body) => {
      if (err) return reject(err);

      let result = [];

      try {
        body = JSON.parse(body, null, 4);
      } catch (e) {
        return reject(e);
      }

      const cryptoCurrencies = await db.currency.findAll({
        where: {
          crypto: true
        },
        attributes: ["id", "abbr", "crypto"]
      });

      if (cryptoCurrencies.length) {
        for (const curr of cryptoCurrencies) {
          const abbr = curr.get("abbr");
          const currObj = "USDC_" + abbr;
          if (body[currObj]) {
            result.push({ abbr, value: Number(body[currObj].last) });
            if (abbr == "USDT")
              result.push({ abbr: "USTR", value: Number(body[currObj].last) });
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
