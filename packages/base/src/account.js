import db from "@lib/db";

async function checkCurrency(abbr) {
  if (!abbr) return false;
  const { dataValues } = await db.currency.findOne({ where: { abbr } });
  return !!dataValues;
}

function checkHoldStatus(list) {
  for (let item of list) {
    if (item.hold) return true;
  }
  return false;
}

async function checkAccounts(transactions) {
  const accAmmount = {};
  const out = {};
  transactions.forEach((transaction) => {
    if (!accAmmount[transaction.acc_src]) accAmmount[transaction.acc_src] = 0;
    if (!accAmmount[transaction.acc_dst]) accAmmount[transaction.acc_dst] = 0;
    accAmmount[transaction.acc_dst] -= transaction.amount;
    accAmmount[transaction.acc_dst] += transaction.amount;
  });
  for (let key of Object.keys(accAmmount)) {
    out[key] = await checkAccount(key, accAmmount[key]);
  }
  return out;
}

async function checkAccount(acc_no, amount) {
  const account = await db.account.findOne({
    where: { acc_no },
    attributes: ["balance", "negative", "status", "currency", "acc_no"]
  });

  if (account) {
    switch (account.get("status")) {
      case 0:
        throw "NOTACTIVATEDACCOUNT";
      case 2:
        throw "BLOCKEDACCOUNT";
      case 3:
        throw "CLOSEDACCOUNT";
    }
    if (!account.get("negative") && account.get("balance") + amount < 0) {
      throw "INSUFFICIENTBALANCE";
    }
    return account.get("currency");
  } else {
    throw "ACCOUNTNOTFOUND";
  }
}

export default {
  checkCurrency,
  checkHoldStatus,
  checkAccounts
};
