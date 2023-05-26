import moment from "moment";
import dbHelper from "./dbHelper";
import Queue from "@lib/queue";
import db from "@lib/db";

async function _checkForExistReport(transfer_id) {
  const withdrawal_statement = await db.withdrawal_statement.findOne({
    where: {
      transfer_id: transfer_id
    },
    raw: true
  });
  if (withdrawal_statement)
    return { success: true, code: withdrawal_statement.code };
  return { success: true, code: null };
}

async function prepareTplForWithdrawalTransfer(data) {
  let { result } = await Queue.newJob("merchant-service", {
    method: "getListCurrencyDecimal",
    data: {}
  });

  const tpl = {};

  let listCurrencyDecimal = result;
  let realm_department;

  if (!data || !data.transfer_id) return { success: false };

  // check for exist report in db
  const withdrawal_statement = await _checkForExistReport(data.transfer_id);
  if (withdrawal_statement && withdrawal_statement.code) {
    return withdrawal_statement;
  }

  const transferData = await dbHelper.getTransferById(data.transfer_id);
  if (transferData) {
    let merchantData, orderData, currency, to_currency, customExchangeRate;

    transferData.hash = await dbHelper.getTransferHash(data.transfer_id);
    merchantData = await dbHelper.getMerchantById(transferData.data.merchant);
    orderData = await dbHelper.getOrderById(transferData.ref_id);

    currency = transferData.data.currency;
    to_currency = transferData.data.to_currency;
    customExchangeRate = parseFloat(
      transferData.data.custom_exchange_rate
    ).toFixed(listCurrencyDecimal[to_currency]);

    tpl.data = {
      sentAmount: parseFloat(transferData.data.amount).toFixed(
        listCurrencyDecimal[currency]
      ),
      status: [
        "",
        "NIL->SK",
        "SK->Monitoring",
        "Monitoring->Final",
        "Completed"
      ][transferData.status],
      amount: (transferData.data.finAmount / customExchangeRate).toFixed(
        listCurrencyDecimal[currency]
      ),
      feesAndDeductions: (
        transferData.data.amount -
        transferData.data.finAmount / customExchangeRate
      ).toFixed(listCurrencyDecimal[currency]),
      custom_exchange_rate: parseFloat(customExchangeRate).toFixed(
        listCurrencyDecimal[to_currency]
      ),
      currency,
      to_currency,
      finAmount: parseFloat(transferData.data.finAmount).toFixed(
        listCurrencyDecimal[to_currency]
      ),
      ctime: moment(transferData.ctime).format("DD.MM.YYYY"),
      txId: transferData.hash ? transferData.hash.id : "",
      organisation_name: merchantData.name
    };
  }

  tpl.format = data.format;
  tpl.report_name = data.report_name;

  tpl.data = { ...tpl.data, ...realm_department };
  tpl.filename = `${tpl.data.organisation_name} - ${moment(
    transferData ? transferData.ctime : new Date()
  ).format("YYYY-MM-DD")} - ${tpl.data.sentAmount} - ${tpl.data.currency}`;
  return tpl;
}

async function prepareTplForTransferByPlan(data) {
  if (!data.plan_transfer_id) return { success: false };

  let currencies = await Queue.newJob("merchant-service", {
    method: "getListCurrencyDecimal",
    data: {}
  });
  let listCurrencyDecimal = currencies.result;

  let { result } = await Queue.newJob("account-service", {
    method: "getPlanRecords",
    data: [data.plan_transfer_id]
  });
  if (!result || !result.length) return { success: false };
  const planRecord = result[0];

  const sentToClient =
    planRecord.unspent < 0
      ? parseFloat(planRecord.converted) +
        planRecord.unspent / parseFloat(planRecord.exchange_rate)
      : parseFloat(planRecord.converted);

  // const exchangedAmount =
  //   planRecord.spent > planRecord.amount_netto
  //     ? planRecord.amount_netto
  //     : planRecord.spent;

  // const exchangeRate =
  //   planRecord.unspent < 0
  //     ? parseFloat(planRecord.exchange_rate)
  //     : planRecord.amount_netto / parseFloat(planRecord.converted);

  const tpl = {};

  tpl.data = {
    status: planRecord.step,
    date: moment(planRecord.ctime).format("DD.MM.YYYY"),
    withdrawalAmount: planRecord.amount.toFixed(
      listCurrencyDecimal[planRecord.amount_currency]
    ),
    feesAndDeductions: planRecord.fees.toFixed(
      listCurrencyDecimal[planRecord.amount_currency]
    ),
    amountLessDeductions: planRecord.amount_netto.toFixed(
      listCurrencyDecimal[planRecord.amount_currency]
    ),
    exchangedAmount: planRecord.amount_netto.toFixed(
      listCurrencyDecimal[planRecord.amount_currency]
    ),
    exchangeRate: planRecord.exchange_rate
      ? planRecord.exchange_rate.toFixed(5)
      : "",
    sentAmount: planRecord.exchange_rate
      ? sentToClient.toFixed(listCurrencyDecimal[planRecord.converted_currency])
      : planRecord.amount_netto.toFixed(
          listCurrencyDecimal[planRecord.amount_currency]
        ),
    currency: planRecord.amount_currency,
    sentCurrency: planRecord.converted_currency,
    txId: data.hash ? data.hash : "",
    organisationName: planRecord.organisation_name,
    cashback: 0
  };

  tpl.format = data.format;
  tpl.report_name = "itech_withdrawal_statement_by_plan";
  tpl.filename = `${tpl.data.organisationName} - ${moment(
    planRecord.ctime ? planRecord.ctime : new Date()
  ).format("YYYY-MM-DD")} - ${tpl.data.withdrawalAmount} - ${
    tpl.data.currency
  }`;

  return tpl;
}

async function prepareTplForDepositImports(data) {
  let { result } = await Queue.newJob("merchant-service", {
    method: "getListCurrencyDecimal",
    data: {}
  });
  let listCurrencyDecimal = result;
  const tpl = {};
  let tplData = [];
  tpl.format = data.format;
  tpl.report_name = data.report_name;
  if (data && data.list)
    for (const r of data.list) {
      tplData.push({
        id: r.id,
        reason: r.reason,
        amount: parseFloat(r.amount).toFixed(listCurrencyDecimal[r.currency]),
        merchant: r.deposit_to,
        currency: r.currency,
        order_name: r.order_name,
        bank: r.bank,
        status: r.status == 0 ? "Unresolved" : "Resolved"
      });
    }

  tpl.data = {
    list: tplData
  };
  tpl.filename = `Deposit Imports - ${moment(new Date()).format("YYYY-MM-DD")}`;

  return tpl;
}

export default {
  prepareTplForTransferByPlan,
  prepareTplForWithdrawalTransfer,
  prepareTplForDepositImports
};
