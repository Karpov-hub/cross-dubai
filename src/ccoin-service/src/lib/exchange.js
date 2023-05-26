import api from "./api";
import config from "@lib/config";
import db from "@lib/db";
import Wallet from "./wallet";
import Queue from "@lib/queue";

let apiToken;

const CURRENCY_ALIAS = {
  ETH_USDT: "USDT",
  TRX_USDT: "USTR"
};

function correctCurrency(cur, dir) {
  if (dir == 1) {
    for (let k in CURRENCY_ALIAS) {
      if (CURRENCY_ALIAS[k] == cur) return k;
    }
    return cur;
  }
  if (CURRENCY_ALIAS[cur]) return CURRENCY_ALIAS[cur];
  return cur;
}

async function auth() {
  const res = await sendPost("user/auth", config.swap.auth, true);
  if (res.data && res.data.result.status == "COMPLETED")
    return res.data.token.tokenType + " " + res.data.token.accessToken;
  throw "SWAPAUTHERROR";
}

async function sendGet(action, params) {
  if (!apiToken) apiToken = await auth();

  const opt = { api: config.swap.endpoint, apitoken: apiToken };

  return await api.sendGetRequest(opt, action, params);
}

async function sendPost(action, data, doAuth) {
  if (!doAuth) apiToken = await auth();

  const opt = { api: config.swap.endpoint };
  if (!doAuth) opt.apitoken = apiToken;

  return await api.sendPostRequest(opt, action, data);
}

async function createExchange(data, transfer) {
  const sign = api.sign(
    {
      requestId: data.requestId,
      fromAddress: data.fromAddress,
      fromCurrency: correctCurrency(data.fromCurrency, 1),
      fromAmount: data.fromAmount,
      toAddress: data.toAddress,
      toCurrency: correctCurrency(data.toCurrency, 1)
    },
    config.swap.secretKey
  );

  const exchangeRes = await callExchangeAPI(
    {
      ...data,
      sign
    },
    0
  );
  if (exchangeRes.ok) return exchangeRes.result;
  await saveErrorToTransfer(transfer, exchangeRes.result.data);
  throw "SWAPERROR";
}

async function saveErrorToTransfer(transfer, data) {
  transfer.data.swapError = data;
  await db.transfer.update(
    { data: transfer.data },
    { where: { id: transfer.id } }
  );
}

function callExchangeAPI(data, i) {
  return new Promise(async (res, rej) => {
    const result = await sendPost("tx/createExchange", data);
    if (result && result.data && result.data.depositAddress)
      return res({ ok: true, result });
    if (i >= config.coinexAttempts) {
      return res({ ok: false, result: result });
    }
    setTimeout(async () => {
      const r = await callExchangeAPI(data, i + 1);
      res(r);
    }, config.coinexPauseBetweenAttempts);
  });
}

function getVarValue(name, vars) {
  for (let v of vars) {
    if (v.key == name) return v.value;
  }
  return null;
}

async function swap(data) {
  const fromAddress = data.planStep.from.extra; //getVarValue("FROM_ADDRESS", data.payment.variables);
  const fromCurrency = correctCurrency(data.planStep.from.currency, 1);
  const toAddress = data.planStep.to.extra; //getVarValue("TO_ADDRESS", data.payment.variables);
  const toCurrency = correctCurrency(data.planStep.to.currency, 1);
  const requestId = data.payment.transfer.id;

  const exchangeOpt = {
    requestId,
    fromAddress,
    fromCurrency,
    fromAmount: data.payment.amount,
    toAddress,
    toCurrency
  };

  let res = await createExchange(exchangeOpt, data.payment.transfer);

  const dataToSend = {
    txId: data.payment.transfer.id,
    address_from: exchangeOpt.fromAddress,
    address_to: res.data.depositAddress,
    currency: data.payment.plan[0].currency,
    amount: data.payment.amount,
    result_amount: res.data.depositAmount,
    currency_to: exchangeOpt.toCurrency
  };

  const sendRes = await Wallet.sendCustom(dataToSend);

  return {
    ref_id: requestId,
    amount: res.data.depositAmount,
    net: sendRes,
    accept: false
  };
}

async function callback(data, realmId) {
  if (!data || !data.requestId) throw "REQUESTIDMISSED";
  const tx = await db.transfer.findOne({
    where: { id: data.requestId },
    attributes: ["id"],
    raw: true
  });

  if (!tx) throw "TRANSFERNOTFOUND";

  const res = await Queue.newJob("account-service", {
    method: "accept",
    data: {
      transfer_id: tx.id,
      ref_id: "",
      amount: data.toAmount || 0,
      currency: data.toCurrency || ""
    },
    realmId
  });

  return {
    success: res && res.result && !!res.result.provided
  };
}

async function getExchangeRate(data, transfer) {
  const params = {
    fromCurrency: correctCurrency(data.fromCurrency, 1),
    toCurrency: correctCurrency(data.toCurrency, 1),
    fromAmount: data.fromAmount
  };

  let res = {};
  let err = null;
  try {
    res = await sendGet("tx/getExchangeRate", params);
  } catch (e) {
    err = JSON.stringify(e.response.data, null, 4);
    console.log("Catch error:", err);
  }

  return res && res.data
    ? { success: true, ...res.data }
    : { success: false, error: err };
}

async function getSwapLimits(data) {
  let res = {};
  let err = null;
  try {
    res = await sendGet("tx/getExchangePairs", {});
  } catch (e) {
    err = JSON.stringify(e.response.data, null, 4);
    console.log("Catch error:", err);
  }

  if (err) return { success: false, error: err };
  const required_currencies = ["USDT", "ETH", "TRX", "USTR"];

  let currency_limits_list = res.data.exchangePairs
    .map((el) => ({
      from: correctCurrency(el.from),
      to: correctCurrency(el.to),
      tradeMin:
        Number(el.tradeMin) +
        (Number(el.tradeMin) / 100) * config.NF_CORRECTION_FACTOR
    }))
    .filter(
      (el) =>
        required_currencies.includes(el.from) &&
        required_currencies.includes(el.to)
    );
  return { success: true, currency_limits_list };
}

export default {
  swap,
  callback,
  getExchangeRate,
  getSwapLimits
};
