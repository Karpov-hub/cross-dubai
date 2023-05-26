import moment from "moment";
import dbHelper from "./dbHelper";
import Queue from "@lib/queue";
import db from "@lib/db";

async function prepareTplForTransfersByPlanReport(data) {
  const { result } = await Queue.newJob("merchant-service", {
    method: "getListCurrencyDecimal",
    data: {}
  });
  const listCurrencyDecimal = result;

  const transfersByPlan = await dbHelper.getTransfersByPlan(data);
  const transfersTransactions = await dbHelper.getTransferBPTransactions(
    transfersByPlan.list
  );

  const transactions = await _prepareTransactions(
    transfersTransactions.list,
    listCurrencyDecimal
  );
  const transfers = await _prepareTransfers(
    transfersByPlan.list,
    transactions,
    listCurrencyDecimal
  );

  let out = {};
  out.data = {
    report_generated: moment(new Date()).format("DD.MM.YYYY HH:mm"),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    transfers
  };

  const report_period = `${moment(data.date_from).format(
    "DD.MM.YYYY"
  )}-${moment(data.date_to).format("DD.MM.YYYY")}`;

  out.report_name = "fbtb_transfers_by_plan";
  out.filename = `TRANSFERS_BY_PLAN - ${
    !data.all
      ? report_period
      : "all period - " + moment(new Date()).format("DD.MM.YYYY HH:mm")
  }`;
  out.format = "xlsx";

  return out;
}

async function _prepareTransfers(transfers, txs, listCurrencyDecimal) {
  const out = [];

  await _addPlanName(transfers);

  for (const transfer of transfers) {
    txs[transfer.id].forEach((currentTransferTx) => {
      if (currentTransferTx.txtype == "transfer") {
        transfer.sent_amount = currentTransferTx.amount;
        transfer.sent_currency = currentTransferTx.currency_src;
        transfer.converted_currency = transfer.exchange_price
          ? currentTransferTx.currency_dst
          : "";
      }
    });

    if (transfer.data.netData && transfer.data.netData.exchange) {
      transfer.exchange_quantity =
        transfer.data.netData.exchange.side == "sell"
          ? transfer.exchange_quantity * transfer.exchange_price
          : transfer.exchange_quantity;
    }

    out.push({
      date: moment(transfer.ctime).format("DD.MM.YYYY HH:mm"),
      plan_name: transfer.plan_name,
      plan_transfer_id: transfer.plan_transfer_id,
      description: transfer.description,
      group: transfer.legalname || "",
      merchant: transfer.organisation_name,
      deposit_date: "",
      bank: "",
      amount: parseFloat(transfer.amount).toFixed(
        listCurrencyDecimal[transfer.currency]
      ),
      currency: transfer.currency,
      status: transfer.string_status,
      hash: transfer.hash || "",
      exchange_rate: transfer.exchange_price || "",
      converted_amount: transfer.exchange_quantity || "",
      converted_currency: transfer.converted_currency || "",
      sent_amount: transfer.sent_amount,
      sent_currency: transfer.sent_currency,
      from_address:
        transfer.data.netData && transfer.data.netData.net
          ? transfer.data.netData.net.fromAddress
          : "",
      to_address:
        transfer.data.netData && transfer.data.netData.net
          ? transfer.data.netData.net.toAddress
          : ""
    });
  }

  return out;
}

async function _addPlanName(data) {
  let plans_ids = {};
  data.forEach((item) => {
    if (item.plan_transfer_id) plans_ids[item.plan_transfer_id] = 1;
  });
  plans_ids = Object.keys(plans_ids);
  if (!plans_ids.length) return;

  const res = await db.sequelize.query(
    "SELECT t.id, p.name FROM transfers_plans t, accounts_plans p WHERE p.id=t.plan_id and t.id in ('" +
      plans_ids.join("','") +
      "')",
    {
      replacements: {},
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  const items = {};
  res.forEach((item) => {
    items[item.id] = item.name;
  });
  let others = [];
  let i = 0;
  while (data[i]) {
    if (data[i].plan_transfer_id && items[data[i].plan_transfer_id]) {
      data[i].plan_name = items[data[i].plan_transfer_id];
      i++;
    } else {
      const item = { ...data[i] };
      item.plan_name = "";
      item.plan_transfer_id = "1";
      others.push(item);
      data.splice(i, 1);
    }
  }
  for (let item of others) data.push(item);
}

async function _prepareTransactions(transactions, listCurrencyDecimal) {
  const txs = {};

  for (const tx of transactions) {
    if (!txs[tx.transfer_id]) txs[tx.transfer_id] = [];
    tx.amount = parseFloat(tx.amount).toFixed(
      listCurrencyDecimal[tx.currency_src]
    );
    tx.exchanged_amount = parseFloat(tx.exchange_amount).toFixed(
      listCurrencyDecimal[tx.currency_dst]
    );
    txs[tx.transfer_id].push(tx);
  }

  return txs;
}

export default {
  prepareTplForTransfersByPlanReport
};
