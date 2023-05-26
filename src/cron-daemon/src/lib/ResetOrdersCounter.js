import db from "@lib/db";

const time = "0 0 0 1 1 *"; // At 12:00 AM, on day 1 of the month, only in January
const description = "Reset order's num for user";

async function run() {
  console.log("Reset order's num for user");
  await db.sequelize.query(`update users set order_counter = 0`, {
    type: db.sequelize.QueryTypes.UPDATE
  });
  return;
}

export default {
  time,
  description,
  run
};
