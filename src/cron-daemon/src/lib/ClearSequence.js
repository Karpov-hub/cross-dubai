import db from "@lib/db";

const time = "0 0 * * *";
const description = "Clear sequence";

async function run(jobId, checkRecord) {
  await db.sequelize.query(
    `ALTER SEQUENCE invoice_contractor_seq RESTART WITH 1`
  );
  return;
}

export default {
  time,
  description,
  run
};
