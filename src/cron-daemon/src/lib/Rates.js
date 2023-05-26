import db from "@lib/db";
import Queue from "@lib/queue";
import uuid from "uuid/v4";

const time = "*/20 * * * * *"; //"1 1 * * * *";
const description = "Rates reader daemon";

async function run() {
  const currencySet = await db.currency_history.findAll({
    where: { active: true },
    attributes: ["id", "service"]
  });
  for (let item of currencySet) {
    let { result } = await Queue.newJob("currency-service", {
      method: "getRates",
      data: { service: item.get("service") }
    });
    if (!result) return;
    if (result && result.error) console.log("Error:", result.error);
    else {
      await createCurrencyValues(item.get("id"), result.currency);
    }
  }
  await Queue.broadcastJob("updateCurrency", {});
}

function createCurrencyValues(id, data) {
  return db.sequelize.transaction(async (t) => {
    for (let item of data) {
      let insert_data = {
        id: uuid(),
        stime: Date.now(),
        abbr: item.abbr,
        value: item.value
      };
      await db.currency_rate.create(insert_data, { transaction: t });
    }
  });
}

export default {
  time,
  description,
  run
};
