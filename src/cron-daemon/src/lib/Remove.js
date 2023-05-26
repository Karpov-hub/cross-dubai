import db from "@lib/db";

const time = "0 0 */1 * * *";
const description = "Table cleaner";

async function run() {
  await db.currency_rate.destroy({ truncate: true, cascade: true });
  return;
}

export default {
  time,
  description,
  run
};
