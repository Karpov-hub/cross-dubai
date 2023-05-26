import db from "@lib/db";
import moment from "moment";

const Op = db.Sequelize.Op;

async function renewalContracts(data) {
  let start =
    moment()
      .subtract(1, "days")
      .startOf("day")
      .format("YYYY-MM-DD") + " 00:00:00";
  let end = moment()
    .subtract(1, "days")
    .endOf("day")
    .format("YYYY-MM-DD hh:mm:ss");

  let contracts = await db.contract.findAll({
    where: {
      expiration_date: getDateConditions(start, end)
    },
    attributes: ["id", "automatic_renewal"],
    raw: true
  });

  let terminated_contracts = [];
  let extended_contracts = [];

  for (const contract of contracts) {
    if (contract.automatic_renewal) extended_contracts.push(contract.id);
    else terminated_contracts.push(contract.id);
  }

  await extendContract(extended_contracts);
  await terminateContract(terminated_contracts);

  return { success: true };
}

async function extendContract(extended_contracts) {
  let new_exp_date = moment()
    .subtract(1, "days")
    .add(1, "Y")
    .startOf("day")
    .format("YYYY-MM-DD hh:mm:ss");

  await db.contract.update(
    { expiration_date: new_exp_date },
    { where: { id: { [Op.in]: extended_contracts } } }
  );
}

async function terminateContract(terminated_contracts) {
  await db.contract.update(
    { status: 2 },
    { where: { id: { [Op.in]: terminated_contracts } } }
  );
}

function getDateConditions(date_from, date_to) {
  const out = {};
  out[Op.gte] = date_from;
  out[Op.lte] = date_to;
  return out;
}

export default {
  renewalContracts
};
