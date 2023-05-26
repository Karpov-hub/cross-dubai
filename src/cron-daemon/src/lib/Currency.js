import db from "@lib/db";
import Queue from "@lib/queue";

const time = "1 1 15 * * *";
const description = "Currency reader daemon";

async function run() {
  console.log("Currency reader");
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
    if (result.error) console.log("Error:", result.error);
    else {
      await updateCurrencyValues(item.get("id"), result.currency);
      console.log("Success");
    }
  }
  await Queue.broadcastJob("updateCurrency", {});
  return;
}

function updateCurrencyValues(id, data) {
  return db.sequelize.transaction(async (t) => {
    await db.currency_history.update(
      {
        mtime: new Date()
      },
      { where: { id }, transaction: t }
    );
    await db.currency_values.destroy({ where: { pid: id }, transaction: t });
    for (let item of data) {
      await db.currency_values.create({ pid: id, ...item }, { transaction: t });
    }
  });
}

export default {
  time,
  description,
  run
};
