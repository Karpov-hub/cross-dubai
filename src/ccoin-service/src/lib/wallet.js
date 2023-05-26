import db from "@lib/db";
import nil from "@lib/nil";
import config from "@lib/config";
import log from "./logs";
import api from "./api";
import uuid from "uuid/v4";
import MemStore from "@lib/memstore";

const Op = db.Sequelize.Op;

async function getApiByAbbr(abbr) {
  return await api.getApiByAbbr(abbr);
}

async function sendPostRequest(api_url, action, data) {
  return await api.sendPostRequest(api_url, action, data);
}

async function sendGetRequest(api_url, action, params) {
  return await api.sendGetRequest(api_url, action, params);
}

function sign(data) {
  return api.sign(data, config.cryptoMasterKey);
}

async function bindAccountToCryptoAddress(
  acc_no,
  cryptoAddr,
  abbr,
  wallet_type
) {
  const res = await db.account_crypto.create({
    acc_no,
    address: cryptoAddr.address,
    wallet: cryptoAddr.walletId,
    abbr,
    wallet_type
  });
  return !!res;
}

async function getAddress(data, realm, user) {
  const res = await db.account_crypto.findOne({
    where: { acc_no: data.acc_no },
    attributes: ["address", "abbr"]
  });
  return res.toJSON();
}

async function create(data) {
  let api;

  if (data.currency.api) api = data.currency.api;
  else if (data.currency.abbr) api = await getApiByAbbr(data.currency.abbr);
  if (!api) throw "CRYPTOAPINOTFOUND";

  let res;
  if (data.account.address) res = { data: { address: data.account.address } };
  else {
    try {
      res = await sendGetRequest(api, "getMonitorReceiveAddress");
    } catch (e) {
      console.log("e:", e);
      throw "CRYPTOREQUESTERROR";
    }
  }

  if (!res || !res.data || !res.data.address) {
    throw "CRYPTOADDRESSISNOTCREATED";
  }

  if (
    await bindAccountToCryptoAddress(
      data.account.acc_no,
      res.data,
      data.currency.abbr,
      data.account.wallet_type
    )
  )
    return res.data;

  throw "CRYPTOCREATEERROR";
}

async function getAccountByAddress(address, abbr) {
  const where = {
    address
  };
  if (abbr) where.abbr = abbr;

  const res = await db.account_crypto.findOne({
    where,
    attributes: ["acc_no"],
    include: [
      {
        model: db.account,
        attributes: ["acc_no", "owner", "currency"]
      }
    ]
  });

  return res && res.account ? res.account.toJSON() : null;
}

async function generateAddress(data) {
  const api = await getApiByAbbr(data.currency);
  if (!api) throw "CRYPTOCURRENCYNOTFOUND";
  let res;
  try {
    res = await sendGetRequest(api, "getMonitorReceiveAddress");
  } catch (e) {}
  return res && res.data ? res.data.address : null;
}

async function getMasterAddress(abbr) {
  const api = await getApiByAbbr(abbr);
  if (!api) throw "CRYPTOCURRENCYNOTFOUND";
  let res;
  try {
    res = await sendGetRequest(api, "getMasterAddress");
  } catch (e) {}
  return res && res.data ? res.data.address : null;
}

async function getExchangeRate(data, realmId, userId) {
  const price = await nil.getExchangeRate(
    data.currency_from,
    data.currency_to,
    data.amount
  );
  return { price };
}

async function getMonitoringAddressByAccount(acc_no) {
  const rec = await db.account_crypto.findOne({
    where: { acc_no },
    attributes: ["address"],
    raw: true
  });
  return rec && rec.address ? rec.address : null;
}

async function getMonitoringAddressByMerchant(merchant, currency, transfer) {
  const crypto_acc = await db.sequelize.query(
    "select c.* from vw_org_accounts o, account_crypto c  where o.org=:merchant and o.currency=:currency and o.acc_no = c.acc_no",
    {
      replacements: { merchant, currency },
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  if (transfer && (!crypto_acc[0] || !crypto_acc[0].address)) {
    log.push(transfer.id, "ERROR", "Monitoring address not found", {
      merchant,
      currency
    });
    throw "MONITORINGADDRESSNOTFOUND";
  }

  return crypto_acc[0].address;
}

async function getExternalAddressByMerchant(merchant, currency) {
  const wallet = await db.vw_org_wallet.findOne({
    where: { org: merchant, curr_name: currency },
    raw: true
  });
  return wallet ? wallet.num : null;
}

async function sendCryptoPayment(
  amount,
  currency,
  monitoringAddress,
  externalAddress,
  txId
) {
  await db.payments_queue.create({
    data: { amount, currency, monitoringAddress, externalAddress, txId }
  });
  return true;
}

function sendCryptoPaymentChecker() {
  return db.sequelize.transaction(async (t) => {
    const job = await db.payments_queue.findOne({
      order: [
        // Will escape title and validate DESC against a list of valid direction parameters
        ["ctime", "ASC"]
      ],
      raw: true,
      transaction: t
    });
    if (job) {
      await db.payments_queue.destroy({
        where: { id: job.id },
        transaction: t
      });
      await sendCryptoPayment_do(
        job.data.amount,
        job.data.currency,
        job.data.monitoringAddress,
        job.data.externalAddress,
        job.data.txId
      );
    }
    return true;
  });
}

async function sendCryptoPayment_do(
  amount,
  currency,
  monitoringAddress,
  externalAddress,
  txId
) {
  const data = {
    requestId: txId,
    toAddress: monitoringAddress,
    currencyId: currency,
    amount: amount,
    toExternalAddress: externalAddress //"0x40d867754f0E6a4aB40499CE970A1186dD31CD51"
  };

  data.sign = sign(data);
  const api = await getApiByAbbr(currency);
  let res;
  try {
    res = await sendPostRequest(api, "sendViaWallet", data);
  } catch (e) {
    console.log(
      "Catch error:",
      e.response ? JSON.stringify(e.response.data, null, 4) : e
    );
  }

  if (res.data && res.data.result)
    log.push(
      txId,
      ["COMPLETED", "PROCESSING"].includes(res.data.result.status)
        ? "WARNING"
        : "ERROR",
      "Send via Wallets.",
      res.data
    );

  if (
    res.data &&
    res.data.result &&
    ["COMPLETED", "PROCESSING"].includes(res.data.result.status)
  ) {
  } else throw "ERRORINSKMTEXT";

  await saveCryptoTransferResult({ id: txId });

  return res.data;
}

function saveCryptoTransferResult(transfer) {
  return db.sequelize.transaction(async (t) => {
    await db.transfer.update(
      { status: 2 },
      {
        where: { id: transfer.id },
        transaction: t
      }
    );
  });
}

async function getSKBalance() {
  const cryptoCurrency = await db.currency.findAll({
    where: { crypto: true },
    raw: true
  });

  let out = [];

  for (let item of cryptoCurrency)
    if (item.api) {
      let { data } = await sendGetRequest(item, "getMasterAddress");
      if (data && data.address) {
        let res;
        try {
          res = await sendGetRequest(item, `getWalletBalance/${data.address}`);
        } catch (e) {}
        if (res && res.data) {
          out.push({
            abbr: item.abbr,
            balance: res.data.amount
          });
        }
      }
    }

  return out;
}

async function checkMerchantWallet(address, merchant_id) {
  const res = await db.sequelize.query(
    "select w.id from crypto_wallets w, merchants m where w.num=:address and m.id=:merchant_id and w.user_id=m.user_id",
    {
      replacements: { address, merchant_id },
      type: db.sequelize.QueryTypes.SELECT
    }
  );
  return res && res.length;
}

async function getProviderAddressByCurrency(currency) {
  const res = await db.currency.findOne({
    where: { abbr: currency },
    attributes: ["provider_address"],
    raw: true
  });
  return res && res.provider_address ? res.provider_address : null;
}

async function sendToProviderViaWallet(data) {
  data.sign = sign(data);
  const api = await getApiByAbbr(data.currencyId);
  let res;
  try {
    res = await sendPostRequest(api, "sendToProviderViaWallet", data);
  } catch (e) {
    console.log("Catch error:", JSON.stringify(e.response.data, null, 4));
  }
  return res && res.data ? res.data : null;
}

async function sendCustom(data) {
  const api = await getApiByAbbr(data.currency);
  if (!api) throw "APINOTDEFINED";

  const dataToSend = {
    requestId: data.txId || uuid(),
    fromAddress: data.address_from,
    toAddress: data.address_to,
    currencyId: config.CURRENCY_ALIAS[data.currency] || data.currency,
    amount: parseFloat((data.amount + "").replace(",", "."))
  };

  const sendMethod = data.currency == "ETH" ? "v2/send" : "send";

  dataToSend.sign = sign(dataToSend);

  console.log("sendCustom:", dataToSend);

  let res = {};
  let err = null;
  try {
    res = await sendPostRequest(api, sendMethod, dataToSend);
  } catch (e) {
    err = JSON.stringify(e.response.data, null, 4);
    console.log("Catch error:", err);
  }

  console.log("sendCustom:res.data:", JSON.stringify(res.data, null, 4));

  return res && res.data
    ? { success: true, ...res.data }
    : { success: false, error: err };
}

async function getTxsByWallet(data) {
  const cryptoCurrency = await db.currency.findAll({
    where: { crypto: true },
    raw: true
  });

  let out = [];
  for (let item of cryptoCurrency) {
    if (item.api) {
      let res;
      try {
        res = await sendGetRequest(item, "getTxs", data.params);
      } catch (e) {}
      if (res && res.data && res.data.txs) {
        for (const item of res.data.txs) {
          out.push({
            id: item.id,
            action_from: item.actionFrom,
            action_to: item.actionTo,
            action_to_ext: item.actionToExt,
            amount: item.amount,
            fee: item.fee,
            create_time: item.createTime,
            currency_id: item.currencyId,
            operation: item.operation,
            tx_id: item.txId,
            fee_currency_id: item.feeCurrencyId,
            tx_time: item.txTime,
            tx_result: item.txResult,
            tx_related_id: item.txRelatedId,
            request_id: item.requestId,
            info: item.info,
            system_fee: item.systemFee
          });
        }
      }
    }
  }

  return out;
}

async function getExchangeRates(data, realmId, userId) {
  const out = [];
  for (const instrument of data.instruments) {
    const { price, side } = await nil.getExchangeRateWithSide(
      instrument.currency_from,
      instrument.currency_to,
      1
    );
    out.push({
      alias: `${instrument.currency_from}/${instrument.currency_to}`,
      rate: price,
      side
    });
  }

  return out;
}

async function calculateAverageDailyRate(data) {
  let start_date = new Date().setHours(0, 0, 0, 1),
    end_date = new Date().setHours(23, 59, 59);
  const daily_history = await db.daily_rate_history.findAll({
    where: { ctime: { [Op.between]: [start_date, end_date] } },
    attributes: ["currencies_pair", "buy", "sell"],
    raw: true
  });
  if (!daily_history.length) return;
  let currencies_pairs = {};
  for (let rate_history_row of daily_history) {
    if (!currencies_pairs[rate_history_row.currencies_pair])
      currencies_pairs[rate_history_row.currencies_pair] = [];
    currencies_pairs[rate_history_row.currencies_pair].push(rate_history_row);
  }
  let insert_arr = [];
  for (let key of Object.keys(currencies_pairs)) {
    let average_rate = {
      buy: 0,
      sell: 0,
      ctime: start_date,
      mtime: start_date,
      removed: 0
    };
    average_rate.buy = currencies_pairs[key].reduce(
      (prevV, currV) => prevV + Number(currV.buy),
      0
    );
    average_rate.buy = average_rate.buy / currencies_pairs[key].length;
    average_rate.sell = currencies_pairs[key].reduce(
      (prevV, currV) => prevV + Number(currV.sell),
      0
    );
    average_rate.sell = average_rate.sell / currencies_pairs[key].length;
    average_rate.currencies_pair = key;
    insert_arr.push(average_rate);
  }
  await db.daily_rate_history.destroy({ truncate: true });
  return await db.average_rate_history.bulkCreate(insert_arr);
}

async function calculateTodaysNilRates(data) {
  const instruments = config.NIL_RATES_INSTRUMENTS;
  let res = await getExchangeRates({ instruments });
  return await saveRateHistory({ rates_arr: res });
}

async function saveRateHistory(data) {
  let raw_insert_sql = `insert into daily_rate_history (id, currencies_pair, buy, sell, ctime, mtime, removed) values `;
  let rates_values_arr = buildRatesHistoryInsertValues(data.rates_arr);
  let count_rates = 0;
  for (let rates_value of rates_values_arr) {
    let count_rates_properties = 0;
    raw_insert_sql += "(";
    for (let key of Object.keys(rates_value)) {
      raw_insert_sql += rates_value[key];
      count_rates_properties++;
      if (count_rates_properties < Object.keys(rates_value).length)
        raw_insert_sql += ", ";
    }
    count_rates++;
    if (count_rates < rates_values_arr.length) raw_insert_sql += "), ";
    else raw_insert_sql += ");";
  }
  await db.sequelize.query(raw_insert_sql);
  return { success: true };
}

/* scope:server */
function buildRatesHistoryInsertValues(arr) {
  let result_arr = [];
  arr = arr.map((el) => {
    let currencies = el.alias.split("/");
    return {
      curr_1: currencies[0],
      curr_2: currencies[1],
      rate: el.rate,
      side: el.side
    };
  });
  for (let rate of arr) {
    if (rate.side == "sell") continue;
    let sell = arr.find((el) => {
      return (
        el.curr_1 == rate.curr_2 &&
        el.curr_2 == rate.curr_1 &&
        el.side == "sell"
      );
    });
    result_arr.push({
      id: `'${uuid()}'`,
      curr_1: rate.curr_1,
      curr_2: rate.curr_2,
      currencies_pair: `'${rate.curr_2} - ${rate.curr_1}'`,
      buy: rate.rate,
      sell: 1 / Number(sell.rate),
      ctime: `now()`,
      mtime: `now()`,
      removed: 0
    });
  }
  for (let rate of result_arr) {
    delete rate.curr_1;
    delete rate.curr_2;
  }
  return result_arr;
}

async function getWalletsBalances(data, realm, user) {
  const where = {
    crypto: true
  };

  if (user) {
    where.ui_active = true;
  } else {
    where.ap_active = true;
  }

  const cryptoCurrencies = await db.currency.findAll({
    where,
    raw: true
  });

  const requestedCurrencies = data.accounts.map((item) => item.currency);
  const availableCurrencies = cryptoCurrencies.map((item) => item.abbr);

  for (const rc of requestedCurrencies) {
    if (!availableCurrencies.includes(rc) && !data.sum_up_usdt) {
      throw "BLOCKCHAIN_UNAVAILABLE";
    }
  }

  let getBalance_request = await prepareGetBalancesRequest(
    data.accounts,
    cryptoCurrencies
  );
  let wallets_info = [];

  if (getBalance_request) {
    for (let currency of Object.keys(getBalance_request)) {
      let getRes = await sendGetRequest(
        getBalance_request[currency],
        "getWalletsBalance",
        {
          addresses: getBalance_request[currency].items.join(",")
        },
        5
      ).catch((e) => {
        console.log("getWalletsBalances [arr] error: ", e);
      });
      if (getRes && getRes.data && getRes.data.balanceInfo)
        wallets_info = wallets_info.concat(getRes.data.balanceInfo);
    }
  }

  const findBalanceInWalletData = (balances, account) => {
    return balances.find((el) => {
      return (
        el.currencyId ==
        (config.CURRENCY_ALIAS[account.currency]
          ? config.CURRENCY_ALIAS[account.currency]
          : account.currency)
      );
    });
  };
  for (let account of data.accounts) {
    let wallet_data = wallets_info.find((el) => {
      return (
        el.address == account.address &&
        findBalanceInWalletData(el.balances, account)
      );
    });
    if (wallet_data) {
      let balance = findBalanceInWalletData(wallet_data.balances, account);
      account.crypto_wallet_balance = balance.amount;
    }
  }

  data.accounts.sort((a, b) => {
    if (a.currency.toLowerCase() > b.currency.toLowerCase()) return 1;
    if (a.currency.toLowerCase() < b.currency.toLowerCase()) return -1;
    return 0;
  });

  return data.accounts;
}

async function prepareGetBalancesRequest(accounts, cryptoCurrencies) {
  let network_currencies_alias = {
    ETH: ["USDT", "USDC", "ETH"],
    TRX: ["USTR", "TRX"]
  };
  let result = {};
  for (let account of accounts) {
    let network = account.currency;
    for (let currency of Object.keys(network_currencies_alias))
      if (
        network_currencies_alias[currency].find((el) => el == account.currency)
      )
        network = currency;

    let crypto_currency = cryptoCurrencies.find((el) => {
      return el.abbr == network;
    });

    if (!crypto_currency || !crypto_currency.api) continue;
    if (!result[network]) {
      result[network] = {
        api: crypto_currency.api,
        apitoken: crypto_currency.apitoken,
        items: [account.address]
      };
      continue;
    }
    result[network].items.push(account.address);
  }
  return result;
}

async function createUpdateNonCustodialWallet(data, realmId, userId) {
  let cryptoAddress = null;

  if (!data.address) {
    cryptoAddress = await createFree(data.currency);
  }

  const walletInfo = {
    id: data.id || uuid(),
    address: data.address || cryptoAddress,
    currency: data.currency,
    user_id: userId || null,
    memo: data.memo
  };

  if (data.merchant_id) {
    walletInfo.merchant_id = data.merchant_id;
  }

  try {
    if (walletInfo.address) {
      await db.non_custodial_wallet.upsert(walletInfo);
    }
  } catch (error) {
    throw "ERROR_FREE_WALLET_CREATION";
  }

  return {
    success: true,
    walletInfo
  };
}

async function createFree(currency) {
  let api = await getApiByAbbr(currency);
  if (!api) throw "CRYPTOAPINOTFOUND";

  let res;

  try {
    res = await sendGetRequest(api, "getMonitorReceiveAddress");
  } catch (e) {
    console.log("e:", e);
    throw "CRYPTO_REQUEST_ERROR";
  }

  if (!res || !res.data || !res.data.address) {
    throw "CRYPTO_ADDRESS_IS_NOT_CREATED";
  }

  return res.data.address;
}

async function getWalletPrivateKey(data) {
  const { currency, address } = await _getWalletById(data.wallet_id);
  const api = await getApiByAbbr(currency);

  const sendData = {
    address: address,
    email: data.email || null
  };
  sendData.sign = sign(sendData);

  let res;
  try {
    res = await sendPostRequest(api, "getWalletPrivateKey", sendData);
  } catch (e) {
    console.log(
      "Catch error:",
      e.response ? JSON.stringify(e.response.data, null, 4) : e
    );
    if (
      e.response &&
      e.response.data.result &&
      e.response.data.result.status == "FAILED"
    ) {
      return { error: e.response.data.result.errors };
    }
  }

  if (res.data && res.data.result && res.data.result.status == "COMPLETED") {
    await db.non_custodial_wallet.update(
      { last_pk_share_date: new Date() },
      { where: { id: data.wallet_id } }
    );
    return res.data;
  }

  throw "FAILED_GET_WALLET_PK";
}

async function _getWalletById(id) {
  const BLOCKCHAIN_CURRENCY = {
    USTR: "TRX",
    USDT: "ETH",
    USDC: "ETH"
  };

  if (!id) throw "THERE_IS_NO_WALLET_ID";

  let wallet = await db.non_custodial_wallet.findOne({
    where: { id },
    attributes: ["currency", "address"],
    raw: true
  });

  if (!wallet) {
    wallet = await db.vw_client_accs.findOne({
      where: { id },
      attributes: ["currency", ["crypto_address", "address"]],
      raw: true
    });
  }

  if (!wallet) throw "CRYPTO_ADDRESS_NOT_FOUND";

  return {
    address: wallet.address,
    currency: BLOCKCHAIN_CURRENCY[wallet.currency] || wallet.currency
  };
}

async function _createWalletsChain(data) {
  const cryptoAddresses = [];

  const merchantId = await _getMerchantIdByWalletSrc(data);
  const chainConfig = await _getConfingWalletChain();

  for (let i = 0; i < chainConfig.wallet_chain_length; i++) {
    const cryptoAddress = await createFree(data.currency);
    cryptoAddresses.push(cryptoAddress);
  }

  const chainInfo = {
    id: uuid(),
    wallet_sender: data.wallet_src,
    wallet_receiver: data.wallet_dst,
    merchant_id: merchantId,
    lifespan: chainConfig.wallet_chain_lifespan_days,
    status: db.wallet_chain.STATUSES.ACTIVE,
    wallets: { _arr: cryptoAddresses }
  };

  try {
    await db.wallet_chain.create(chainInfo);
  } catch (error) {
    throw "ERROR_FREE_WALLET_CREATION";
  }

  return chainInfo;
}

async function _getConfingWalletChain() {
  const out = {};

  const settings = await db.settings.findAll({
    where: {
      key: {
        [Op.in]: ["wallet_chain_length", "wallet_chain_lifespan_days"]
      }
    },
    attributes: ["key", "value"],
    raw: true
  });

  settings.forEach((item) => (out[item.key] = Number(item.value)));

  return out;
}

async function _getMerchantIdByWalletSrc(data) {
  const wallet = await db.vw_client_accs.findOne({
    where: {
      crypto_address: data.wallet_src,
      currency: data.currency
    },
    raw: true
  });

  if (!wallet) {
    throw "NO_WALLET_ATTACHED_TO_MERCHANT";
  }

  return wallet.merchant_id;
}

async function getChainOfWallets(data) {
  let chain = await db.wallet_chain.findOne({
    where: {
      wallet_sender: data.wallet_src,
      wallet_receiver: data.wallet_dst,
      status: db.wallet_chain.STATUSES.ACTIVE
    },
    attributes: ["wallets", "id"],
    raw: true
  });

  if (!chain) {
    chain = await _createWalletsChain(data);
  }

  return chain && chain.wallets
    ? { wallets: chain.wallets._arr, chain_id: chain.id }
    : null;
}

async function sendViaMixer(data) {
  const api = await getApiByAbbr(data.currency);
  if (!api) throw "APINOTDEFINED";

  const dataToSend = {
    requestId: data.txId || uuid(),
    fromAddress: data.address_from,
    mixerAddresses: data.chain_addresses,
    toAddress: data.address_to,
    currencyId: config.CURRENCY_ALIAS[data.currency] || data.currency,
    amount: parseFloat((data.amount + "").replace(",", "."))
  };

  dataToSend.sign = sign(dataToSend);

  console.log("sendViaMixer:", dataToSend);

  let res = {};
  let err = null;
  try {
    res = await sendPostRequest(api, "v2/sendViaMixer", dataToSend);
  } catch (e) {
    err = JSON.stringify(e.response.data, null, 4);
    console.log("Catch error:", err);
  }

  console.log("sendViaMixer:res.data:", JSON.stringify(res.data, null, 4));

  return res && res.data
    ? { success: true, ...res.data }
    : { success: false, error: err };
}

async function cancelSendViaMixer(data) {
  const api = await getApiByAbbr(data.currency);
  if (!api) throw "APINOTDEFINED";

  console.log("cancelSendViaMixer:", data);

  const dataToSend = {
    requestId: data.requestId
  };

  let res = {};
  let err = null;
  try {
    res = await sendPostRequest(api, "v2/cancelSendViaMixer", dataToSend);
  } catch (e) {
    err = JSON.stringify(e.response.data, null, 4);
    console.log("Catch error:", err);
  }

  console.log(
    "cancelSendViaMixer:res.data:",
    JSON.stringify(res.data, null, 4)
  );

  return res && res.data
    ? { success: true, ...res.data }
    : { success: false, error: err };
}

async function getNonCustodialWallets(data, realm, user) {
  const wallets = await db.non_custodial_wallet.findAndCountAll({
    where: {
      user_id: user,
      removed: 0
    },
    attributes: ["id", "address", "currency", "memo", "last_pk_share_date"],
    raw: true,
    offset: data.start || 0,
    limit: data.limit || null
  });

  return { list: wallets.rows, count: wallets.count };
}

async function getAndSumWalletBalances(data) {
  const where = {
    merchant_id: data.merchant_id,
    currency: {
      [Op.in]: ["USDT", "USTR"]
    }
  };

  if (data.wallet_type != null) {
    where.wallet_type = data.wallet_type;
  }

  const wallets = await db.vw_accounts_with_gas.findAll({
    where,
    raw: true,
    attributes: ["address", "currency"]
  });

  const balances = await getWalletsBalances({
    accounts: wallets,
    sum_up_usdt: true
  });

  let total_balance = 0;

  balances.forEach((item) => {
    total_balance += item.crypto_wallet_balance || 0;
  });

  return { total_balance };
}

async function checkAddressExist(data) {
  const cryptoCurrency = await db.currency.findOne({
    where: { abbr: data.currency },
    raw: true
  });

  let res = null;

  if (cryptoCurrency.api) {
    try {
      res = await sendGetRequest(
        cryptoCurrency,
        `checkAddress/${data.address}`
      );
    } catch (e) {
      console.log(
        "Catch error [checkAddressExist]:",
        JSON.stringify(e.response.data, null, 4)
      );
    }
  }

  return { isExist: res && res.data ? res.data.isExist : false };
}

async function getAndSaveLatestFees() {
  const cryptoCurrency = await db.currency.findAll({
    where: { crypto: true },
    raw: true
  });

  let out = [];

  for (let item of cryptoCurrency)
    if (item.api) {
      let res;
      try {
        res = await sendGetRequest(item, "getLatestFee");
      } catch (e) {}
      if (res && res.data && res.data.fee) {
        out.push({
          abbr: item.abbr,
          ...res.data.fee
        });
      }
    }

  if (out.length) {
    await MemStore.set("latestfees", JSON.stringify(out));
  }

  return out;
}

async function getLatestFees() {
  const latestFees = await MemStore.get("latestfees");
  return latestFees ? JSON.parse(latestFees) : [];
}

async function getLatestFeesByCurrency(data) {
  const latestFees = await getLatestFees();

  if (latestFees && latestFees.length) {
    const fee = latestFees.find((item) => item.abbr == data.currency);
    return {
      abbr: data.currency,
      ...fee
    };
  }

  return { abbr: data.currency };
}

export default {
  create,
  getAccountByAddress,
  getAddress,
  sendPostRequest,
  getMasterAddress,
  getApiByAbbr,
  getExchangeRate,
  getMonitoringAddressByMerchant,
  getMonitoringAddressByAccount,
  getExternalAddressByMerchant,
  getProviderAddressByCurrency,
  sendCryptoPayment,
  saveCryptoTransferResult,
  getLatestFees,
  sendCryptoPaymentChecker,
  getSKBalance,
  checkMerchantWallet,
  sendToProviderViaWallet,
  sendCustom,
  getTxsByWallet,
  sendGetRequest,
  getExchangeRates,
  calculateAverageDailyRate,
  calculateTodaysNilRates,
  getWalletsBalances,
  createUpdateNonCustodialWallet,
  getWalletPrivateKey,
  getChainOfWallets,
  sendViaMixer,
  cancelSendViaMixer,
  getNonCustodialWallets,
  generateAddress,
  getAndSumWalletBalances,
  checkAddressExist,
  getLatestFeesByCurrency,
  getAndSaveLatestFees
};
