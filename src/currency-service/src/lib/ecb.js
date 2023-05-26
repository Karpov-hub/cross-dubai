import request from "request";
import db from "@lib/db";
import { parseString } from "xml2js";

const URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";

async function prepareData(data) {
  const CurrenciesList = await db.currency.findAll({
    attributes: ["id", "abbr"]
  });
  let Currencies = {};
  CurrenciesList.forEach((item) => {
    Currencies[item.abbr] = true;
  });
  let result = [{ abbr: "EUR", value: 1 }];
  data.forEach((item) => {
    if (Currencies[item.$.currency]) {
      let val = parseFloat(item.$.rate);
      result.push({
        abbr: item.$.currency,
        value: 1 / parseFloat(item.$.rate)
      });
    }
  });
  return result;
}

function getData() {
  return new Promise((resolve, reject) => {
    request(URL, async (err, res, body) => {
      if (err) return reject(err);
      parseString(body, async (err, result) => {
        if (
          result &&
          result["gesmes:Envelope"] &&
          result["gesmes:Envelope"]["Cube"] &&
          result["gesmes:Envelope"]["Cube"][0] &&
          result["gesmes:Envelope"]["Cube"][0]["Cube"] &&
          result["gesmes:Envelope"]["Cube"][0]["Cube"][0] &&
          result["gesmes:Envelope"]["Cube"][0]["Cube"][0]["Cube"]
        ) {
          const resData = await prepareData(
            result["gesmes:Envelope"]["Cube"][0]["Cube"][0]["Cube"]
          );
          resolve(resData);
        } else {
          reject("ECBXMLERROR");
        }
      });
    });
  });
}

export default {
  getData
};
