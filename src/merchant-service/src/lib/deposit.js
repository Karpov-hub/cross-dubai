import db from "@lib/db";
import queue from "@lib/queue";

async function getDepositAccount(merchant_id, currency) {
  const accounts = await db.merchant_account.findAll({
    where: { id_merchant: merchant_id },
    include: [
      {
        model: db.account,
        attributes: ["acc_no", "currency", "status", "owner"]
      }
    ]
  });

  if (!accounts || !accounts.length) return null;

  for (let item of accounts) {
    if (
      item.account &&
      item.account.status == 1 &&
      item.account.currency == currency
    ) {
      return item.account.toJSON();
    }
  }
  return null;
}

async function checkRefIsset(user_id, ref_id) {
  const res = await db.transfer.findOne({
    where: {
      user_id,
      ref_id: `${ref_id}`
    }
  });
  return !!res;
}

async function deposit(data, realmId) {
  if (!data.merchant_id || !data.currency || !data.ref_id || !data.amount)
    throw "REQUESTFORMAT";

  const opt = {
    ref_id: data.ref_id,
    merchant: data.merchant_id,
    amount: parseFloat(data.amount),
    currency: data.currency,
    country: data.country,
    description: "Marchant payment"
  };

  const account = await getDepositAccount(data.merchant_id, data.currency);
  if (!account) throw "THEREISNTACCOUNT";
  opt.acc_no = account.acc_no;

  if (await checkRefIsset(account.owner, data.ref_id)) throw "REFIDEXISTS";
  const { result } = await queue.newJob("account-service", {
    method: "deposit",
    data: opt,
    realmId,
    userId: account.owner
  });
  return result;
}

export default {
  deposit
};
