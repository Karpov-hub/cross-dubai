import request from "request";
import db from "@lib/db";

const URL =
  process.env.NODE_ENV == "localtest"
    ? "http://localhost:8010/currency/cbr/"
    : "https://www.cbr-xml-daily.ru/daily_json.js";

function getData() {
  return new Promise((resolve, reject) => {
    request(URL, async (err, res, body) => {
      if (err) return reject(err);

      try {
        body = JSON.parse(body);
      } catch (e) {
        return reject(e);
      }
      const USD = body.Valute.USD.Value;

      const CurrenciesList = await db.currency.findAll({
        attributes: ["id", "abbr"]
      });
      let Currencies = {};
      CurrenciesList.forEach((item) => {
        Currencies[item.abbr] = true;
      });

      let result = [];
      Object.keys(body.Valute).forEach((abbr) => {
        if (Currencies[abbr])
          result.push({
            abbr,
            value: body.Valute[abbr].Value / body.Valute[abbr].Nominal / USD
          });
      });
      result.push({ abbr: "RUR", value: 1 / USD });
      resolve(result);
    });
  });
}

export default {
  getData
};
