import moment from "moment";
import Queue from "@lib/queue";

async function prepareTplForNilTransactionsReport(data) {
  const dateFrom = new Date(data.date_from);
  const dateTo = new Date(data.date_to);

  data.date_from = new Date(dateFrom - dateFrom.getTimezoneOffset() * 60000);
  data.date_to = new Date(dateTo - dateTo.getTimezoneOffset() * 60000);

  const nilTransactions = await _getNilTransactions(data);

  const out = {};

  out.data = {
    report_generated: moment(new Date()).format("DD.MM.YYYY HH:mm"),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currency: data.currency || "All currencies",
    transactions: nilTransactions
  };

  const reportDateFrom = moment(new Date(data.date_from)).format("DD.MM.YYYY");
  const reportDateTo = moment(new Date(data.date_to)).format("DD.MM.YYYY");

  out.report_name = "fbtb_nil_transactions_history";
  out.filename = `NIL TX REPORT - ${reportDateFrom}-${reportDateTo} - ${data.currency ||
    "All currencies"}`;
  out.format = "xlsx";

  return out;
}

async function _getNilTransactions(data) {
  const out = [];

  const { result } = await Queue.newJob("falcon-service", {
    method: "getTxHistory",
    data: {
      _filters: [data],
      ...data
    }
  });

  if (result && result.body) {
    for (const tx of result.body) {
      out.push({
        created: moment(new Date(tx.created)).format("DD.MM.YYYY HH:mm:ss"),
        transaction_id: tx.transaction_id,
        reference: tx.reference,
        amount: tx.amount,
        currency: tx.currency
      });
    }
  }

  return out;
}

export default {
  prepareTplForNilTransactionsReport
};
