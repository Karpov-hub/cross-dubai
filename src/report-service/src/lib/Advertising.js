import moment from "moment";
import dbHelper from "./dbHelper";
import db from "@lib/db";
import config from "@lib/config";
const request = require("request"); // scope:server
const username = "ittech",
  password = "RhaKvyAaAGS3sWV2"; // scope:server

/**
 @param params is an object: 
 {
  @param campaignID
  @param fromDate YYYY-MM-DD,
  @param toDate YYYY-MM-DD,
  @param groupBy 'day' or 'month'
 }
 */
async function getAdvertisingData(params) {
  let opts = {
    uri: `${config.ittechavURL}/api/campaign-report/`,
    method: "GET",
    rejectUnauthorized: false,
    requestCert: true,
    agent: false,
    qs: params,
    headers: {
      Authorization:
        "Basic " + new Buffer(username + ":" + password).toString("base64")
    }
    // headers: { "Content-Type": "application/json;charset=utf-8" }
  };
  return new Promise(async (resolve, reject) => {
    request(opts, async (err, res) => {
      if (err) {
        console.log(err);
        return resolve({
          success: false,
          error: err.code
        });
      }
      if (!res || !res.body) {
        return resolve({ success: false });
      }
      res.body = JSON.parse(res.body);
      if (!res.body.success) return resolve(res.body);

      if (res && res.body && res.body.success) {
        res.body.data.success = true;
        return resolve(res.body.data);
      }
    });
  });
}

async function prepareTplData(data) {
  data.add_days = data.hasOwnProperty("add_days") ? data.add_days : true;
  const qParams = {
    campaignID: data.campaignID,
    fromDate: data.add_days ? addDays(data.date_from, 1) : data.date_from,
    toDate: data.add_days ? addDays(data.date_to, 1) : data.date_to,
    groupBy: "day"
  };

  const report = {};
  let userInfo = {};
  let generalInfo = {};
  let usdTransferPeriods = [],
    eurTransferPeriods = [];
  let transfers_sum_eur = data.total_spent ? data.total_spent : 0,
    sum_eur_for_calculates = 0,
    transfers_sum_usd = data.total_spent ? data.total_spent : 0,
    rateUSD = 0,
    rateEUR = 0,
    ratioEUR = 0,
    ratioUSD = 0,
    eCPMeur = 0,
    eCPMusd = 0;

  if (!data.order_id) {
    return { success: false, error: "ORDERNOTFOUND" };
  }

  const transfers =
    process.env.NODE_ENV && process.env.NODE_ENV.includes("test")
      ? dbHelper.getMockupTransfers()
      : await dbHelper.getTransfers({
          merchant_id: data.merchant_id,
          date_from: data.date_from,
          date_to: data.date_to,
          // ref_id: data.order_id,
          type: "withdrawal"
        });
  if (!data.koeff && (!transfers || !transfers.count)) {
    report.error = "ORDERHASNOTRANSFERS";
    return report;
  }

  if (data.manual_transfers && data.manual_transfers.length)
    transfers.list = transfers.list.concat(data.manual_transfers);

  let transfers_eur = transfers.list.filter((tx) => tx.data.currency == "EUR");
  let transfers_usd = transfers.list.filter((tx) => tx.data.currency == "USD");

  const dataFromIttechav =
    process.env.NODE_ENV && process.env.NODE_ENV.includes("test")
      ? await _getDataFromIttechav()
      : await getAdvertisingData(qParams);

  if (!dataFromIttechav.success) {
    return { error: dataFromIttechav.message || dataFromIttechav.error };
  }

  // filling general & user info
  userInfo = dataFromIttechav.userInfo;
  generalInfo = dataFromIttechav.general;

  let merchantData = await dbHelper.getMerchantById(data.merchant_id);

  merchantData = merchantData || {};
  userInfo.company = merchantData.name || "Not specified";
  userInfo.registration = merchantData.registration || "Not specified";
  let merchantCountry = await dbHelper.getCountryByAbbr(
    merchantData.country || "TEST"
  );
  merchantCountry = merchantCountry || {};
  let merchantAddress = [merchantData.zip, merchantCountry.name];
  if (merchantData.region != "") merchantAddress.push(merchantData.region);
  merchantAddress.push(
    merchantData.city,
    merchantData.city_district,
    merchantData.street,
    merchantData.house,
    merchantData.short_address
  );
  merchantAddress = merchantAddress.filter((n) => n);
  userInfo.address = merchantAddress.join(", ");

  const total_spent_usdt = generalInfo.spent.usd;
  let general_stats = dataFromIttechav.stats.find((el) =>
    el.name.toLowerCase().includes("general")
  );
  if (general_stats) general_stats = general_stats.data;
  if (!general_stats || !general_stats.length) {
    return { ...data, success: false, error: "Data from API is empty" };
  }
  general_stats = formatDateInTxs(general_stats);

  if (!data.total_spent && transfers_eur && transfers_eur.length)
    transfers_sum_eur = transfers_eur.reduce(
      (previous, current) => parseFloat(previous) + parseFloat(current.amount),
      0
    );

  if (!data.total_spent && transfers_usd && transfers_usd.length)
    transfers_sum_usd = transfers_usd.reduce(
      (previous, current) => parseFloat(previous) + parseFloat(current.amount),
      0
    );
  if (transfers_usd && transfers_usd.length) {
    rateUSD = dataFromIttechav.general.spent.usd / transfers_sum_usd;
    ratioUSD = transfers_sum_usd / dataFromIttechav.general.spent.usd;
    transfers_usd = await getTransferPeriods(transfers_usd);
    usdTransferPeriods = await getKoefficients({
      transferPeriods: transfers_usd,
      general_stats
    });
  }
  if (transfers_eur && transfers_eur.length) {
    rateEUR =
      (dataFromIttechav.general.spent.usd - transfers_sum_usd) /
      transfers_sum_eur;
    sum_eur_for_calculates = transfers_sum_eur * rateEUR;
    ratioEUR = sum_eur_for_calculates / dataFromIttechav.general.spent.usd;

    transfers_eur = await getTransferPeriods(transfers_eur);
    eurTransferPeriods = await getKoefficients({
      transferPeriods: transfers_eur,
      general_stats
    });
  }

  if (!rateEUR && transfers_eur && transfers_eur.length) rateEUR = data.koeff;
  if (!rateUSD && transfers_usd && transfers_usd.length) rateUSD = data.koeff;

  if (rateUSD)
    general_stats = await calculateTxGeneralStatsOneCurr({
      transferPeriods: usdTransferPeriods,
      general_stats,
      rate: rateUSD
    });
  if (rateEUR)
    general_stats = await calculateTxGeneralStatsOneCurr({
      transferPeriods: eurTransferPeriods,
      general_stats,
      rate: rateEUR
    });
  if (ratioUSD != 0 && ratioEUR != 0) {
    general_stats = await calculateTxGeneralStats({
      transferPeriods: usdTransferPeriods,
      general_stats
    });
    general_stats = await calculateTxGeneralStats({
      transferPeriods: eurTransferPeriods,
      general_stats
    });
  }

  let our_stats = {};

  for (const stat of dataFromIttechav.stats) {
    our_stats[stat.name] = [];
    if (stat.name.toLowerCase().includes("general"))
      our_stats[stat.name] = [...general_stats];

    if (ratioUSD != 0 && ratioEUR != 0) {
      let total_impressions = getTotalImpressions(stat.data);
      stat.data = calculateImpressions({
        ...stat,
        ratioUSD,
        ratioEUR,
        total_impressions,
        sum_eur_for_calculates,
        total_spent_usdt,
        rateEUR
      });
    }
    if (rateEUR != 0) rateEUR = calculateRateEur(stat.data, transfers_sum_eur);
    for (const tx of stat.data) {
      if (!stat.name.toLowerCase().includes("general")) {
        let amount_eur = 0,
          amount_usd = 0;
        if (ratioUSD != 0 && ratioEUR != 0) {
          data.report_name = "AdvertisingReportTwo";
          amount_eur = (parseFloat(tx.usd) * ratioEUR).toFixed(2);
          amount_usd = (parseFloat(tx.usd) * ratioUSD).toFixed(2);
          eCPMeur = ((tx.spent_eur_calc / tx.impressions_eur) * 1000).toFixed(
            2
          );
          eCPMusd = ((amount_usd / tx.impressions_usd) * 1000).toFixed(2);
        } else if (rateEUR != 0) {
          amount_eur = (parseFloat(tx.usd) / rateEUR).toFixed(2);
          eCPMeur = ((amount_eur / tx.impressions) * 1000).toFixed(2);
        } else if (rateUSD != 0) {
          amount_usd = (parseFloat(tx.usd) / rateUSD).toFixed(2);
          eCPMusd = ((amount_usd / tx.impressions) * 1000).toFixed(2);
        }

        delete tx.impressions_coefficient_row;
        delete tx.spent_coefficient_row;
        delete tx.spent_eur_calc;
        delete tx.impressions_eur;
        delete tx.impressions_usd;
        if (ratioUSD != 0 && ratioEUR != 0)
          our_stats[stat.name].push({
            ...tx,
            eur: amount_eur + " EUR",
            usd: amount_usd + " USD",
            ecpm_eur: eCPMeur + " EUR",
            ecpm_usd: eCPMusd + " USD"
          });
        else {
          amount_eur = amount_eur && amount_eur + " EUR";
          amount_usd = amount_usd && amount_usd + " USD";
          eCPMeur = eCPMeur && eCPMeur + " EUR";
          eCPMusd = eCPMusd && eCPMusd + " USD";
          our_stats[stat.name].push({
            ...tx,
            amount: amount_eur || amount_usd,
            ecpm: eCPMeur || eCPMusd
          });
        }
      }
    }
  }
  report.data = {
    url: data.websites || generalInfo.url,
    spent_total: rateEUR
      ? `${transfers_sum_eur.toFixed(2)} EUR`
      : `${transfers_sum_usd.toFixed(2)} USD`,
    general_stats: our_stats["General stats"],
    ad_groups_data: our_stats["Ad Groups Data"],
    geo_stats: our_stats["Geo Stats"],
    device_stats: our_stats["Device Stats"],
    os_stats: our_stats["OS Stats"]
  };
  let sign_data = {
    company_name: userInfo.company,
    ...(await setAdditionalDataForSign(merchantData.categories, data.order_id))
  };

  report.data = { ...generalInfo, ...userInfo, ...report.data, sign_data };

  report.data.dateFrom = formatDate(report.data.dateFrom);
  report.data.dateTo = formatDate(report.data.dateTo);

  let userInfo_from = new Date(report.data.dateFrom),
    userInfo_to = new Date(report.data.dateTo);
  report.data.dateFrom = moment(
    new Date(
      new Date(
        userInfo_from.getFullYear(),
        userInfo_from.getMonth(),
        1
      ).getTime() -
        userInfo_from.getTimezoneOffset() * 60000
    )
  ).format("DD.MM.YYYY");
  report.data.dateTo = moment(
    new Date(
      new Date(
        userInfo_to.getFullYear(),
        userInfo_to.getMonth() + 1,
        0
      ).getTime() -
        userInfo_to.getTimezoneOffset() * 60000
    )
  ).format("DD.MM.YYYY");

  report.report_name = data.report_name;
  report.format = data.format;
  report.filename = `${userInfo.company} ${generalInfo.dateFrom} - ${generalInfo.dateTo}`;

  report.attachFileToOrder = attachFileToOrder;
  report.order_id = data.job_id;
  report.type = "Advertising report";
  return report;
}

async function setAdditionalDataForSign(category_id, order_id) {
  let sign_data = {};
  if (category_id) {
    let category_data = await db.categories_merchant.findOne({
      where: { id: category_id },
      attributes: ["name"],
      raw: true
    });
    sign_data.category = category_data.name;
  }
  let signatories = await getSignatories(order_id);
  sign_data = { ...sign_data, ...signatories };
  return sign_data;
}

async function getSignatories(order_id) {
  let { contract_id = null } =
    (await db.order.findOne({
      where: { id: order_id },
      attributes: ["contract_id"],
      raw: true
    })) || {};
  if (!contract_id) return {};

  let contract_data = await db.contract.findOne({
    where: { id: contract_id },
    attributes: ["director_name", "other_signatories"],
    raw: true
  });
  let result = { signatory_1: contract_data.director_name };
  if (
    contract_data.other_signatories &&
    (contract_data.other_signatories.hasOwnProperty("signatory2") ||
      contract_data.other_signatories.hasOwnProperty("signatory3"))
  ) {
    for (let key of Object.keys(contract_data.other_signatories)) {
      if (result.signatory_2) {
        result.signatory_3 = contract_data.other_signatories[key];
      } else result.signatory_2 = contract_data.other_signatories[key];
    }
  }
  return result;
}

async function attachFileToOrder(data) {
  const uuid = require("uuid/v4");

  data.id = data.id || uuid();
  const insData = {
    id: data.id,
    code: data.code,
    name: data.name,
    ctime: new Date(),
    mtime: new Date(),
    owner_id: data.owner_id,
    type: data.type,
    invoice_id: data.invoice_id,
    removed: 0
  };
  let res = await db.file.create(insData, { raw: true });

  if (res) return { success: true, ...res };
  return { success: false };
}

function getTotalImpressions(stat) {
  if (!stat && !stat.length) return 0;
  return stat.reduce(
    (previous, current) => Number(previous) + Number(current.impressions),
    0
  );
}

function calculateImpressions(data) {
  if (!data || !data.data.length) return data;
  return data.data.map((el) => {
    el.impressions_eur = Math.round(el.impressions * data.ratioEUR);
    el.impressions_usd = Math.round(el.impressions * data.ratioUSD);
    el.impressions_coefficient_row =
      (el.impressions / data.total_impressions) * 100;
    el.spent_coefficient_row = el.usd / data.total_spent_usdt;
    el.spent_eur_calc =
      (data.sum_eur_for_calculates * el.spent_coefficient_row) / data.rateEUR;
    return el;
  });
}

async function getTransferPeriods(data) {
  let periodAmount = [];
  if (!data) return [];
  for (const tx of data) {
    let sum = parseFloat(tx.amount);
    let date = moment(tx.ctime).format("YYYY/MM/DD");
    let currency = tx.data.currency;
    for (const _tx of data) {
      let _date = moment(_tx.ctime).format("YYYY/MM/DD");
      if (_date == date && _tx.id != tx.id) {
        sum += parseFloat(_tx.amount);
      }
    }
    if (periodAmount.find((el) => el.date === date)) continue;
    periodAmount.push({
      date,
      sum,
      currency
    });
  }
  periodAmount.sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1));
  return periodAmount;
}

function calculateRateEur(tx_list, transfers_sum_eur) {
  let sum_spent = 0;
  for (let tx of tx_list) {
    sum_spent += tx.usd;
  }
  return sum_spent / transfers_sum_eur;
}
function formatDate(date) {
  if (!date) return "-";
  if (date.includes(".")) {
    let format_date = date.split(".");
    return `${format_date[2]}/${format_date[1]}/${format_date[0]}`;
  }
  return date;
}
// input format 21.05.2021 => output 2021/05/21
function formatDateInTxs(transactions) {
  if (!transactions) return false;
  transactions.forEach((tx) => {
    tx.date = formatDate(tx.date);
  });
  return transactions;
}
// we need koefficients for recalculate sent amount in other currency
// It is only for GENERAL STATS cause of dates.
async function getKoefficients({ transferPeriods, general_stats }) {
  if (!transferPeriods || !general_stats) return [];
  for (let i = 0; i < transferPeriods.length; i++) {
    let sum = 0;
    let period = transferPeriods[i];
    let nextItem = period;
    if (i < transferPeriods.length - 1) nextItem = transferPeriods[i + 1];
    for (const tx of general_stats) {
      sum += tx.usd;
    }
    transferPeriods[i].koefficient = (period.sum / sum) * 100;
  }

  return transferPeriods;
}

function calculateTxGeneralStats({ transferPeriods, general_stats }) {
  if (!transferPeriods || !general_stats) return [];
  // get a copy general stats array without referencies
  let out = JSON.parse(JSON.stringify(general_stats));

  for (let i = 0; i < transferPeriods.length; i++) {
    let amount = 0;
    let period = transferPeriods[i];
    let nextItem = period;
    if (i < transferPeriods.length - 1) nextItem = transferPeriods[i + 1];
    out.forEach((tx) => {
      const tx_currency = transferPeriods[i].currency.toLowerCase();
      amount = ((tx.usd / 100) * period.koefficient).toFixed(2);
      if (tx_currency == "usd")
        tx.impressions_usd = Math.round(
          (tx.impressions * period.koefficient) / 100
        );
      else
        tx.impressions_eur = Math.round(
          tx.impressions - (tx.impressions_usd || 0)
        );
      tx[`ecpm_${tx_currency}`] =
        ((amount / tx[`impressions_${tx_currency}`]) * 1000).toFixed(2) +
        ` ${tx_currency}`.toUpperCase();
      tx[`amount_${tx_currency}`] = amount + ` ${tx_currency}`.toUpperCase();
    });
  }
  return out;
}

function calculateTxGeneralStatsOneCurrWithoutTransfers(
  general_stats,
  rate,
  currency
) {
  general_stats.forEach((tx) => {
    if (rate) {
      tx.amount = (tx.usd / rate).toFixed(2) + ` ${currency}`;
      tx.ecpm =
        (
          (parseFloat((tx.usd / rate).toFixed(2)) / tx.impressions) *
          1000
        ).toFixed(2) + ` ${currency}`;
    }
  });
  return general_stats;
}

function calculateTxGeneralStatsOneCurr({
  transferPeriods,
  general_stats,
  rate = 0
}) {
  if (!transferPeriods || !transferPeriods.length) {
    if (!general_stats) return [];
    return calculateTxGeneralStatsOneCurrWithoutTransfers(
      JSON.parse(JSON.stringify(general_stats)),
      rate,
      "EUR"
    );
  }
  // get a copy general stats array without referencies
  let out = JSON.parse(JSON.stringify(general_stats));
  for (let i = 0; i < transferPeriods.length; i++) {
    let period = transferPeriods[i];
    let nextItem = period;
    if (i < transferPeriods.length - 1) nextItem = transferPeriods[i + 1];
    out.forEach((tx) => {
      if (rate) {
        tx.amount = (tx.usd / rate).toFixed(2) + ` ${period.currency}`;
        tx.ecpm =
          (
            (parseFloat((tx.usd / rate).toFixed(2)) / tx.impressions) *
            1000
          ).toFixed(2) + ` ${period.currency}`;
      } else {
        tx.amount =
          ((tx.usd / 100) * period.koefficient).toFixed(2) +
          ` ${period.currency}`;
        tx.ecpm =
          (
            (parseFloat(((tx.usd / 100) * period.koefficient).toFixed(2)) /
              tx.impressions) *
            1000
          ).toFixed(2) + ` ${period.currency}`;
      }
    });
  }
  return out;
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

//* FOR DEBUG LOCAL DATA WITHOUT REMOTE REQUEST
function _getDataFromIttechav() {
  return {
    general: {
      spent: {
        usd: 3065062.45
      }
    },
    countGroups: 1,
    url: "Not specified",
    name: "Campeiro 1",
    dateFrom: "01.12.2021",
    dateTo: "11.12.2021",
    userInfo: {
      company: "Campeiro Limited",
      address:
        "Hong Kong, Sheung Wan, 111 Bonham Strand, MW Tower, 7/F Companz",
      registration: "2933264",
      id: "616eed1aab923d79467e1374",
      email: "campierolimited@gmail.com"
    },
    stats: [
      {
        name: "General stats",
        data: [
          {
            date: "25.06.2021",
            impressions: 13776383,
            clicks: 10762,
            ctr: 0.08,
            ecpm: 20.16,
            usd: 75437.61
          },

          {
            date: "26.06.2021",
            impressions: 13798246,
            clicks: 14576,
            ctr: 0.11,
            ecpm: 20.22,
            usd: 37241.11
          },
          {
            date: "27.06.2021",
            impressions: 13902182,
            clicks: 10140,
            ctr: 0.07,
            ecpm: 20.22,
            usd: 79062.4
          },
          {
            date: "28.06.2021",
            impressions: 1234545,
            clicks: 10123,
            ctr: 0.13,
            ecpm: 21.23,
            usd: 86605.85
          },
          {
            date: "01.07.2021",
            impressions: 13779389,
            clicks: 10946,
            ctr: 0.08,
            ecpm: 20.22,
            usd: 55005.97
          },
          {
            date: "02.07.2021",
            impressions: 13813287,
            clicks: 10139,
            ctr: 0.07,
            ecpm: 21.16,
            usd: 84224.65
          },
          {
            date: "05.07.2021",
            impressions: 13813010,
            clicks: 10188,
            ctr: 0.07,
            ecpm: 23.04,
            usd: 94005.51
          },
          {
            date: "06.07.2021",
            impressions: 13760774,
            clicks: 10312,
            ctr: 0.07,
            ecpm: 23.02,
            usd: 79636.07
          },
          {
            date: "07.07.2021",
            impressions: 13742751,
            clicks: 10139,
            ctr: 0.07,
            ecpm: 25.23,
            usd: 93585.79
          },
          {
            date: "08.07.2021",
            impressions: 13828017,
            clicks: 10199,
            ctr: 0.07,
            ecpm: 25.23,
            usd: 98360.63
          },
          {
            date: "09.07.2021",
            impressions: 1761,
            clicks: 18,
            ctr: 1.02,
            ecpm: 60.52,
            usd: 94241.14
          },
          {
            date: "12.07.2021",
            impressions: 70066,
            clicks: 292,
            ctr: 0.42,
            ecpm: 62.07,
            usd: 104734.92
          },
          {
            date: "13.07.2021",
            impressions: 94658,
            clicks: 107,
            ctr: 0.11,
            ecpm: 26.62,
            usd: 46741.77
          },
          {
            date: "15.07.2021",
            impressions: 843,
            clicks: 0,
            ctr: 0,
            ecpm: 28.58,
            usd: 89664.55
          },
          {
            date: "16.07.2021",
            impressions: 843,
            clicks: 0,
            ctr: 0,
            ecpm: 28.58,
            usd: 14597.2
          },
          {
            date: "17.07.2021",
            impressions: 843,
            clicks: 0,
            ctr: 0,
            ecpm: 28.58,
            usd: 99603.03
          },
          {
            date: "21.07.2021",
            impressions: 843,
            clicks: 0,
            ctr: 0,
            ecpm: 28.58,
            usd: 84344.34
          },
          {
            date: "22.07.2021",
            impressions: 843,
            clicks: 0,
            ctr: 0,
            ecpm: 23.12,
            usd: 95344.72
          },
          {
            date: "24.07.2021",
            impressions: 843,
            clicks: 0,
            ctr: 0,
            ecpm: 21.12,
            usd: 13454.51
          }
        ]
      },
      {
        name: "Ad Groups Data",
        data: [
          {
            text: "Association",
            impressions: 138165733,
            clicks: 108063,
            ctr: 0.08,
            ecpm: 22.18,
            usd: 3065062.45
          }
        ]
      },
      {
        name: "Geo Stats",
        data: [
          {
            country: "Spain",
            impressions: 86238028,
            clicks: 41869,
            ctr: 0.05,
            ecpm: 22.21,
            usd: 1915636.4
          },
          {
            country: "Romania",
            impressions: 13566917,
            clicks: 18863,
            ctr: 0.14,
            ecpm: 22.12,
            usd: 300095.2
          },
          {
            country: "Greece",
            impressions: 6342291,
            clicks: 6636,
            ctr: 0.1,
            ecpm: 22.12,
            usd: 140260.79
          },
          {
            country: "Portugal",
            impressions: 6339712,
            clicks: 5907,
            ctr: 0.09,
            ecpm: 22.09,
            usd: 140075.37
          },
          {
            country: "Slovakia",
            impressions: 6298449,
            clicks: 5213,
            ctr: 0.08,
            ecpm: 22.11,
            usd: 139288.64
          },
          {
            country: "Netherlands",
            impressions: 6287655,
            clicks: 8797,
            ctr: 0.14,
            ecpm: 22.12,
            usd: 139067.73
          },
          {
            country: "Sweden",
            impressions: 3299090,
            clicks: 5188,
            ctr: 0.16,
            ecpm: 22.11,
            usd: 72956.67
          },
          {
            country: "Italy",
            impressions: 3254070,
            clicks: 5166,
            ctr: 0.16,
            ecpm: 22.14,
            usd: 72033.01
          },
          {
            country: "Poland",
            impressions: 3242038,
            clicks: 5171,
            ctr: 0.16,
            ecpm: 22.11,
            usd: 71667.07
          },
          {
            country: "Ukraine",
            impressions: 3236183,
            clicks: 5100,
            ctr: 0.16,
            ecpm: 22.11,
            usd: 71554.56
          },
          {
            country: "United States",
            impressions: 39725,
            clicks: 66,
            ctr: 0.17,
            ecpm: 26.89,
            usd: 1068.08
          },
          {
            country: "United Kingdom",
            impressions: 6647,
            clicks: 0,
            ctr: 0,
            ecpm: 63.43,
            usd: 421.6
          },
          {
            country: "France",
            impressions: 5310,
            clicks: 0,
            ctr: 0,
            ecpm: 63.41,
            usd: 336.7
          },
          {
            country: "Russia",
            impressions: 1849,
            clicks: 0,
            ctr: 0,
            ecpm: 63.4,
            usd: 117.23
          },
          {
            country: "Germany",
            impressions: 1683,
            clicks: 0,
            ctr: 0,
            ecpm: 63.43,
            usd: 106.75
          },
          {
            country: "Denmark",
            impressions: 659,
            clicks: 0,
            ctr: 0,
            ecpm: 63.41,
            usd: 41.79
          },
          {
            country: "Bulgaria",
            impressions: 564,
            clicks: 0,
            ctr: 0,
            ecpm: 63.4,
            usd: 35.76
          },
          {
            country: "Switzerland",
            impressions: 495,
            clicks: 2,
            ctr: 0.4,
            ecpm: 63.43,
            usd: 31.4
          },
          {
            country: "Seychelles",
            impressions: 390,
            clicks: 1,
            ctr: 0.26,
            ecpm: 53.92,
            usd: 21.03
          },
          {
            country: "Czech Republic",
            impressions: 376,
            clicks: 1,
            ctr: 0.27,
            ecpm: 63.43,
            usd: 23.85
          },
          {
            country: "United States",
            impressions: 280,
            clicks: 1,
            ctr: 0.36,
            ecpm: 63.43,
            usd: 17.76
          },
          {
            country: "Moldova",
            impressions: 278,
            clicks: 1,
            ctr: 0.36,
            ecpm: 63.42,
            usd: 17.63
          },
          {
            country: "Austria",
            impressions: 230,
            clicks: 3,
            ctr: 1.3,
            ecpm: 63.43,
            usd: 14.59
          },
          {
            country: "Saudi Arabia",
            impressions: 178,
            clicks: 0,
            ctr: 0,
            ecpm: 63.26,
            usd: 11.26
          },
          {
            country: "Norway",
            impressions: 149,
            clicks: 2,
            ctr: 1.34,
            ecpm: 63.42,
            usd: 9.45
          },
          {
            country: "Turkey",
            impressions: 148,
            clicks: 0,
            ctr: 0,
            ecpm: 63.45,
            usd: 9.39
          },
          {
            country: "Iran",
            impressions: 140,
            clicks: 0,
            ctr: 0,
            ecpm: 63.43,
            usd: 8.88
          },
          {
            country: "Australia",
            impressions: 139,
            clicks: 0,
            ctr: 0,
            ecpm: 63.45,
            usd: 8.82
          },
          {
            country: "Israel",
            impressions: 127,
            clicks: 0,
            ctr: 0,
            ecpm: 63.39,
            usd: 8.05
          },
          {
            country: "Belgium",
            impressions: 121,
            clicks: 1,
            ctr: 0.83,
            ecpm: 63.47,
            usd: 7.68
          },
          {
            country: "Nigeria",
            impressions: 112,
            clicks: 1,
            ctr: 0.89,
            ecpm: 53.93,
            usd: 6.04
          },
          {
            country: "Canada",
            impressions: 106,
            clicks: 0,
            ctr: 0,
            ecpm: 53.96,
            usd: 5.72
          },
          {
            country: "Finland",
            impressions: 94,
            clicks: 0,
            ctr: 0,
            ecpm: 63.4,
            usd: 5.96
          },
          {
            country: "Belarus",
            impressions: 92,
            clicks: 0,
            ctr: 0,
            ecpm: 63.48,
            usd: 5.84
          },
          {
            country: "Hungary",
            impressions: 92,
            clicks: 1,
            ctr: 1.09,
            ecpm: 63.48,
            usd: 5.84
          },
          {
            country: "South Africa",
            impressions: 81,
            clicks: 0,
            ctr: 0,
            ecpm: 53.95,
            usd: 4.37
          },
          {
            country: "Latvia",
            impressions: 71,
            clicks: 0,
            ctr: 0,
            ecpm: 63.38,
            usd: 4.5
          },
          {
            country: "Mexico",
            impressions: 60,
            clicks: 0,
            ctr: 0,
            ecpm: 54,
            usd: 3.24
          },
          {
            country: "Cyprus",
            impressions: 58,
            clicks: 1,
            ctr: 1.72,
            ecpm: 63.45,
            usd: 3.68
          },
          {
            country: "India",
            impressions: 50,
            clicks: 0,
            ctr: 0,
            ecpm: 63.4,
            usd: 3.17
          },
          {
            country: "Kyrgyzstan",
            impressions: 49,
            clicks: 0,
            ctr: 0,
            ecpm: 63.27,
            usd: 3.1
          },
          {
            country: "Pakistan",
            impressions: 45,
            clicks: 0,
            ctr: 0,
            ecpm: 63.33,
            usd: 2.85
          },
          {
            country: "United Arab Emirates",
            impressions: 44,
            clicks: 0,
            ctr: 0,
            ecpm: 63.41,
            usd: 2.79
          },
          {
            country: "Ireland",
            impressions: 43,
            clicks: 0,
            ctr: 0,
            ecpm: 63.49,
            usd: 2.73
          },
          {
            country: "Bangladesh",
            impressions: 43,
            clicks: 0,
            ctr: 0,
            ecpm: 63.49,
            usd: 2.73
          },
          {
            country: "Belize",
            impressions: 39,
            clicks: 1,
            ctr: 2.56,
            ecpm: 53.85,
            usd: 2.1
          },
          {
            country: "Brazil",
            impressions: 39,
            clicks: 1,
            ctr: 2.56,
            ecpm: 53.85,
            usd: 2.1
          },
          {
            country: "Thailand",
            impressions: 37,
            clicks: 1,
            ctr: 2.7,
            ecpm: 63.51,
            usd: 2.35
          },
          {
            country: "Lebanon",
            impressions: 34,
            clicks: 0,
            ctr: 0,
            ecpm: 63.53,
            usd: 2.16
          },
          {
            country: "Japan",
            impressions: 31,
            clicks: 0,
            ctr: 0,
            ecpm: 63.55,
            usd: 1.97
          },
          {
            country: "China",
            impressions: 31,
            clicks: 0,
            ctr: 0,
            ecpm: 63.55,
            usd: 1.97
          },
          {
            country: "Singapore",
            impressions: 30,
            clicks: 0,
            ctr: 0,
            ecpm: 63.33,
            usd: 1.9
          },
          {
            country: "Colombia",
            impressions: 30,
            clicks: 0,
            ctr: 0,
            ecpm: 54,
            usd: 1.62
          },
          {
            country: "Serbia",
            impressions: 30,
            clicks: 0,
            ctr: 0,
            ecpm: 63.33,
            usd: 1.9
          },
          {
            country: "Iraq",
            impressions: 26,
            clicks: 1,
            ctr: 3.85,
            ecpm: 63.46,
            usd: 1.65
          },
          {
            country: "Malta",
            impressions: 26,
            clicks: 0,
            ctr: 0,
            ecpm: 63.46,
            usd: 1.65
          },
          {
            country: "Niger",
            impressions: 26,
            clicks: 0,
            ctr: 0,
            ecpm: 53.85,
            usd: 1.4
          },
          {
            country: "Georgia",
            impressions: 24,
            clicks: 0,
            ctr: 0,
            ecpm: 63.33,
            usd: 1.52
          },
          {
            country: "Bosnia and Herzegovina",
            impressions: 23,
            clicks: 0,
            ctr: 0,
            ecpm: 63.48,
            usd: 1.46
          },
          {
            country: "Senegal",
            impressions: 23,
            clicks: 0,
            ctr: 0,
            ecpm: 53.91,
            usd: 1.24
          },
          {
            country: "Andorra",
            impressions: 23,
            clicks: 0,
            ctr: 0,
            ecpm: 63.48,
            usd: 1.46
          },
          {
            country: "Kazakhstan",
            impressions: 22,
            clicks: 0,
            ctr: 0,
            ecpm: 63.64,
            usd: 1.4
          },
          {
            country: "Cameroon",
            impressions: 21,
            clicks: 0,
            ctr: 0,
            ecpm: 53.81,
            usd: 1.13
          },
          {
            country: "Syria",
            impressions: 20,
            clicks: 0,
            ctr: 0,
            ecpm: 63.5,
            usd: 1.27
          },
          {
            country: "Albania",
            impressions: 19,
            clicks: 0,
            ctr: 0,
            ecpm: 63.68,
            usd: 1.21
          },
          {
            country: "Lithuania",
            impressions: 17,
            clicks: 0,
            ctr: 0,
            ecpm: 63.53,
            usd: 1.08
          },
          {
            country: "Burkina Faso",
            impressions: 17,
            clicks: 0,
            ctr: 0,
            ecpm: 54.12,
            usd: 0.92
          },
          {
            country: "Kuwait",
            impressions: 17,
            clicks: 0,
            ctr: 0,
            ecpm: 63.53,
            usd: 1.08
          },
          {
            country: "Palestine",
            impressions: 17,
            clicks: 0,
            ctr: 0,
            ecpm: 63.53,
            usd: 1.08
          },
          {
            country: "South Korea",
            impressions: 15,
            clicks: 0,
            ctr: 0,
            ecpm: 63.33,
            usd: 0.95
          },
          {
            country: "Ecuador",
            impressions: 14,
            clicks: 0,
            ctr: 0,
            ecpm: 53.57,
            usd: 0.75
          },
          {
            country: "Uzbekistan",
            impressions: 11,
            clicks: 0,
            ctr: 0,
            ecpm: 63.64,
            usd: 0.7
          },
          {
            country: "Mongolia",
            impressions: 10,
            clicks: 0,
            ctr: 0,
            ecpm: 63,
            usd: 0.63
          },
          {
            country: "Guernsey",
            impressions: 9,
            clicks: 0,
            ctr: 0,
            ecpm: 63.33,
            usd: 0.57
          },
          {
            country: "Venezuela",
            impressions: 9,
            clicks: 0,
            ctr: 0,
            ecpm: 54.44,
            usd: 0.49
          },
          {
            country: "Estonia",
            impressions: 8,
            clicks: 0,
            ctr: 0,
            ecpm: 63.75,
            usd: 0.51
          },
          {
            country: "Jordan",
            impressions: 8,
            clicks: 0,
            ctr: 0,
            ecpm: 63.75,
            usd: 0.51
          },
          {
            country: "Liechtenstein",
            impressions: 8,
            clicks: 0,
            ctr: 0,
            ecpm: 63.75,
            usd: 0.51
          },
          {
            country: "Luxembourg",
            impressions: 7,
            clicks: 0,
            ctr: 0,
            ecpm: 61.43,
            usd: 0.43
          },
          {
            country: "New Zealand",
            impressions: 6,
            clicks: 0,
            ctr: 0,
            ecpm: 63.33,
            usd: 0.38
          },
          {
            country: "Slovenia",
            impressions: 6,
            clicks: 0,
            ctr: 0,
            ecpm: 63.33,
            usd: 0.38
          },
          {
            country: "Morocco",
            impressions: 6,
            clicks: 0,
            ctr: 0,
            ecpm: 53.33,
            usd: 0.32
          },
          {
            country: "Azerbaijan",
            impressions: 5,
            clicks: 0,
            ctr: 0,
            ecpm: 64,
            usd: 0.32
          },
          {
            country: "Argentina",
            impressions: 5,
            clicks: 0,
            ctr: 0,
            ecpm: 54,
            usd: 0.27
          },
          {
            country: "United States",
            impressions: 5,
            clicks: 0,
            ctr: 0,
            ecpm: 54,
            usd: 0.27
          },
          {
            country: "Afghanistan",
            impressions: 5,
            clicks: 0,
            ctr: 0,
            ecpm: 64,
            usd: 0.32
          },
          {
            country: "United States Virgin Islands",
            impressions: 3,
            clicks: 0,
            ctr: 0,
            ecpm: 53.33,
            usd: 0.16
          },
          {
            country: "San Marino",
            impressions: 2,
            clicks: 0,
            ctr: 0,
            ecpm: 65,
            usd: 0.13
          },
          {
            country: "Armenia",
            impressions: 2,
            clicks: 0,
            ctr: 0,
            ecpm: 65,
            usd: 0.13
          },
          {
            country: "Philippines",
            impressions: 1,
            clicks: 0,
            ctr: 0,
            ecpm: 60,
            usd: 0.06
          },
          {
            country: "Macau",
            impressions: 1,
            clicks: 0,
            ctr: 0,
            ecpm: 60,
            usd: 0.06
          },
          {
            country: "Gibraltar",
            impressions: 1,
            clicks: 0,
            ctr: 0,
            ecpm: 60,
            usd: 0.06
          },
          {
            country: "Iceland",
            impressions: 1,
            clicks: 0,
            ctr: 0,
            ecpm: 60,
            usd: 0.06
          },
          {
            country: "Brunei",
            impressions: 1,
            clicks: 0,
            ctr: 0,
            ecpm: 60,
            usd: 0.06
          },
          {
            country: "Ivory Coast",
            impressions: 1,
            clicks: 0,
            ctr: 0,
            ecpm: 50,
            usd: 0.05
          }
        ]
      },
      {
        name: "Device Stats",
        data: [
          {
            device: "Mobile",
            impressions: 82861445,
            clicks: 64897,
            ctr: 0.08,
            ecpm: 22.18,
            usd: 1838191.85
          },
          {
            device: "Mobile",
            impressions: 11089949,
            clicks: 9862,
            ctr: 0.09,
            ecpm: 20.22,
            usd: 224213.1
          },
          {
            device: "Mobile",
            impressions: 11044706,
            clicks: 8166,
            ctr: 0.07,
            ecpm: 22.15,
            usd: 244597.11
          },
          {
            device: "Mobile",
            impressions: 11044494,
            clicks: 8074,
            ctr: 0.07,
            ecpm: 25.23,
            usd: 278598.19
          },
          {
            device: "Mobile",
            impressions: 11034207,
            clicks: 8184,
            ctr: 0.07,
            ecpm: 23.03,
            usd: 254114.35
          },
          {
            device: "Mobile",
            impressions: 11024205,
            clicks: 8713,
            ctr: 0.08,
            ecpm: 20.19,
            usd: 222562.53
          },
          {
            device: "Mobile",
            impressions: 38455,
            clicks: 45,
            ctr: 0.12,
            ecpm: 26.81,
            usd: 1030.79
          },
          {
            device: "Mobile",
            impressions: 28272,
            clicks: 122,
            ctr: 0.43,
            ecpm: 62.06,
            usd: 1754.54
          }
        ]
      },
      {
        name: "OS Stats",
        data: [
          {
            os: "Mac OS",
            impressions: 57200090,
            clicks: 44711,
            ctr: 0.08,
            ecpm: 22.18,
            usd: 1268876.87
          },
          {
            os: "Windows",
            impressions: 41287589,
            clicks: 32605,
            ctr: 0.08,
            ecpm: 22.18,
            usd: 915917.92
          },
          {
            os: "Android",
            impressions: 28564928,
            clicks: 22226,
            ctr: 0.08,
            ecpm: 22.18,
            usd: 633698.53
          },
          {
            os: "Linux",
            impressions: 9060887,
            clicks: 6973,
            ctr: 0.08,
            ecpm: 22.18,
            usd: 200992.78
          },
          {
            os: "Windows 7",
            impressions: 1156180,
            clicks: 865,
            ctr: 0.07,
            ecpm: 22.19,
            usd: 25653.15
          },
          {
            os: "Windows 8",
            impressions: 533598,
            clicks: 382,
            ctr: 0.07,
            ecpm: 22.19,
            usd: 11842.49
          },
          {
            os: "Other",
            impressions: 223694,
            clicks: 194,
            ctr: 0.09,
            ecpm: 22.34,
            usd: 4996.99
          },
          {
            os: "Windows XP",
            impressions: 100380,
            clicks: 73,
            ctr: 0.07,
            ecpm: 22.24,
            usd: 2232.69
          },
          {
            os: "Android 4",
            impressions: 26129,
            clicks: 18,
            ctr: 0.07,
            ecpm: 22.2,
            usd: 580.02
          },
          {
            os: "Ubuntu",
            impressions: 11379,
            clicks: 0,
            ctr: 0,
            ecpm: 22.17,
            usd: 252.3
          },
          {
            os: "Windows NT",
            impressions: 651,
            clicks: 0,
            ctr: 0,
            ecpm: 22.23,
            usd: 14.47
          },
          {
            os: "Android 5",
            impressions: 228,
            clicks: 0,
            ctr: 0,
            ecpm: 18.82,
            usd: 4.29
          }
        ]
      }
    ],
    success: true
  };
}

async function prepareTplForCustomAdvertisingReport({
  order_dates: { from: date_from, to: date_to },
  campaign_id,
  websites,
  order_id,
  general_stats_data,
  transactions_data,
  merchant_id,
  report_name,
  format,
  use_custom_dates,
  manual_transfers
}) {
  let from = new Date(date_from),
    to = new Date(date_to);
  if (!use_custom_dates) {
    date_from = new Date(
      new Date(from.getFullYear(), from.getMonth(), 1).getTime() -
        from.getTimezoneOffset() * 60000
    );
    date_to = new Date(
      new Date(to.getFullYear(), to.getMonth() + 1, 0).getTime() -
        to.getTimezoneOffset() * 60000
    );
  } else {
    date_from = new Date(
      new Date(from).getTime() - from.getTimezoneOffset() * 60000
    );
    date_to = new Date(new Date(to).getTime() - to.getTimezoneOffset() * 60000);
  }
  let api_amount = 0,
    tx_amount = 0;
  for (let stat of general_stats_data) api_amount += Number(stat.usd);
  for (let tx of transactions_data) tx_amount += Number(tx.amount);
  let koeff = api_amount / tx_amount;
  general_stats_data = general_stats_data.map((el) => {
    let date = new Date(el.date);
    return {
      ...el,
      amount: (Number(el.usd) / koeff).toFixed(2),
      date: new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    };
  });
  general_stats_data = general_stats_data.filter((el) => {
    return (
      el.date.getTime() >= date_from.getTime() &&
      el.date.getTime() <= date_to.getTime()
    );
  });
  let total_spent = 0;
  for (let stat of general_stats_data) total_spent += Number(stat.amount);

  return await prepareTplData({
    date_from,
    date_to,
    campaignID: campaign_id,
    merchant_id,
    order_id,
    websites,
    total_spent,
    report_name,
    format,
    add_days: false,
    koeff,
    manual_transfers
  }).catch((e) => {
    throw e;
  });
}

export default {
  prepareTplData,
  getAdvertisingData,
  prepareTplForCustomAdvertisingReport
};
