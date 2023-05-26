import db from "@lib/db";
import Queue from "@lib/queue";
import iban from "iban-generator";
import config from "@lib/config";
import nil from "@lib/nil";

const Op = db.Sequelize.Op;

let currentCurrency = {};

function setCurrentCurrency(data) {
  currentCurrency = data;
}

async function getRandomIban() {
  let acc_no, res;
  do {
    acc_no = iban.randomNumber();
    res = await db.account.findOne({ where: { acc_no } });
  } while (res);
  return acc_no;
}

async function create(data, realm, user) {
  let now = new Date();

  const curr = await checkCurrency(data.currency);
  if (!curr.res) throw "CURRENCYUNDEFINED";

  const crypto = curr.crypto;

  const acc_no = await getRandomIban();

  const acc_sequence = await db.sequelize.query(
    `SELECT nextval('accounts_seq')`,
    {
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  let wallet_name = String(acc_sequence[0].nextval).padStart(8, "0");

  let res;
  try {
    res = await db.account.create({
      acc_no,
      acc_name: data.acc_name,
      easy_acc_name: crypto ? "RC" + wallet_name : "RF" + wallet_name,
      currency: data.currency,
      owner: user,
      balance: 0,
      status: data.status || 1,
      negative: data.negative || false,
      overdraft: data.overdraft || 0,
      ctime: now,
      mtime: now,
      removed: 0,
      maker: realm
    });
  } catch (e) {
    await db.sequelize.query(
      `SELECT setval('accounts_seq', ${acc_sequence[0].nextval}, false);`
    );
    throw "INCORRECTDATA";
  }
  if (curr.crypto) {
    let acc_data = res.toJSON();
    if (data.address) acc_data.address = data.address;
    acc_data.wallet_type = data.wallet_type || 0;
    await createCryptoAddress(acc_data, curr.data, realm, user);
  }

  if (!res) throw "UNKNOWNERROR";

  return res.toJSON();
}

async function createCryptoAddress(account, currency, realm, user) {
  await Queue.newJob("ccoin-service", {
    method: "create",
    data: {
      currency,
      account
    },
    realm,
    user
  });
}

async function checkCurrency(abbr) {
  if (!abbr) return false;
  const res = await db.currency.findOne({ where: { abbr } });
  if (res && res.dataValues)
    return { res: !!res, crypto: res.dataValues.crypto, data: res.toJSON() };

  return { res: !!res };
}

async function getTechAccountByRealmId(realm_id, currency, type) {
  const res = await db.realmaccount.findOne({
    where: { realm_id, type },
    include: [
      {
        model: db.account,
        attributes: ["acc_no"],
        where: { currency }
      },
      {
        model: db.iban,
        attributes: ["iban", "bank_id"]
      }
    ]
  });
  return res ? res.toJSON() : null;
}

async function getTechAccountByAccNo(acc_no) {
  const res = await db.realmaccount.findOne({
    include: [
      {
        model: db.account,
        attributes: ["acc_no"],
        where: { acc_no }
      }
    ]
  });
  return res ? res.toJSON() : null;
}

async function getTechAccountsByAccsNo(accs_no, type) {
  const res = await db.realmaccount.findAll({
    where: { type },
    include: [
      {
        model: db.account,
        attributes: ["acc_no"],
        where: {
          acc_no: {
            [Op.in]: accs_no
          }
        }
      },
      {
        model: db.iban,
        attributes: ["iban", "currency", "notes"],
        include: [
          {
            model: db.bank
          }
        ]
      }
    ]
  });
  return res ? res.map((r) => r.toJSON()) : null;
}

async function checkAccountNoForRealm(acc_no, realm) {
  if (!acc_no) return false;
  const res = await db.account.findOne({
    where: { acc_no },
    attributes: ["id"],
    include: [{ model: db.user, attributes: ["id"], where: { realm } }]
  });

  return res ? res.user.get("id") : null;
}

function checkHoldStatus(list) {
  for (let item of list) {
    if (item.hold) return true;
  }
  return false;
}

function getAmount(data) {
  let amount = 0;
  if (data.amount) amount = parseFloat(data.amount);
  return isNaN(amount) ? 0 : amount;
}

async function checkAccounts(transactions) {
  const accAmmount = {};
  const out = {};
  transactions.forEach((transaction) => {
    if (!accAmmount[transaction.acc_src]) accAmmount[transaction.acc_src] = 0;
    if (!accAmmount[transaction.acc_dst]) accAmmount[transaction.acc_dst] = 0;
    accAmmount[transaction.acc_src] -= transaction.amount;
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
    attributes: [
      "balance",
      "negative",
      "status",
      "currency",
      "acc_no",
      "overdraft"
    ],
    raw: true
  });

  if (account) {
    switch (account.status) {
      case 0:
        throw "NOTACTIVATEDACCOUNT";
      case 2:
        throw "BLOCKEDACCOUNT";
      case 3:
        throw "CLOSEDACCOUNT";
    }
    if (
      !account.negative &&
      account.balance + amount < (account.overdraft || 0)
    ) {
      throw "INSUFFICIENTBALANCE";
    }

    return account.currency;
  } else {
    throw "ACCOUNTNOTFOUND3:" + acc_no;
  }
}

async function getAccountBalance(acc_no) {
  const { balance } = await db.account.findOne({
    where: { acc_no },
    attributes: ["balance"]
  });
  return balance;
}

async function updateAccountBalance(acc_no, amount, operation, t) {
  await db.account[operation === "+" ? "increment" : "decrement"](
    {
      balance: amount
    },
    { where: { acc_no }, transaction: t }
  );
}

async function exchange(amount, currencySrc, currencyDst) {
  if (!["localtest", "test"].includes(process.env.NODE_ENV)) {
    let rate;
    try {
      rate = await nil.getExchangeRate(currencySrc, currencyDst);
    } catch (e) {}
    if (rate) {
      return amount / (rate || 1);
    }
  }
  return await exchange_inside(amount, currencySrc, currencyDst);
}

async function exchange_inside(amount, currencySrc, currencyDst) {
  if (currencySrc == currencyDst) return amount;
  const coefficientSrc = await getCurrencyCoefficient(currencySrc);
  const coefficientDst = await getCurrencyCoefficient(currencyDst);

  if (!coefficientSrc) throw "CURRENCYNOTFOUND:" + currencySrc;
  if (!coefficientDst) throw "CURRENCYNOTFOUND:" + currencyDst;
  return (amount * coefficientSrc) / coefficientDst;
}

async function getCurrencyCoefficient(currency) {
  if (!!currentCurrency[currency]) return currentCurrency[currency];
  return 0;
}

async function getUserBalance(data, realmId, userId) {
  if (!data.currency) throw "THEREISNTCURRENCY";
  let accountsBalance = 0;
  let totalAmount = 0;

  const accounts = await db.account.findAll({
    where: { owner: userId, currency: data.currency, status: 1 },
    attributes: ["balance", "currency"]
  });

  if (accounts && accounts.length) {
    for (let account of accounts) {
      accountsBalance += account.balance;
    }
  }

  const depositsAmount = await _getAmountByHeldDeposits({
    currency: data.currency,
    user_id: userId
  });

  totalAmount = accountsBalance + depositsAmount;

  return { balance: totalAmount, currency: data.currency };
}

async function _getHiddenAmount(accounts) {
  const hiddenTransactions = await db.transaction.findAll({
    where: {
      acc_dst: { [Op.in]: accounts.map((a) => a.acc_no) },
      held: true,
      canceled: false
    },
    attributes: ["acc_dst", "exchange_amount"]
  });
  hiddenTransactions.forEach((tx) => {
    const acc_no = tx.get("acc_dst");
    const amount = tx.get("exchange_amount");
    if (amount) {
      for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].acc_no == acc_no) {
          if (!accounts[i].held_balance) accounts[i].held_balance = 0;
          accounts[i].held_balance += amount;
          break;
        }
      }
    }
  });
  return accounts;
}

function _buildSqlGetUserAccs(data, replacements) {
  let companies = null;

  if (data && data.company && data.company.length) {
    companies = data.company
      .join(",")
      .split(",")
      .map((word) => `'${word.trim()}'`)
      .join(",");
  }

  const sql = `SELECT a.id, a.acc_no, a.currency, a.balance, ma.id_merchant AS merchant_id, m.name AS merchant_name, ac.address, um.memo, ac.wallet_type
  FROM accounts a
  LEFT JOIN merchant_accounts ma ON (a.id=ma.id_account ${
    companies ? `AND ma.id_merchant IN (${companies})` : ""
  })
  LEFT JOIN merchants m ON ma.id_merchant = m.id
  LEFT JOIN account_crypto ac ON (ac.acc_no = a.acc_no)
  LEFT JOIN users_memo um ON ac.id = um.ref_id AND um.maker = :owner
  WHERE a.owner = :owner AND a.status = 1
  ORDER BY m.name ASC`;

  return sql;
}

async function _roundBalances(accounts) {
  const { result: listCurrencyDecimal } = await Queue.newJob(
    "merchant-service",
    {
      method: "getListCurrencyDecimal",
      data: {}
    }
  );

  for (const acc of accounts) {
    acc.balance = Number(acc.balance).toFixed(
      listCurrencyDecimal[acc.currency]
    );
    if (acc.crypto_wallet_balance || acc.crypto_wallet_balance == 0) {
      acc.crypto_wallet_balance = Number(acc.crypto_wallet_balance).toFixed(
        listCurrencyDecimal[acc.currency]
      );
    }
  }

  return accounts;
}

function _isUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str
  );
}

async function _groupAccounts(data, accounts) {
  const accountsByKey = {};

  for (const acc of accounts) {
    if (acc.address && data.show_crypto_accounts && acc.wallet_type === 0) {
      if (!accountsByKey[acc.address]) accountsByKey[acc.address] = [];
      accountsByKey[acc.address].push(acc);
    } else if (!acc.address && acc.merchant_id && data.show_fiat_accounts) {
      if (!accountsByKey[acc.merchant_id]) accountsByKey[acc.merchant_id] = [];
      accountsByKey[acc.merchant_id].push(acc);
    }
  }

  const out = Object.keys(accountsByKey).map((key) => {
    const accObj = accountsByKey[key];

    if (accObj.length) {
      const merchant_name = accObj[0].merchant_name;
      const merchant_id = accObj[0].merchant_id;
      let memo = null;

      for (const acc of accObj) {
        if (acc.memo) memo = acc.memo;
      }

      return {
        address: !_isUUID(key) ? key : null,
        merchant_name,
        memo,
        merchant_id,
        balances: accObj.map((item) => {
          const { memo, merchant_name, merchant_id, address, ...rest } = item;
          return rest;
        })
      };
    }

    return {
      address: key,
      merchant_name: null,
      memo: null,
      merchant_id: null,
      balances: []
    };
  });

  return { list: out, count: out.length };
}

async function getUserAccounts(data, realmId, userId) {
  const replacements = {
    owner: userId,
    currency: "USDT"
  };

  const sql = _buildSqlGetUserAccs(data, replacements);

  let accounts = await db.sequelize.query(sql, {
    replacements,
    raw: true,
    type: db.Sequelize.QueryTypes.SELECT
  });

  // if (
  //   ["staging", "production", "cross"].includes(process.env.NODE_ENV) &&
  //   data.show_crypto_accounts
  // ) {
  //   const { result } = await Queue.newJob("ccoin-service", {
  //     method: "getWalletsBalances",
  //     data: { accounts }
  //   });
  //   if (result) {
  //     accounts = result;
  //   }
  // }

  if (accounts && accounts.length) {
    await _roundBalances(accounts);
    await _getHiddenAmount(accounts);
    return await _groupAccounts(data, accounts);
  }

  return [];
}

async function getAccountsByCurrency(data, realmId, userId) {
  const accounts = await db.account.findAll({
    where: {
      owner: userId,
      removed: 0,
      currency: data.currency
    },
    attributes: [
      "id",
      "acc_no",
      "balance",
      "currency",
      "acc_name",
      "easy_acc_name"
    ]
  });
  if (accounts && accounts.length) return accounts;
  return [];
}

async function getTechAccByMerchant(data, realmId, userId) {
  let res = await db.sequelize.query(
    "select * from vw_withdraval_accounts where merchant=:merchant",
    {
      replacements: { merchant: userId },
      type: db.sequelize.QueryTypes.SELECT
    }
  );
  return res && res.length ? res : [];
}

async function updateUserAccount(data, realmId, userId) {
  data.acc_name = data.acc_name.replace(/\s+/g, " ");
  if (data.acc_name == " ") throw "INCORRECTDATA";
  let accounts;
  try {
    accounts = await db.account.update(data, {
      where: { id: data.id, owner: userId }
    });
  } catch (e) {
    throw "INCORRECTDATA";
  }

  if (!accounts) throw "ACCOUNTNOTUPDATED";
  return { success: true };
}

async function getUserAccount(data, realmId, userId) {
  const where = { owner: userId };

  if (data.id) where.id = data.id;
  if (data.acc_no) where.acc_no = data.acc_no;

  const account = await db.account.findOne({
    where
  });

  if (account) return account.toJSON();

  throw "ACCOUNTNOTFOUND2";
}

async function getAllWalletsAmountInSameCurrency(data, realmId, userId) {
  if (!data.currency) throw "THEREISNTCURRENCY";

  const accounts = await db.account.findAll({
    where: { owner: userId },
    attributes: ["id", "balance"]
  });

  let amount = [];

  if (accounts && accounts.length) {
    const currency_val = await db.vw_currency_values.findOne({
      where: { abbr: data.currency },
      attributes: ["value"]
    });

    for (let account of accounts) {
      let res = account.balance * currency_val.value;
      amount.push({ id: account.id, amount: res });
    }
  }

  return {
    currency: data.currency,
    accounts: amount
  };
}

async function getCurrency(data, realmId, userId) {
  const res = await db.currency.findAll({
    where: { ui_active: true },
    attributes: ["abbr", "crypto", ["ui_decimal", "decimal"]],
    raw: true,
    order: [["abbr", "ASC"]]
  });

  if (res && res.length) {
    return res;
  }

  return [];
}

async function getUsersCurrencyByAccounts(accounts) {
  const res = await db.account.findAll({
    where: {
      acc_no: {
        [Op.in]: accounts
      }
    },
    attributes: ["id", "acc_no", "currency"]
  });
  const out = {};
  if (res && res.length) {
    for (const item of res) {
      out[item.acc_no] = {
        currency: item.currency
      };
    }
  }
  return out;
}

async function findAccounts(data, realm, user) {
  if (!data.search || data.search.length < 5) return { list: [] };

  const replacements = {
    user,
    search: data.search,
    search_like: "%" + data.search + "%"
  };
  const res = await db.sequelize.query(
    "SELECT a.acc_no, a.currency, u.first_name, u.last_name, u.email, u.phone FROM accounts a, users u WHERE u.id != :user and a.status=1 and a.owner=u.id and (a.acc_no=:search or u.email ilike :search or u.phone=:search) LIMIT 20",
    { replacements }
  );

  return { list: res[0] };
}

async function getAllUsersAccounts(user_id, merchant_id) {
  let merchantCondition = "";
  const replacements = { user_id };

  if (merchant_id) {
    merchantCondition = ` and id in (SELECT id_account FROM merchant_accounts WHERE id_merchant='${merchant_id}')`;
    replacements.merchant_id = merchant_id;
  }

  const sql = `SELECT acc_no FROM accounts WHERE owner=:user_id ${merchantCondition}`;

  const res = await db.sequelize.query(sql, {
    replacements
  });
  return res && res[0] && res[0].length
    ? res[0].map((item) => item.acc_no)
    : null;
}

async function isValidAccountOwner(accounts, owner) {
  const userAccounts = await getUserAccounts(null, null, owner);
  const out = [];
  let log;
  for (let acc_no of accounts) {
    log = false;
    for (let accRec of userAccounts) {
      if (accRec.acc_no == acc_no) {
        log = true;
        out.push(accRec);
        break;
      }
    }
    if (!log) return false;
  }
  return out;
}

async function getBalances(accounts, currency) {
  let res = 0;
  for (let account of accounts) {
    res += await exchange(account.balance, account.currency, currency);
  }
  return res;
}

async function getHeldTransactionsByAccounts(accounts) {
  const transactions = await db.transaction.findAll({
    where: {
      [Op.or]: [
        { acc_src: { [Op.in]: accounts } },
        { acc_dst: { [Op.in]: accounts } }
      ],
      held: true,
      canceled: false
    },
    attributes: [
      "amount",
      "exchange_amount",
      "acc_src",
      "acc_dst",
      "currency_src",
      "currency_dst",
      "txtype"
    ]
  });
  return transactions.map((t) => t.toJSON());
}

async function getHeldInsureAmount(accounts, currency) {
  const out = {
    heldIn: 0,
    heldOut: 0,
    insurance: 0
  };
  const acc_no_All = accounts.map((a) => a.acc_no);
  const transactions = await getHeldTransactionsByAccounts(acc_no_All);

  for (let tx of transactions) {
    if (tx.txtype == "insurance") {
      out.insurance += await exchange(tx.amount, tx.currency_src, currency);
    } else if (acc_no_All.includes(tx.acc_src)) {
      out.heldOut += await exchange(tx.amount, tx.currency_src, currency);
    } else if (acc_no_All.includes(tx.acc_dst)) {
      out.heldIn += await exchange(
        tx.exchange_amount,
        tx.currency_dst,
        currency
      );
    }
  }

  return out;
}

async function getStatus(data, realm, user) {
  if (!data.accounts || !Array.isArray(data.accounts) || !data.accounts.length)
    throw "REQUESTERROR";

  let existsAccounts = await isValidAccountOwner(data.accounts, user);
  if (!existsAccounts) throw "PERMISSIONDENIEDTOACCOUNT";

  const currency = data.currency || existsAccounts[0].currency;
  let out = await getHeldInsureAmount(existsAccounts, currency);

  out.balance = await getBalances(existsAccounts, currency);
  out.currency = currency;
  return out;
}

function removeHiddenTransactions(txList) {
  let out = [];
  txList.forEach((tx) => {
    if (!tx.hidden) out.push(tx);
  });
  return out;
}

function getVariableByName(vars, name) {
  if (!vars || !vars._arr || !vars._arr.length) return null;

  for (let item of vars._arr) {
    if (item.key == name) return item.value;
  }

  return null;
}

async function exchangeInfo(data, realmId, userId) {
  if (!data.amount || !data.currency_src || !data.currency_dst)
    throw "REQUESTERROR";
  let amount = await exchange(
    data.amount,
    data.currency_src,
    data.currency_dst
  );
  const user = await db.user.findOne({
    where: { id: userId },
    attributes: ["variables"]
  });
  let comission = getVariableByName(user.get("variables"), "EXCHANGE_FEE");
  if (!comission) {
    const realm = await db.realm.findOne({
      where: { id: realmId },
      attributes: ["variables"]
    });
    comission = getVariableByName(realm.get("variables"), "EXCHANGE_FEE");
  }
  if (comission) {
    amount -= (amount * comission) / (100 + comission);
  }
  return { amount, currency: data.currency_dst };
}

async function getTransactions(data, act) {
  let obj = act == "removeOrder" ? { ref_id: data.id } : { id: data.id };
  let transfersWithTransactions = await db.transfer.findAll({
    where: obj,
    include: [{ model: db.transaction }]
  });

  let transactions = [];
  let transfersId = [];
  if (!transfersWithTransactions.length)
    return { transactions: [], transfersId: [] };
  if (transfersWithTransactions.length)
    for (let transfer of transfersWithTransactions) {
      transfersId.push(transfer.dataValues.id);
      if (transfer.transaction.dataValues.length)
        for (let transaction of transfer.transaction.dataValues) {
          transactions.push(transaction);
        }
      else transactions.push(transfer.transaction.dataValues);
    }
  else {
    transfersId.push(transfersWithTransactions.id);
    if (transfersWithTransactions.dataValues.transaction.dataValues.length)
      for (let transaction of transfer.dataValues.transaction.dataValues) {
        transactions.push(transaction);
      }
    else transactions.push(transfer.transaction.dataValues);
  }
  return { transactions, transfersId };
}

async function getAccountsFromTransactions(transactions) {
  let transactAccs = [];
  for (let tx of transactions) {
    if (!transactAccs.includes(tx.acc_src)) transactAccs.push(tx.acc_src);
    if (!transactAccs.includes(tx.acc_dst)) transactAccs.push(tx.acc_dst);
  }
  return transactAccs;
}

async function deleteOrder(orderId, transfersId) {
  for (let tf of transfersId) await removeTx(tf);
  return await db.order.destroy({ where: { id: orderId } });
}

async function removeTx(transferId) {
  return await db.transfer.destroy({ where: { id: transferId } });
}

async function updateAccount(acc_no, balance) {
  try {
    return await db.account.update({ balance }, { where: { acc_no } });
  } catch (e) {
    console.log(e);
  }
}

async function syncBalance(accounts) {
  let survivedTx = await db.transaction.findAll({
    where: { [Op.or]: [{ acc_src: accounts }, { acc_dst: accounts }] },
    raw: true,
    attributes: [
      "held",
      "canceled",
      "amount",
      "acc_src",
      "acc_dst",
      "exchange_amount",
      "txtype"
    ]
  });

  for (let acc_no of accounts) {
    let amount = 0;
    for (let tx of survivedTx) {
      if ((!tx.held && !tx.canceled) || (!tx.held && tx.canceled)) {
        if (tx.acc_src == acc_no) amount -= tx.amount;
        if (tx.acc_dst == acc_no) amount += tx.exchange_amount;
      }
      if (tx.held && !tx.canceled) {
        if (tx.acc_src == acc_no) amount -= tx.amount;
        if (tx.acc_dst == acc_no && tx.txtype != "transfer")
          amount += tx.exchange_amount;
      }
    }
    await updateAccount(acc_no, amount);
  }
  return true;
}

async function removeOrder(data, realmId, userId) {
  if (!config.allowDeleteOrdersAndTransfers) throw "REMOVINGNOTALLOWED";
  let txObj = await getTransactions(data, "removeOrder");
  let accounts = await getAccountsFromTransactions(txObj.transactions);
  await deleteOrder(data.id, txObj.transfersId);
  await syncBalance(accounts);

  return { success: true };
}

async function removeTransfer(data, realmId, userId) {
  if (!config.allowDeleteOrdersAndTransfers) throw "REMOVINGNOTALLOWED";
  let txObj = await getTransactions(data, "removeTransfer");
  let accounts = await getAccountsFromTransactions(txObj.transactions);
  await removeTx(data.id);
  await syncBalance(accounts);

  return { success: true };
}

async function _getAmountByHeldDeposits(data) {
  let amount = 0;

  const transfers = await db.transfer.findAll({
    where: {
      user_id: data.user_id,
      held: true,
      canceled: false,
      event_name: "account-service:deposit",
      data: {
        [Op.contains]: {
          currency: data.currency
        }
      }
    },
    raw: true
  });

  if (transfers && transfers.length) {
    for (let transfer of transfers) {
      amount += transfer.amount;
    }
  }

  return amount;
}

async function getCryptoAccounts(data, realmId, userId) {
  const accounts = await _getAccountsByUser(userId);

  const wallets = await db.account_crypto.findAll({
    where: {
      acc_no: {
        [Op.in]: accounts
      }
    },
    attributes: ["id", "acc_no", "address", ["abbr", "currency"]],
    raw: true
  });

  await _attachUsersMemo(wallets, userId);

  let out = wallets;
  if (data.distinct) {
    out = [...new Map(wallets.map((item) => [item["address"], item])).values()];
  }

  return { success: true, list: out };
}

async function _getAccountsByUser(owner) {
  const res = await db.account.findAll({
    where: { owner, status: 1, removed: 0 },
    attributes: ["acc_no"],
    raw: true
  });

  return res && res.length ? res.map((item) => item.acc_no) : [];
}

async function _attachUsersMemo(wallets, userId) {
  const memos = await db.users_memo.findAll({
    where: { maker: userId },
    raw: true
  });

  for (const wallet of wallets) {
    memos.forEach((item) => {
      if (item.ref_id == wallet.id) {
        item.address = wallet.address;
      }
      if (wallet.address == item.address) {
        wallet.memo = item.memo;
      }
    });
  }

  return memos && memos.length ? memos : [];
}

async function checkNetworkFeeLimit(data, realm, user) {
  const { address, gas_currency } =
    (await db.vw_accounts_with_gas.findOne({
      where: { address: data.address, status: 1 },
      attributes: ["address", "gas_currency"]
    })) || {};
  if (!address || !gas_currency)
    return { success: true, code: "ADDRESSNOTFOUND" };

  let { result: account } =
    (await Queue.newJob("ccoin-service", {
      method: "getWalletsBalances",
      data: {
        accounts: [{ address, currency: gas_currency }]
      },
      realm,
      user
    })) || {};
  if (!account || !account[0])
    return { success: true, code: "BALANCENOTFOUND" };
  account = account[0];

  let { result: network_fee } =
    (await Queue.newJob("ccoin-service", {
      method: "getLatestFeesByCurrency",
      data: {
        currency: data.currency
      }
    })) || {};
  const currencyAlias = {
    USDT: "ETH",
    USDC: "ETH",
    USTR: "TRX"
  };

  if (
    !network_fee ||
    !network_fee[currencyAlias[account.currency] || account.currency]
  )
    return { success: true, code: "NFNOTFOUND" };

  let network_fee_limit =
    Number(network_fee[currencyAlias[account.currency] || account.currency]) +
    (Number(network_fee[currencyAlias[account.currency] || account.currency]) /
      100) *
      config.NF_CORRECTION_FACTOR;

  if (account.crypto_wallet_balance >= 2 * network_fee_limit)
    return { success: true };

  const response_data = {
    gas_acc_balance: account.crypto_wallet_balance,
    network_fee_limit,
    currency: gas_currency
  };
  if (
    network_fee_limit <= account.crypto_wallet_balance &&
    account.crypto_wallet_balance <= 2 * network_fee_limit
  ) {
    if (
      (data.currency == "USDT" && data.result_currency == "ETH") ||
      (data.currency == "USTR" && data.result_currency == "TRX")
    )
      return { success: true };
    return {
      success: false,
      code: "ONLYSWAPAVAILABLE",
      data: response_data
    };
  }
  return {
    success: false,
    code: "INSUFFICIENTGASBALANCEFOROPERATIONS",
    data: response_data
  };
}

export default {
  create,
  exchange,
  exchangeInfo,
  checkAccounts,
  getUserBalance,
  getAccountBalance,
  updateAccountBalance,
  getRandomIban,
  setCurrentCurrency,
  getTechAccountByRealmId,
  checkAccountNoForRealm,
  checkHoldStatus,
  getAmount,
  getUserAccounts,
  getUserAccount,
  getCurrency,
  getTechAccountByAccNo,
  getTechAccountsByAccsNo,
  updateUserAccount,
  getUsersCurrencyByAccounts,
  findAccounts,
  getAllWalletsAmountInSameCurrency,
  getAllUsersAccounts,
  getStatus,
  removeHiddenTransactions,
  getAccountsByCurrency,
  getTechAccByMerchant,
  removeOrder,
  removeTransfer,
  checkCurrency,
  getCryptoAccounts,
  checkNetworkFeeLimit
};
