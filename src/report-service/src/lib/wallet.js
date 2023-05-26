import moment from "moment";
import Queue from "@lib/queue";
import db from "@lib/db";

const Op = db.Sequelize.Op;

const CURRENCY_ALIAS = {
  TRX_USDT: "USTR"
};

async function prepareTplForWalletStatementReport(data) {
  const out = {};
  let reportData = [];

  for (const tx of data.data) {
    tx.dateTime = moment(tx.dateTime).format("DD.MM.YYYY HH:mm:ss");
    tx.amount = tx.value[0] ? tx.value[0].amount : 0;
    tx.currency = tx.value[0]
      ? CURRENCY_ALIAS[tx.value[0].currencyId] || tx.value[0].currencyId
      : "-";
    tx.fee_crypto_amount = tx.txType == "SEND" ? tx.fee[0].amount : 0;
    tx.fee_crypto_currency = tx.fee[0].currencyId;
    tx.fee_eur = tx.txType == "SEND" ? tx.fee[1].amount : 0;

    tx.tx_type = tx.txType;

    reportData.push(tx);
  }

  out.data = {
    statement_data: reportData,
    start_date: moment(data.report_params.start_date).format("DD.MM.YYYY"),
    end_date: moment(data.report_params.end_date).format("DD.MM.YYYY"),
    creation_date: moment(new Date()).format("DD.MM.YYYY HH:mm"),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    address: data.report_params.wallet
  };

  out.report_name = "walletStatementReport";
  out.filename = `${data.report_params.wallet || "All system addresses"} ${
    data.report_params.currency
  } Wallet statement report ${moment(
    new Date(data.report_params.start_date)
  ).format("DD.MM.YYYY")}-${moment(
    new Date(data.report_params.end_date)
  ).format("DD.MM.YYYY")}`;
  out.type = data.report_params.currency + " Wallet statement report";
  out.format = data.format;
  out.attachFileToOrder = attachFileToOrder; //there is no order, but we save file for the reports module
  out.order_id = data.owner_id; //will be used as owner_id in files table

  return out;
}

async function prepareTplForWalletFeeReport(data) {
  const out = {};

  out.data = {
    report_data: await prepareDataByCurrency(
      data,
      data.report_params.currency,
      out
    ),
    start_date: data.report_params.start_date,
    end_date: data.report_params.end_date,
    creation_date: moment(new Date()).format("DD.MM.YYYY HH:mm"),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  out.filename = `${data.report_params.wallet || "All system addresses"} ${
    data.report_params.currency
  } Wallet fee report ${moment(new Date(data.report_params.start_date)).format(
    "DD.MM.YYYY"
  )}-${moment(new Date(data.report_params.end_date)).format("DD.MM.YYYY")}`;
  out.type = data.report_params.currency + " Wallet fee report";
  out.format = data.format;
  out.attachFileToOrder = attachFileToOrder; //there is no order, but we save file for the reports module
  out.order_id = data.owner_id; //will be used as owner_id in files table

  return out;
}

function prepareDataByCurrency(data, currency, out) {
  let reportTx = {};
  let reportData = [];
  if (currency == "USDT") {
    for (const tx of data.data) {
      reportTx.date = tx.dateTime;

      reportTx.f_send_no = tx.sends[0].count;
      reportTx.f_send_currency = tx.sends[0].totalAmount.currencyId;
      reportTx.f_send_amount = tx.sends[0].totalAmount.amount.toString();

      reportTx.s_send_no = tx.sends[1].count;
      reportTx.s_send_currency = tx.sends[1].totalAmount.currencyId;
      reportTx.s_send_amount = tx.sends[1].totalAmount.amount.toString();

      reportTx.total_send_currency = tx.totalSend.currencyId;
      reportTx.total_send_amount = tx.totalSend.amount.toString();

      reportTx.fee_crypto_amount = tx.fees[0].amount.toString();
      reportTx.fee_crypto_currency = tx.fees[0].currencyId;
      reportTx.fee_fiat_amount = tx.fees[1].amount.toString();
      reportTx.fee_fiat_currency = tx.fees[1].currencyId;

      reportTx.addresses = tx.addresses.join(", ");

      reportData.push({ ...reportTx });
    }
    out.report_name = "usdtWalletFeeReport";
  } else if (currency == "BTC") {
    for (const tx of data.data) {
      reportTx.date = tx.dateTime;

      reportTx.send_no = tx.sends[0].count;
      reportTx.send_crypto_currency = tx.sends[0].totalAmount.currencyId;
      reportTx.send_crypto_amount = tx.sends[0].totalAmount.amount.toString();

      reportTx.send_fiat_currency = tx.totalSend.currencyId;
      reportTx.send_fiat_amount = tx.totalSend.amount.toString();

      reportTx.fee_crypto_amount = tx.fees[0].amount.toString();
      reportTx.fee_crypto_currency = tx.fees[0].currencyId;
      reportTx.fee_fiat_amount = tx.fees[1].amount.toString();
      reportTx.fee_fiat_currency = tx.fees[1].currencyId;

      reportTx.addresses = tx.addresses.join(", ");

      reportData.push({ ...reportTx });
    }
    out.report_name = "btcWalletFeeReport";
  }
  return reportData;
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
    removed: 0
  };
  let res = await db.file.create(insData, { raw: true });
  if (res) return { success: true, ...res };
  return { success: false };
}

export default {
  prepareTplForWalletStatementReport,
  prepareTplForWalletFeeReport
};
