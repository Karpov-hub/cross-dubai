import db from "@lib/db";
import Queue from "@lib/queue";
import uuid from "uuid/v4";

const Op = db.Sequelize.Op;

async function fixingBalances(data) {
  const sk_balances = await Queue.newJob("ccoin-service", {
    method: "getSKBalance",
    data: {}
  });
  const nil_balances = await Queue.newJob("falcon-service", {
    method: "getBalance",
    data: {}
  });

  const deposits_on_hold = await _getHeldDeposits();
  const ready_to_payout = await _getReadyToPayoutBalances();
  const totals = await _getTotals(deposits_on_hold, ready_to_payout);

  const balancesData = {
    id: uuid(),
    sk_balances,
    nil_balances,
    deposits_on_hold: { result: deposits_on_hold },
    ready_to_payout: { result: ready_to_payout },
    doh_totals: totals.doh_totals,
    rtp_totals: totals.rtp_totals
  };

  await db.daily_balance.create(balancesData);

  return { success: true };
}

async function _getTotals(deposits_on_hold, ready_to_payout) {
  let doh_totals = {};
  let rtp_totals = {};

  for (const record of deposits_on_hold) {
    record.deposits.forEach((item) => {
      if (!doh_totals[item.currency]) doh_totals[item.currency] = 0;
      doh_totals[item.currency] += item.amount;
    });
  }

  for (const record of ready_to_payout) {
    if (!rtp_totals[record.currency]) rtp_totals[record.currency] = 0;
    rtp_totals[record.currency] += parseFloat(record.balance);
  }

  return { doh_totals, rtp_totals };
}

async function _getReadyToPayoutBalances() {
  let merchants_id = await _getMerchantsId();

  return await _getMerchantAccounts({
    merchants: merchants_id
  });
}

async function _getMerchantAccounts(data) {
  let replacements = {};
  let out = [];
  let merchants = null;

  let listCurrencyDecimal = await Queue.newJob("merchant-service", {
    method: "getListCurrencyDecimal",
    data: {}
  });

  if (data && data.merchants && data.merchants.length)
    merchants = data.merchants
      .join(",")
      .split(",")
      .map((word) => `'${word.trim()}'`)
      .join(",");

  const sql = `select a.currency, a.balance, ma.id_merchant
      from accounts a
      left join merchant_accounts ma on (a.id=ma.id_account ${
        merchants ? `and ma.id_merchant in (${merchants})` : ""
      })
      left join account_crypto ac on a.acc_no = ac.acc_no where a.balance > 0 and a.status = 1`;

  const accounts = await db.sequelize.query(sql, {
    replacements,
    raw: true,
    type: db.Sequelize.QueryTypes.SELECT
  });

  if (accounts && accounts.length) {
    for (const acc of accounts) {
      if (!!acc.id_merchant) {
        acc.balance = Number(acc.balance).toFixed(
          listCurrencyDecimal.result[acc.currency]
        );
        if (Number(acc.balance) > 0) out.push(acc);
      }
    }
    return out;
  }
  return [];
}

async function _getHeldDeposits() {
  let res = await db.transfer.findAll({
    where: {
      held: true,
      canceled: false,
      event_name: "account-service:deposit"
    },
    attributes: ["data"],
    raw: true
  });

  let data = [];
  res.forEach((item) => {
    let merchant = item.data.merchant
      ? item.data.merchant
      : item.data.merchant_id;

    let user = item.user_id ? item.user_id : item.data.userId;

    data.push({
      merchant_id: merchant,
      group_id: user,
      amount: item.data.amount,
      currency: item.data.currency
    });
  });

  data = await _removeInactive(data);
  const out = {};

  data.forEach((item) => {
    if (!out[item.merchant_id]) out[item.merchant_id] = {};
    if (!out[item.merchant_id][item.currency])
      out[item.merchant_id][item.currency] = 0;
    out[item.merchant_id][item.currency] += item.amount;
  });

  return Object.keys(out).map((key) => {
    return {
      merchant_id: key,
      deposits: Object.keys(out[key]).map((key1) => {
        return { currency: key1, amount: out[key][key1] };
      })
    };
  });
}

async function _removeInactive(data) {
  let out = [];
  for (const tx of data) {
    let merchant = await db.merchant.findOne({
      where: { id: tx.merchant_id },
      attributes: ["active"],
      raw: true
    });
    let user = await db.user.findOne({
      where: { id: tx.group_id },
      attributes: ["activated"],
      raw: true
    });

    if (user.activated && merchant.active) out.push(tx);
  }

  return out;
}

async function _getMerchantsId() {
  const users = await db.user.findAll({
    where: {
      activated: true
    },
    attributes: ["id"],
    raw: true
  });

  const userIds = users.map((item) => item.id);

  let merchants = await db.merchant.findAll({
    where: {
      active: true,
      user_id: {
        [Op.in]: userIds
      }
    },
    attributes: ["id"],
    raw: true
  });

  let out = [];
  for (const merchant of merchants) {
    out.push(merchant.id);
  }
  return out;
}

async function syncBalances(data) {
  await db.sequelize.query(
    `update accounts set overdraft=-1 where overdraft=0`,
    {
      type: db.sequelize.QueryTypes.UPDATE
    }
  );
  await db.sequelize.query(
    `update accounts a set balance=(select sum(exchange_amount) from transactions where acc_dst=a.acc_no and canceled=false and held=false) - (select sum(amount) from transactions where acc_src=a.acc_no and canceled=false)`,
    {
      type: db.sequelize.QueryTypes.UPDATE
    }
  );
  await db.sequelize.query(
    `update accounts set balance=0 where balance is NULL`,
    {
      type: db.sequelize.QueryTypes.UPDATE
    }
  );

  return { success: true };
}

async function testCheck(data) {
  const account = await db.account.findOne({
    where: { acc_no: data.items._arr[0].acc_no },
    attributes: ["balance"],
    raw: true
  });
  if (account && account.balance >= data.data.amount) return { result: "OK" };
  if (!account)
    return {
      result: "Error",
      message: `Account ${data.items._arr[0].acc_no} not found`
    };
  return { result: "Error", message: "incufficient balance" };
}

async function checkAccountBalance(data) {
  const account = await db.account.findOne({
    where: { acc_no: data.items._arr[0].acc_no },
    raw: true,
    attributes: ["balance", "overdraft"]
  });
  if (!account)
    return {
      result: "Error",
      message: `Account ${data.items._arr[0].acc_no} not found`
    };

  const amount = Number(data.data.amount);

  if (account.balance < amount + (account.overdraft || 0))
    return {
      result: "Error",
      message:
        "Insufficient client account balance. Transfer cannot be processed."
    };

  return { result: "OK" };
}

async function checkNilBalance(data) {
  let ignore_nil_check = "";

  for (const plan_var of data.data.variables) {
    if (plan_var.key == "IGNORE_NIL_CHECK") ignore_nil_check = plan_var.value;
  }

  if (ignore_nil_check.toLowerCase() == "yes") return { result: "OK" };

  const nilBalance = await _getNilBalance(data.items._arr[0].currency);

  const amount = Number(data.data.amount);
  const nilBalanceAmount = Number(nilBalance.balance);

  if (amount > nilBalanceAmount)
    return {
      result: "Error",
      message:
        "Nil balance is insufficient, this transfer will turn the Nil balance to negative. If want to proceed change payment settings"
    };

  return { result: "OK" };
}

async function _getNilBalance(currency) {
  const NIL_CURRENCY_ALIAS = {
    USDT: "UST",
    USDC: "USC"
  };

  const curr = await db.currency.findOne({
    where: { abbr: currency },
    raw: true
  });

  const { result } = await Queue.newJob("falcon-service", {
    method: "getBalance",
    data: {}
  });

  return {
    currency: curr.abbr,
    balance: result[NIL_CURRENCY_ALIAS[curr.abbr] || curr.abbr]
  };
}

export default {
  syncBalances,
  fixingBalances,
  testCheck,
  checkAccountBalance,
  checkNilBalance
};
