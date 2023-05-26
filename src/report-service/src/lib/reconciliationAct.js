import moment from "moment";
import db from "@lib/db";
import dbHelper from "./dbHelper";

async function prepareTplForReconciliationAct(data) {
  const dataToPrepare = {};
  const report = {};
  let contract_data;
  let merchant_data;
  let country;
  let tx_list = [];
  report.report_name = data.report_name;
  report.format = data.format;
  if (data.date_from && data.date_to) {
    data.date_from = new Date(data.date_from);
    data.date_to = new Date(data.date_to);
  }
  if (report.report_name == "reconciliation_act") {
    const payments = await _getPaymentsList(data);
    if (!payments) return { success: false };
    for (let i = 0; i < payments.txList.length; i++) {
      tx_list.push({
        receiptDate: moment(payments.txList[i].receiptdate).format(
          "DD.MM.YYYY"
        ),
        amount: parseFloat(payments.txList[i].amount).toFixed(2),
        currency: payments.txList[i].currency
      });
      if (
        i == payments.txList.length - 1 ||
        new Date(payments.txList[i + 1].receiptdate).getMonth() + 1 !=
          new Date(payments.txList[i].receiptdate).getMonth() + 1
      ) {
        for (const total of payments.totals) {
          if (
            total.month ==
            new Date(payments.txList[i].receiptdate).getMonth() + 1
          ) {
            tx_list.push({
              totalAmount: parseFloat(total.sum).toFixed(2),
              totalCurrency: total.currency
            });
          }
        }
      }
    }
  } else {
    const invoices = await _getInvoicesList(data);
    if (!invoices) return { success: false };
    for (const item of invoices) {
      tx_list.push({
        invoiceNumber: item.invoice_no,
        invoiceDate: item.invoice_date,
        amount: parseFloat(item.amount).toFixed(2),
        currency: item.currency
      });
    }
  }

  if (data && data.merchant_id && data.contract_id) {
    dataToPrepare.merchantData = await dbHelper.getMerchantById(
      data.merchant_id
    );
    dataToPrepare.contractData = await dbHelper.getContractById(
      data.contract_id
    );

    if (dataToPrepare.merchantData)
      country = await dbHelper.getCountryByAbbr(
        dataToPrepare.merchantData.country
      );
    if (dataToPrepare.contractData) {
      contract_data = {
        no: dataToPrepare.contractData.contract_subject || "",
        dd: moment(dataToPrepare.contractData.contract_date).format(
          "DD.MM.YYYY"
        ),
        director: dataToPrepare.contractData.director_name
      };
    }

    if (dataToPrepare.merchantData) {
      let merchantAddress = [
        dataToPrepare.merchantData.street,
        dataToPrepare.merchantData.house,
        dataToPrepare.merchantData.short_address,
        dataToPrepare.merchantData.city_district,
        dataToPrepare.merchantData.zip,
        dataToPrepare.merchantData.city,
        dataToPrepare.merchantData.region
      ].filter((n) => n);

      merchant_data = {
        company: dataToPrepare.merchantData.name,
        country: country ? country.name : dataToPrepare.merchantData.country,
        address: merchantAddress.length
          ? merchantAddress.join(", ")
          : dataToPrepare.merchantData.address
      };
    }
    report.data = {
      year: new Date().getFullYear(),
      tx_list: tx_list
    };
    report.data = { ...report.data, ...contract_data, ...merchant_data };
    report.filename = `Act_dd_${moment(new Date()).format(
      "DD_MM_YYYY"
    )}_${report.data.company || ""} ${
      report.report_name.includes("invoice") ? "(invoice)" : ""
    }`;
  }

  return report;
}
async function _getInvoicesList(data) {
  const sql = `
      select * from (
        select t.id, t.data->'invoice'->>'no' as invoice_no,
        case when t.data->>'deposit_date' is null then t.ctime::text else t.data->>'deposit_date' end invoice_date,
        t.amount, t.data->>'currency' as currency
        from transfers t inner join orders o on (t.ref_id::uuid = o.id), transactions x
           where o.contract_id = :contract_id and x.transfer_id=t.id and x.txtype='transfer' and t.event_name ~* 'deposit' and t.data->>'merchant' = :merchant_id and t.canceled is not true and t.held is not true
           ) data
       where invoice_date between :date_from and :date_to and invoice_no is not null
       order by currency 
      `;
  const replacements = {
    contract_id: data.contract_id,
    merchant_id: data.merchant_id,
    date_from: data.date_from,
    date_to: data.date_to
  };
  const invoicesList = await db.sequelize.query(sql, {
    replacements,
    raw: true,
    type: db.Sequelize.QueryTypes.SELECT
  });
  if (invoicesList && invoicesList.length) return invoicesList;
  return [];
}
async function _getPaymentsList(data) {
  const sql = `
  select * from (
    select t.id, case when t.data->>'deposit_date' is null then t.ctime::text else t.data->>'deposit_date' end receiptDate, t.amount, t.data->>'currency' as currency
       from transfers t inner join orders o on (t.ref_id::uuid = o.id)
       , transactions x
       where o.contract_id = :contract_id
       and x.transfer_id=t.id and x.txtype='transfer' and t.event_name ~* 'deposit' and t.data->>'merchant' = :merchant_id and t.canceled is not true and t.held is not true
       ) data
   where receiptDate between :date_from and :date_to
   order by receiptDate asc
           `;
  const totalMonthlyAmountSql = `
      select sum(amount), date_part('month', deposit_date::date) as month, currency from (
        select * from (
        select t.id, case when t.data->>'deposit_date' is null then t.ctime::text else t.data->>'deposit_date' end deposit_date, t.amount, t.data->>'currency' as currency
        from transfers t inner join orders o on (t.ref_id::uuid = o.id), transactions x
           where o.contract_id = :contract_id and x.transfer_id=t.id and x.txtype='transfer' and t.event_name ~* 'deposit' and t.data->>'merchant' = :merchant_id and t.canceled is not true and t.held is not true
           ) data
       where deposit_date between :date_from and :date_to
       order by deposit_date asc
       ) data2
       group by  date_part('month', deposit_date::date), currency
       
       `;
  return db.sequelize.transaction(async (t) => {
    const replacements = {
      contract_id: data.contract_id,
      merchant_id: data.merchant_id,
      date_from: data.date_from,
      date_to: data.date_to
    };
    const transactions = await db.sequelize.query(sql, {
      replacements,
      raw: true,
      type: db.Sequelize.QueryTypes.SELECT
    });
    if (transactions) {
      const totalMonthlyAmount = await db.sequelize.query(
        totalMonthlyAmountSql,
        {
          replacements,
          raw: true,
          type: db.Sequelize.QueryTypes.SELECT
        }
      );
      if (totalMonthlyAmount) {
        return { txList: transactions, totals: totalMonthlyAmount };
      }
      throw "ERRORWHILEGETPAYMENTLIST";
    }
  });
}

export default {
  prepareTplForReconciliationAct
};
