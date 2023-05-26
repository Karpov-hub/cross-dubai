import account from "./account";
import Transfer from "./transfer";
import db from "@lib/db";
import Queue from "@lib/queue";
import { CONN_CLOSED } from "nats";
import config from "@lib/config";
const Op = db.Sequelize.Op;

async function getTransferData(data, realm_id) {
  const user_id = await account.checkAccountNoForRealm(data.acc_no, realm_id);
  if (!user_id) throw "THEREISNTUSERACCOUNT";

  const amount = parseFloat(data.amount);
  if (isNaN(amount)) throw "AMOUNTISNAN";

  if (data.files) {
    data.options.files = data.files;
  }
  const options = {};
  if (data.wallet) options.wallet = data.wallet;
  if (data.iban) options.iban = data.iban;

  let out = {
    owner: user_id,
    ref_id: data.ref_id,
    transfer_type: "withdrawal",
    acc_dst: data.acc_tech,
    acc_src: data.acc_no,
    amount,
    description: data.description,
    options,
    comission_subject:
      data.options && data.options.reciever_commision ? "dst" : "src"
  };

  return out;
}

async function checkBalance(data) {
  let account = await db.account.findOne({
    where: {
      acc_no: data.acc_no
    },
    attributes: ["currency", "balance"],
    raw: true
  });

  let amount = 0;

  if (data.currency != account.currency) {
    let curr_val = await db.currency_values.findOne({
      where: {
        abbr: data.currency
      },
      attributes: ["value"],
      raw: true
    });

    amount = curr_val.value * data.amount;
  }

  if (account.balance < amount) throw "NOTENOUGHMONEYINTHEACCOUNT";
  return;
}

async function withdrawal(data, realm_id, userId, transactions, hooks) {
  // console.log("withdrawal:", data);

  let tech_acc = await account.getTechAccByMerchant(
    data.acc_no,
    realm_id,
    userId
  );

  tech_acc = tech_acc.filter((acc) => acc.currency == data.res_currency);
  data.acc_tech = tech_acc[0].acc_no;
  data.exchange_rate = data.exchange_rate
    ? data.exchange_rate.exchange_rate
    : null;

  // await checkBalance(data);

  let exchange_rate = null;
  let currency = await db.currency_rate.findAll({
    where: {
      abbr: data.currency
    },
    limit: 4,
    order: [["stime", "DESC"]],
    raw: true
  });
  if (data.manualProcessing) {
    let res_currency = await db.currency_rate.findAll({
      where: {
        abbr: data.res_currency
      },
      limit: 4,
      order: [["stime", "DESC"]],
      raw: true
    });

    let i = 0;
    for (const curr of currency) {
      let rate = curr.value * (1 / res_currency[i].value);
      if (rate == data.exchange_rate) exchange_rate = rate;
      i++;
    }

    if (!exchange_rate) throw "WRONGEXCHANGERATE";
  }
  const merchant = await db.merchant.findOne({
    where: { id: data && data.merchant_id ? data.merchant_id : userId },
    raw: true
  });

  const out = {
    ref_id: data.ref_id,
    acc_tech: data.acc_tech,
    acc_no: "",
    description: data.description,
    amount: data.amount,
    currency: data.currency,
    to_currency: data.res_currency,
    country: data.country,
    use_stock: true,
    merchant: merchant ? merchant.id : null,
    custom_exchange_rate: exchange_rate,
    iban: data.iban,
    wallet: data.wallet
  };

  out.acc_no = await getMerchantAccByCurrency(data.merchant_id, out.currency);

  let rateToUSD = currency.find((el) => {
    return el.abbr == data.currency;
  });
  if (data.amount * rateToUSD.value < config.nilLimitInUSD)
    out.deferred_transfer = true;

  const res = await Queue.newJob("account-service", {
    method: "withdrawalCustomExchangeRate",
    data: out,
    realmId: realm_id,
    userId,
    scope: "account-service"
  });
  if (res.error) throw res.error.code ? res.error.code : res.error;
  return res.result;
}

async function getMerchantAccByCurrency(merchant_id, currency) {
  const accounts = await db.sequelize.query(
    "SELECT a.acc_no FROM accounts a, merchant_accounts m WHERE m.id_merchant=:merchant_id and a.id=m.id_account and a.currency=:currency",
    {
      replacements: { merchant_id, currency },
      raw: true,
      type: db.Sequelize.QueryTypes.SELECT
    }
  );
  if (accounts && accounts[0]) return accounts[0].acc_no;
  return null;
}

async function getMerchantAccBalanceByCurrency(data, realm, user) {
  const accounts = await db.sequelize.query(
    "SELECT a.balance, c.crypto FROM accounts a, currency c, merchant_accounts m WHERE m.id_merchant=:merchant_id and a.id=m.id_account and a.currency=:currency and c.abbr=:currency",
    {
      replacements: {
        merchant_id: data.merchant_id,
        currency: data.currency,
        abbr: data.currency
      },
      raw: true,
      type: db.Sequelize.QueryTypes.SELECT
    }
  );
  if (accounts && accounts[0]) {
    if (accounts[0].crypto) return parseFloat(accounts[0].balance).toFixed(8);
    return parseFloat(accounts[0].balance).toFixed(2);
  }

  return [];
}

async function isCrypto(abbr) {
  const curr = await account.checkCurrency(abbr);
  return curr ? !!curr.crypto : false;
}

async function getExchangeRate(data, realmId, userId) {
  if (data.use_stock) {
    return await getExchangeRateOnStock(data, realmId, userId);
  }
  return await getExchangeRateInside(data, realmId, userId);
}

async function getExchangeRateOnStock(data, realmId, userId) {
  const res = await Queue.newJob(
    "ccoin-service",
    {
      method: "getExchangeRate",
      data: {
        currency_from: data.currency,
        currency_to: data.to_currency,
        amount: data.amount
      },
      realmId,
      userId
    },
    -1
  );
  return res && res.result ? res.result : null;
}

async function getExchangeRateInside(data, realmId, userId) {
  const amount = await account.exchange(
    data.amount,
    data.currency,
    data.to_currency
  );
  return amount
    ? {
        price: data.amount / amount,
        valid_until: new Date()
      }
    : null;
}

async function cryptoStockSend(data, realmId, userId) {
  const res = await Queue.newJob(
    "ccoin-service",
    {
      method: "send",
      data,
      realmId,
      userId
    },
    -1
  );
  return res;
}

async function cryptoSkSend(data, realmId, userId) {
  // console.log("cryptoSkSend:", data);

  const res = await Queue.newJob(
    "ccoin-service",
    {
      method: "sendFromSk",
      data,
      realmId,
      userId
    },
    -1
  );
  return res;
}

async function cryptoMonitoringSkNil(data, realmId, userId) {
  const res = await Queue.newJob(
    "ccoin-service",
    {
      method: "sendFromMonitoringToNilViaSk",
      data,
      realmId,
      userId
    },
    -1
  );
  return res;
}

async function calculateAmount(tx) {
  const { result } = await Queue.newJob("ccoin-service", {
    method: "calculateAmount",
    data: tx
  });
  return result ? result.amount : 0;
}

function prepareTxList(tx, custom_exchange_rate, currency, to_currency) {
  tx.forEach((t, i) => {
    if (t.currency == currency && t.exchange_currency == to_currency) {
      tx[i].exchange_amount = t.amount * custom_exchange_rate;
    }
  });
}

function prepareQueries(queries, data) {
  let distAccounts = {};
  queries.list.forEach((q, i) => {
    if (q.model == "transaction" && q.data.currency_dst == data.to_currency) {
      queries.list[i].data.exchange_amount =
        q.data.amount * data.custom_exchange_rate;
      if (!q.data.held) {
        if (!distAccounts[q.data.acc_dst]) distAccounts[q.data.acc_dst] = 0;
        distAccounts[q.data.acc_dst] += queries.list[i].data.exchange_amount;
      }
    } else if (q.model == "account" && q.action == "increment") {
      if (distAccounts[q.where.acc_no])
        queries.list[i].data.balance = distAccounts[q.where.acc_no];
    }
  });
}

async function getOrganisationName(id) {
  const res = await db.merchant.findOne({
    where: { id },
    attributes: ["name"],
    raw: true
  });
  return res ? res.name : null;
}

async function checkAccBalance(acc_no, amount) {
  const acc = await db.account.findOne({
    where: { acc_no },
    raw: true,
    attributes: ["balance", "overdraft"]
  });
  if (!acc) throw "ACCOUNTNOTFOUND:" + acc_no;

  amount = Number(amount);

  if (acc.balance < amount + (acc.overdraft || 0))
    throw {
      code: "INSUFFICIENTBALANCE",
      balance: acc.balance,
      message:
        "Insufficient client account balance. Transfer cannot be processed."
    };
}

/** *
 * Only for first time using
 * The method gets exchange rate from input data
 */

async function withdrawalCustomExchangeRate(
  data,
  realmId,
  userId,
  transactions,
  hooks,
  scope,
  operation,
  dataHeaders,
  variables
) {
  const techAccount = data.acc_tech;

  if (data.variables) {
    data.variables.forEach((v) => variables.push(v));
  }

  await checkAccBalance(data.acc_no, data.amount);
  if (data.merchant)
    data.organisation_name = await getOrganisationName(data.merchant);

  if (!data.custom_exchange_rate && data.to_currency != data.currency) {
    const exData = await getExchangeRate(data, realmId, userId);
    data.custom_exchange_rate = exData.price;
    data.valid_until = exData.valid_until;
    if (data.custom_exchange_rate)
      data.custom_exchange_rate = 1 / data.custom_exchange_rate;
  }
  hooks.onTariffCompleted = async (result, transfer, queries) => {
    if (data.custom_exchange_rate) {
      prepareTxList(
        transfer.list,
        data.custom_exchange_rate,
        data.currency,
        data.to_currency
      );
      prepareQueries(queries, data);
      queries.transfer.data.data.finAmount = await calculateAmount(
        transfer.list
      );
      queries.transfer.data.deferred = data.deferred_transfer;
    }
  };

  hooks.beforeSendResult = async (result, transfer, tx) => {
    prepareTxList(
      tx,
      data.custom_exchange_rate,
      data.currency,
      data.to_currency
    );
    result.options = techAccount.details;
    if (transfer) result.id = transfer.get("id");

    data.transfer = transfer;
    data.tx = tx;

    let cryptoResult;

    if (await isCrypto(data.currency)) {
      cryptoResult = await cryptoMonitoringSkNil(data, realmId, userId);
      result.cryproTx = cryptoResult.result;
    } else {
      if (await isCrypto(data.to_currency)) {
        if (data.use_stock || data.deferred_transfer) {
          cryptoResult = await cryptoStockSend(data, realmId, userId);
        } else {
          cryptoResult = await cryptoSkSend(data, realmId, userId);
        }

        result.cryproTx = cryptoResult.result;
        if (cryptoResult.error && cryptoResult.error == "CRYPTOEXCHANGEFAULT") {
          Transfer.rollback(
            {
              transfer_id: transfer.id
            },
            realmId
          );
        }
      }
    }
  };

  return await getTransferData(data, realmId);
}

async function sendFromMonitoringToNilViaSk(data, realm, user) {
  console.log("sendFromMonitoringToNilViaSk:", data);

  return;
}

async function checkWithdrawalToBank(data) {
  // const curr_abbr = data.items._arr[data.items._arr.length - 1].currency;

  // const rate = await Queue.newJob("currency-service", {
  //   method: "getLatestRates",
  //   data: {
  //     currency: curr_abbr,
  //     res_currency: "USD"
  //   }
  // });

  // if (data.data.amount * rate.result < config.nilLimitInUSD)
  //   return {
  //     result: "Error",
  //     message: "Cannot be withdrawn"
  //   };

  for (const plan_var of data.data.variables) {
    if (plan_var.key == "NIL_BANK_ACCOUNT" && !plan_var.value)
      return {
        result: "Error",
        message: "Variable NIL_BANK_ACCOUNT is not set"
      };
  }

  return { result: "OK" };
}

export default {
  withdrawal,
  withdrawalCustomExchangeRate,
  getMerchantAccBalanceByCurrency,
  sendFromMonitoringToNilViaSk,
  checkWithdrawalToBank
};
