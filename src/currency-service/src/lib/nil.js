import db from "@lib/db";
import nil from "@lib/nil";

async function getData() {
  return new Promise(async (resolve, reject) => {
    let result = [];
    const currenciesList = await db.currency.findAll({
      raw: true
    });

    let usdt = 0;
    if (currenciesList.length) {
      let usdValues = await getValues({ abbr: "USD", crypto: false });

      usdt = Number(usdValues.price);
      result.push({ abbr: "USD", value: 1 });
      result.push({ abbr: "USDT", value: usdt });
      result.push({ abbr: "USTR", value: usdt });
      result.push({ abbr: "USDC", value: usdt });
      result.push({ abbr: "DOT", value: 1 });

      for (const curr of currenciesList) {
        if (
          curr.abbr != "USD" &&
          curr.abbr != "USDT" &&
          curr.abbr != "USTR" &&
          curr.abbr != "USDC" &&
          curr.abbr != "DOT"
        ) {
          let item = await getValues(curr);
          let value;
          if (curr.crypto) value = Number(item.price) / usdt;
          else value = (usdt * 1) / Number(item.price);
          result.push({ abbr: curr.abbr, value });
        }
      }
    }
    resolve(result);
  });
}

async function getValues(curr) {
  let abbr = curr.abbr;
  let currObj = "";

  if (curr.crypto) currObj = `${abbr}UST.SPOT`;
  else currObj = `UST${abbr}.SPOT`;

  const res = await nil.instrument(currObj, abbr);

  return res;
}

export default {
  getData
};
