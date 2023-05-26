import dbHelper from "./dbHelper";
import Queue from "@lib/queue";
import moment from "moment";

async function prepareTplForAccountTransactionsReport(data) {
  if (!data.acc_no) throw "THEREISNTACCNO";
  data.all = false;
  const accTransactions = await dbHelper.getAccTxs(data);

  const transactions = await _prepareAccTransactions(accTransactions);

  let out = {};
  out.data = {
    report_generated: moment(new Date()).format("DD.MM.YYYY HH:mm"),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    acc_no: data.acc_no,
    transactions
  };

  const report_period = `${moment(data.date_from).format(
    "DD.MM.YYYY"
  )}-${moment(data.date_to).format("DD.MM.YYYY")}`;

  out.report_name = "fbtb_acc_transations_report";
  out.filename = `ACC_TXS_REPORT-${data.acc_no} - ${report_period}`;
  out.format = "xlsx";

  return out;
}

async function _prepareAccTransactions(transactions) {
  const out = [];
  const { result } = await Queue.newJob("merchant-service", {
    method: "getListCurrencyDecimal",
    data: {}
  });
  const listCurrencyDecimal = result;

  for (const tx of transactions) {
    out.push({
      ref_id: tx.ref_id,
      ctime: moment(tx.ctime).format("DD.MM.YYYY HH:mm"),
      user_name: tx.legalname || "-",
      merchant_name: tx.merchant_name || "-",
      src_acc_name: tx.src_acc_name || "",
      acc_src: tx.acc_src || "",
      dst_acc_name: tx.dst_acc_name || "",
      acc_dst: tx.acc_dst || "",
      amount: parseFloat(tx.amount).toFixed(
        listCurrencyDecimal[tx.currency_src]
      ),
      currency_src: tx.currency_src,
      exchange_amount: parseFloat(tx.exchange_amount).toFixed(
        listCurrencyDecimal[tx.currency_dst]
      ),
      currency_dst: tx.currency_dst,
      status: _getTransferStatus(tx),
      description_src: tx.description_src
    });
  }

  return out;
}

function _getTransferStatus(transfer) {
  if (transfer.held && transfer.cancel) return "Cancel";
  if (!transfer.held && transfer.cancel) return "Refund";
  if (transfer.held && !transfer.cancel) return "Pending";
  if (!transfer.held && !transfer.cancel) return "Success";
}

async function prepareTplForAllAccountTransactionsReport(data) {
  data.all = true;

  const accTransactions = await dbHelper.getAccTxs(data);
  const transactions = await _prepareAccTransactions(accTransactions);

  let out = {};
  out.data = {
    report_generated: moment(new Date()).format("DD.MM.YYYY HH:mm"),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    transactions
  };

  const report_period = `${moment(data.date_from).format(
    "DD.MM.YYYY"
  )}-${moment(data.date_to).format("DD.MM.YYYY")}`;

  out.report_name = "fbtb_all_acc_transations_report";
  out.filename = `ALL_ACCS_TXS_REPORT - ${report_period}`;
  out.format = "xlsx";

  return out;
}

export default {
  prepareTplForAccountTransactionsReport,
  prepareTplForAllAccountTransactionsReport
};
