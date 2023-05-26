import request from "request";
import config from "@lib/config";
import db from "@lib/db";
import uuid from "uuid/v4";
import Queue from "@lib/queue";

const CURRENCY_PREFERENCES = {
  USDT: {
    alias: "UST",
    address_suffix: "USDT ERC 20",
    address_protocol: "ERC20"
  },
  BTC: {
    alias: "BTC",
    address_suffix: "automation BTC",
    address_protocol: null
  }
};

async function sendRequest(data) {
  return new Promise(async (resolve, reject) => {
    //console.log("uri:", config.b2c2_host + data.request.path);
    //console.log("data.json:", data.json);
    const requestData = {
      uri: config.b2c2_host + data.request.path,
      method: data.request.method,
      headers: {
        Authorization: config.b2c2_api_token
      },
      json: data.json
    };

    const log_data = {
      id: uuid(),
      ctime: new Date(),
      request: JSON.stringify(data),
      removed: 0
    };

    await db.nil_log.create(log_data);

    request(requestData, async (error, response, body) => {
      // console.log("response:", response);
      // console.log("body:", body);

      if (!error) {
        await db.nil_log.update(
          { response: JSON.stringify(body) },
          { where: { id: log_data.id } }
        );
        resolve(body);
      } else {
        await db.nil_log.update(
          { response: JSON.stringify(error) },
          { where: { id: log_data.id } }
        );
        reject(error);
      }
    });
  });
}

async function getAllInstruments() {
  const reqData = {
    request: {
      path: "/instruments/",
      method: "GET"
    }
  };
  const json = await sendRequest(reqData);

  return JSON.parse(json);
}

function getCurrName(abbr) {
  return CURRENCY_PREFERENCES[abbr] ? CURRENCY_PREFERENCES[abbr].alias : abbr;
}

async function getInstrument(from, to) {
  const instruments = await getAllInstruments();

  const curNameFrom = getCurrName(from);
  const curNameTo = getCurrName(to);

  const sell = `${curNameFrom}${curNameTo}`;
  const buy = `${curNameTo}${curNameFrom}`;
  for (let instrument of instruments) {
    if (instrument.underlier == sell) {
      return {
        type: "sell",
        instrument: instrument.name
      };
    }
    if (instrument.underlier == buy) {
      return {
        type: "buy",
        instrument: instrument.name
      };
    }
  }
  return;
}

async function checkInstrument(instrument) {
  const instruments = await getAllInstruments();

  for (let item of instruments) {
    if (item.name == instrument) return true;
  }
  return false;
}

async function getExchangeRate(from, to, quantity) {
  let instrument = await getInstrument(from, to);
  if (!instrument) return null;
  const reqData = {
    request: {
      path: "/request_for_quote/",
      method: "POST"
    },
    json: {
      instrument: instrument.instrument,
      side: instrument.type,
      quantity: 1, //quantity || 1,
      client_rfq_id: uuid()
    }
  };

  //console.log("getExchangeRate.json:", reqData.json);
  const json = await sendRequest(reqData);
  //console.log("getExchangeRate.result:", json);
  return json
    ? instrument.type == "sell"
      ? 1 / json.price
      : json.price
    : null;
}

async function instrument(instrument, abbr) {
  if (!(await checkInstrument(instrument))) throw "INSTRUMENTNOTFOUND";

  const currency_min_quote = await db.currency.findOne({
    where: { abbr },
    attributes: ["min_quote"]
  });

  const reqData = {
    request: {
      path: "/request_for_quote/",
      method: "POST"
    },
    json: {
      instrument,
      side: "sell",
      quantity: currency_min_quote.min_quote || 1,
      client_rfq_id: uuid()
    }
  };

  let res = await sendRequest(reqData);

  return res;
}

async function withdrawal(amount, currency, address_value) {
  if (!amount) throw "AMOUNTREQUIRED";
  amount = parseFloat(amount);
  if (isNaN(amount)) throw "AMOUNTMUSTBENUMBER";

  let listWithdrawalDecimals = await Queue.newJob("merchant-service", {
    method: "getWithdrawalDecimalsOfCurrencies",
    data: {}
  });

  const json = {
    amount: amount.toFixed(listWithdrawalDecimals.result[currency] || 2),
    currency: getCurrName(currency),
    destination_address: {
      address_value,
      address_suffix: CURRENCY_PREFERENCES[currency]
        ? CURRENCY_PREFERENCES[currency].address_suffix
        : "tag0",
      address_protocol: CURRENCY_PREFERENCES[currency]
        ? CURRENCY_PREFERENCES[currency].address_protocol
        : null
    }
  };
  //console.log("JSON", json);
  const reqData = {
    request: {
      path: "/withdrawal/",
      method: "POST"
    },
    json
  };
  console.log("withdrawal.json:", reqData.json);
  const resJson = await sendRequest(reqData);
  console.log("withdrawal.result:", resJson);
  return resJson;
}

function getDate(duration) {
  const dt = new Date(Date.now() + duration),
    y = dt.getFullYear(),
    m = dt.getMonth() + 1,
    d = dt.getDate(),
    h = dt.getHours(),
    i = dt.getMinutes(),
    s = dt.getSeconds();

  return `${y}-${m > 9 ? "" : "0"}${m}-${d > 9 ? "" : "0"}${d}T${
    h > 9 ? "" : "0"
  }${h}:${i > 9 ? "" : "0"}${i}:${s > 9 ? "" : "0"}${s}`;
}

async function exchange(
  amount,
  currency_crypto,
  currency_fiat,
  order_id,
  price,
  valid_until
) {
  const instrument = await getInstrument(currency_fiat, currency_crypto);

  if (!instrument || !instrument.instrument)
    throw `INSTRUMENTNOTFOUND:${currency_fiat}>${currency_crypto}`;

  const json = {
    instrument: instrument.instrument,
    side: instrument.type,
    quantity: amount.toFixed(4),
    client_order_id: order_id,
    order_type: "MKT",
    valid_until: valid_until || getDate(3600000),
    executing_unit: "automation"
  };

  const reqData = {
    request: {
      path: "/order/",
      method: "POST"
    },
    json
  };
  console.log("exchange.json:", reqData.json);
  const resJson = await sendRequest(reqData);
  console.log("exchange.result:", resJson);
  return resJson;
}

async function withdrawalToBank(amount, currency, destBankAcc) {
  if (!amount) throw "AMOUNTREQUIRED";
  amount = parseFloat(amount);
  if (isNaN(amount)) throw "AMOUNTMUSTBENUMBER";

  let listWithdrawalDecimals = await Queue.newJob("merchant-service", {
    method: "getWithdrawalDecimalsOfCurrencies",
    data: {}
  });

  const json = {
    amount: amount.toFixed(listWithdrawalDecimals.result[currency] || 2),
    currency: getCurrName(currency),
    destination_bank_account: destBankAcc
  };

  const reqData = {
    request: {
      path: "/withdrawal/",
      method: "POST"
    },
    json
  };

  console.log("withdrawalToBank.json:", reqData.json);
  const resJson = await sendRequest(reqData);
  console.log("withdrawalToBank.result:", resJson);
  return resJson;
}

async function getExchangeRateWithSide(from, to, quantity) {
  let instrument = await getInstrument(from, to);
  if (!instrument) return null;
  const reqData = {
    request: {
      path: "/request_for_quote/",
      method: "POST"
    },
    json: {
      instrument: instrument.instrument,
      side: instrument.type,
      quantity: 1,
      client_rfq_id: uuid()
    }
  };

  const json = await sendRequest(reqData);
  return {
    price: json
      ? instrument.type == "sell"
        ? 1 / json.price
        : json.price
      : null,
    side: instrument.type
  };
}

export default {
  sendRequest,
  instrument,
  withdrawal,
  exchange,
  getExchangeRate,
  withdrawalToBank,
  getExchangeRateWithSide
};
