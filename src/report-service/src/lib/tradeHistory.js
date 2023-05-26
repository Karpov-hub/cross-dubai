import moment from "moment";
import db, { Sequelize } from "@lib/db";
import dbHelper from "./dbHelper";
import Queue from "@lib/queue";
import transfer from "./transfer";
const Op = db.Sequelize.Op;

async function prepareTplForTradeHistory(data) {
  const dataToPrepare = {};
  const report = {};
  let tx_list = [];
  let listCurrencyDecimal = await Queue.newJob("merchant-service", {
    method: "getListCurrencyDecimal",
    data: {}
  });
  report.report_name = data.report_name;
  report.format = data.format;

  tx_list = await dbHelper.getTransfers(data);

  const usersList = await dbHelper.getAllUsers();
  const ordersList = await dbHelper.getOrders();
  const trade_history = [];
  if (tx_list && tx_list.count)
    for (const item of tx_list.list) {
      let children_tx;
      let user, order;
      if (item.event_name.includes("withdrawalCustomExchangeRate")) {
        children_tx = await db.sequelize.query(
          `select * from transactions where transfer_id = :transfer_id and (description_dst ~* 'partner' or description_dst ~* 'партн') `,
          {
            replacements: { transfer_id: item.id },
            raw: true,
            type: db.sequelize.QueryTypes.SELECT
          }
        );
      }
      let amount = parseFloat(item.amount).toFixed(
        listCurrencyDecimal.result[item.data.currency]
      );
      let finAmount = parseFloat(item.data.finAmount).toFixed(
        listCurrencyDecimal.result[item.data.to_currency]
      );
      let exchange_rate = parseFloat(item.data.custom_exchange_rate).toFixed(
        listCurrencyDecimal.result[item.data.to_currency]
      );
      let description = item.description || item.data.description || "";
      if (description.includes("Order #")) description = "";
      let deposit_date = item.event_name.includes("deposit")
        ? item.data.deposit_date
          ? moment(item.data.deposit_date).format("YYYY-MM-DD")
          : ""
        : "";
      user = usersList.filter((el) => el.id === item.user_id)[0];
      order = ordersList.filter((el) => el.id === item.ref_id)[0];
      if (!order) order = {};
      let withdrawalData = {
        amount_fees: "",
        partner_amount: "",
        currency_fees: "",
        partner_currency: "",
        less_deductions: "",
        less_deductions_currency: "",
        rate: "",
        result_amount: "",
        result_currency: "",
        exchange_stock: "",
        monitoring_address: "",
        final_address: "",
        hash: ""
      };

      if (!item.event_name.includes("deposit")) {
        withdrawalData.amount_fees = (
          amount -
          finAmount / exchange_rate
        ).toFixed(listCurrencyDecimal.result[item.data.currency]);
        withdrawalData.partner_amount =
          children_tx && children_tx.length
            ? parseFloat(children_tx[0].amount).toFixed(
                listCurrencyDecimal.result[children_tx[0].currency_src]
              )
            : "";
        withdrawalData.currency_fees = item.data.currency || "";
        withdrawalData.partner_currency =
          children_tx && children_tx.length ? children_tx[0].currency_src : "";
        withdrawalData.less_deductions = (
          amount -
          (amount - finAmount / exchange_rate)
        ).toFixed(listCurrencyDecimal.result[item.data.currency]);
        withdrawalData.less_deductions_currency = item.data.currency || "";
        withdrawalData.rate = exchange_rate || "";
        withdrawalData.result_amount = finAmount || "";
        withdrawalData.result_currency = item.data.to_currency || "";
        withdrawalData.exchange_stock = item.data.use_stock ? "yes" : "no";
        withdrawalData.monitoring_address =
          item.dataValues.monitoring_address || "";
        withdrawalData.final_address = item.dataValues.final_address || "";
        withdrawalData.hash = item.dataValues.cryptotx || "";

        // check for NaN
        withdrawalData = checkForNaN(withdrawalData);
      }

      description = description.replace(/\r?\n|\r/g, " ");

      trade_history.push({
        id: item.id,
        create_date: moment(item.ctime).format("YYYY-MM-DD"),
        type: item.event_name.includes("deposit") ? "Deposit" : "Withdrawal",
        client: user.legalname || "",
        merchant: item.data.organisation_name,
        deposit_date,
        bank: item.event_name.includes("deposit")
          ? item.data.bank
            ? item.data.bank.name
            : ""
          : "",
        amount: amount,
        currency: item.data.currency,
        description,
        order_id: order.order_num || "",
        ...withdrawalData
      });
    }
  report.filename = `Transfers - ${moment(data.date_from).format(
    "YYYY-MM-DD"
  )} - ${moment(data.date_to).format("YYYY-MM-DD")}`;
  report.data = {
    trade_history
  };
  return report;
}

function checkForNaN(object) {
  if (!object || !Object.keys(object).length) return;
  for (const key in object) {
    if (object[key] === "NaN") object[key] = "";
  }
  return object;
}

export default {
  prepareTplForTradeHistory
};
