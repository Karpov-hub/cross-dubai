import db from "@lib/db";
import Queue from "@lib/queue";
import MemStore from "@lib/memstore";
import Request from "./request.js";
import uuid from "uuid/v4";
import config from "@lib/config";

const Op = db.Sequelize.Op;

async function getInstruments(data, realm) {
  let reqData = {
    request: {
      path: "/instruments/",
      method: "GET"
    },
    json: {}
  };
  let response = await Request.sendRequest(reqData);
  return response;
}

async function requestForQuote(data, realm) {
  let reqData = {
    request: {
      path: "/request_for_quote/",
      method: "POST"
    },
    json: {
      instrument: `${data.currency}${data.to_currency}.SPOT`,
      side: "sell",
      quantity: data.amount,
      client_rfq_id: uuid()
    }
  };

  let response = await Request.sendRequest(reqData);
  return response;
}

async function withdrawal(data, realm) {
  let currency = await db.currency.findOne({
    where: {
      abbr: data.currency
    },
    raw: true
  });
  let settings = await db.settings.findOne({
    where: {
      key: "destination_bank_account"
    },
    raw: true
  });

  let reqData = {
    request: {
      path: "/withdrawal/",
      method: "POST"
    },
    json: {
      amount: data.amount,
      currency: data.currency
    }
  };

  if (currency && currency.crypto)
    reqData.json.destination_address = config.destination_address;
  if (currency && !currency.crypto && currency.abbr == "EUR")
    reqData.json.destination_bank_account = settings.value;

  let response = await Request.sendRequest(reqData);

  return response;
}

async function getBalance(data, realm) {
  const CURRENCY_ALIAS = {
    USDT: "UST",
    USDC: "USC"
  };

  const currencies = await db.currency.findAll({
    raw: true,
    attributes: ["abbr"]
  });

  let out = {};

  let reqData = {
    request: {
      path: "/balance/",
      method: "GET"
    },
    json: {}
  };
  let response = await Request.sendRequest(reqData);

  for (const curr of currencies) {
    if (response[CURRENCY_ALIAS[curr.abbr] || curr.abbr])
      out[CURRENCY_ALIAS[curr.abbr] || curr.abbr] =
        response[CURRENCY_ALIAS[curr.abbr] || curr.abbr];
  }

  return out;
}

async function exchange(data, realm) {
  let rfq = await requestForQuote(data);
  if (rfq.errors) return rfq;

  let reqData = {
    request: {
      path: "/trade/",
      method: "POST"
    },
    json: {
      instrument: rfq.instrument,
      side: rfq.side,
      quantity: rfq.quantity,
      price: rfq.price,
      rfq_id: rfq.rfq_id
    }
  };
  let response = await Request.sendRequest(reqData);
  return response;
}

export default {
  withdrawal,
  getBalance,
  exchange
};
