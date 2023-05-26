import db from "@lib/db";

const Op = db.Sequelize.Op;

const time = "0 0 1 1 *";
// const time = "* * * * *"; //every 1 minute (for develop)
const description = "Clear one time proforma invoice numbers";

async function run() {
  console.log("Clear one time proforma invoice numbers");
  await db.realmdepartment.update(
    {
      ot_proforma_invoice_eur: 0,
      ot_proforma_invoice_usd: 0
    },
    {
      where: { removed: { [Op.not]: 1 } }
    }
  );
  await db.sequelize.query(`ALTER SEQUENCE deposit_invoice_eur RESTART WITH 1`);
  await db.sequelize.query(`ALTER SEQUENCE deposit_invoice_usd RESTART WITH 1`);
}

export default {
  time,
  description,
  run
};
