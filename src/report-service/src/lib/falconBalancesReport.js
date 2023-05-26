import db from "@lib/db";
import moment from "moment";
import Queue from "@lib/queue";
import request from "request";

const Op = db.Sequelize.Op;

const NIL_CURRENCY_ALIAS = {
  USDT: "UST",
  USDC: "USC"
};
const RATE_CURRENCY_ALIAS = {
  USTR: "USDT",
  USDC: "USDT"
};

// const nilBalances = [
//   { currency: "EUR", balance: 519759.390360023 },
//   { currency: "USD", balance: 40612.04063045 },
//   { currency: "USDT", balance: 504686.6392 },
//   { currency: "ETH", balance: 16 },
//   { currency: "BTC", balance: 0.0757 },
//   { currency: "BNB", balance: 0.0757 },
//   { currency: "TRX", balance: 0.0757 }
// ];

// const walletBalances = [
//   { abbr: "USDT", balance: 3.959935 },
//   { abbr: "ETH", balance: 0.1886003828 },
//   { abbr: "BTC", balance: 0.00839819 },
//   { abbr: "BNB", balance: 0.00839819 },
//   { abbr: "TRX", balance: 0.00839819 },
//   { abbr: "USTR", balance: 0.00839819 }
// ];

// const rates = {
//   rate_to_eur: {
//     EUR: 1,
//     USD: 1.061,
//     USDT: 1.062,
//     ETH: 0.0003612,
//     BTC: 0.00002675,
//     BNB: 0.002639,
//     TRX: 12.34
//   },
//   rate_to_usd: {
//     EUR: 0.9425,
//     USD: 1,
//     USDT: 1,
//     ETH: 0.0003405,
//     BTC: 0.00002521,
//     BNB: 0.002492,
//     TRX: 11.7
//   }
// };

async function prepareTplForFalconBalancesReport(data) {
  const nilBalances = await _getNilBalances();
  const walletBalances = await _getWalletBalances();
  const rates = await _getRates();
  const allBalances = await _getAllBalances(nilBalances, walletBalances);

  for (const balance of allBalances) {
    balance.rate_to_eur =
      rates.rate_to_eur[
        RATE_CURRENCY_ALIAS[balance.currency] || balance.currency
      ];
    balance.rate_to_usd =
      rates.rate_to_usd[
        RATE_CURRENCY_ALIAS[balance.currency] || balance.currency
      ];
  }

  const out = {};

  allBalances.sort((a, b) => {
    let fa = a.currency.toLowerCase(),
      fb = b.currency.toLowerCase();

    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
    return 0;
  });

  out.data = {
    report_generated: moment(new Date()).format("DD.MM.YYYY HH:mm"),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    balances: allBalances
  };

  out.report_name = "fbtb_fbalances_report";
  out.filename = `FALCON_BALANCES_REPORT-${out.data.report_generated}`;
  out.format = "xlsx";

  return out;
}

async function _getNilBalances() {
  const out = [];
  const curreniesList = await db.currency.findAll({
    where: { abbr: { [Op.ne]: "MLT" } },
    raw: true
  });

  const { result } = await Queue.newJob("falcon-service", {
    method: "getBalance",
    data: {}
  });

  for (const curr of curreniesList) {
    out.push({
      currency: curr.abbr,
      balance: result[NIL_CURRENCY_ALIAS[curr.abbr] || curr.abbr]
    });
  }
  return out;
}

async function _getWalletBalances() {
  const { result } = await Queue.newJob("ccoin-service", {
    method: "getSKBalance",
    data: {}
  });
  return result;
}

async function _getAllBalances(nilBalances, walletBalances) {
  const out = {};

  nilBalances.forEach((item) => {
    if (!out[item.currency])
      out[item.currency] = { nilBalance: 0, walletBalance: 0 };
    out[item.currency].nilBalance = parseFloat(item.balance) || 0;
  });

  walletBalances.forEach((item) => {
    if (!out[item.abbr]) out[item.abbr] = { nilBalance: 0, walletBalance: 0 };
    out[item.abbr].walletBalance = item.balance;
  });

  return Object.keys(out).map((key) => {
    return {
      currency: key,
      nilBalance: out[key].nilBalance,
      walletBalance: out[key].walletBalance
    };
  });
}

async function _getRates(nilBalances, walletBalances) {
  let currencyList = await db.currency.findAll({
    attributes: ["abbr"],
    raw: true
  });
  currencyList = currencyList.map((item) => item.abbr);

  const rate_to_eur = await sendRequest({
    fsyms: "EUR",
    tsyms: currencyList.join(",")
  });
  const rate_to_usd = await sendRequest({
    fsyms: "USD",
    tsyms: currencyList.join(",")
  });

  return {
    rate_to_eur: JSON.parse(rate_to_eur),
    rate_to_usd: JSON.parse(rate_to_usd)
  };
}

async function sendRequest(data) {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: `https://min-api.cryptocompare.com/data/price?fsym=${data.fsyms}&tsyms=${data.tsyms}`,
        method: "GET"
      },
      (error, response, body) => {
        if (!error) resolve(body);
        reject(error);
      }
    );
  });
}

export default {
  prepareTplForFalconBalancesReport
};
