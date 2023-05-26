import moment from "moment";
import dbHelper from "./dbHelper";
import Queue from "@lib/queue";
import db from "@lib/db";

const Op = db.Sequelize.Op;

async function prepareTplForDataRecord(data) {
  let date = new Date(),
    y = date.getFullYear(),
    m = date.getMonth();
  let date_from = new Date(y, m - 1, 1);
  let date_to = new Date(y, m, 0);

  if (data.manually) {
    date_from = new Date(y, m, 1);
    date_to = new Date();
  }

  const out = {};

  let { invoices } = await getMonthlyInovices(date_from, date_to);

  let reportData = [];
  for (const item of invoices) {
    const merchantData = await dbHelper.getMerchantById(item.merchant);
    const realmDepartment = await dbHelper.getRealmDepartment(
      item.realm_department
    );
    let merchantCountry;
    let realmDepartmentCountry;

    if (merchantData.country) {
      merchantCountry = await dbHelper.getCountryByAbbr(merchantData.country);
    }

    if (realmDepartment.country) {
      realmDepartmentCountry = await dbHelper.getCountryByAbbr(
        realmDepartment.country
      );
    }

    let net_amount = item.invoice.amount;
    let vat_amount =
      item.invoice.vat_percent != 0
        ? (item.invoice.amount * item.invoice.vat_percent) / 100
        : 0;
    let gross_amount = parseFloat(net_amount) + parseFloat(vat_amount);

    let reportObject = {
      rd_name: realmDepartment.name || "-",
      rd_country: realmDepartmentCountry ? realmDepartmentCountry.name : "-",
      rd_zip: realmDepartment.zip || "-",
      rd_city: realmDepartment.city || "-",
      rd_street: realmDepartment.street || "-",
      rd_building: realmDepartment.house || "-",
      rd_additional_info: realmDepartment.additional_info || "-",
      rd_tax_num: realmDepartment.tax_number || "-",
      rd_vat: realmDepartment.vat_id || "-",

      merchant_name: merchantData.name || "-",
      merchant_country: merchantCountry ? merchantCountry.name : "-",
      merchant_zip: merchantData.zip || "-",
      merchant_city: merchantData.city || "-",
      merchant_street: merchantData.street || "-",
      merchant_building: merchantData.house || "-",
      merchant_additional_info: merchantData.additional_info || "-",
      merchant_tax_num: merchantData.tax_number || "-",
      merchant_client_num: merchantData.client_number || "-",
      merchant_vat: merchantData.vat || "-",

      invoice_num: item.invoice.no,
      invoice_date: moment(item.ctime).format("DD.MM.YYYY"),
      period: moment(item.invoice.period)
        .startOf("month")
        .format("DD.MM.YYYY"),
      currency: item.invoice.currency,
      rate:
        item.invoice.rate == 1 || !item.invoice.rate
          ? "-"
          : item.invoice.rate.toFixed(2),
      net_amount: net_amount,
      vat_rate: item.invoice.vat_percent,
      vat_amount: vat_amount,
      gross_amount: gross_amount,
      invoice_name: item.invoice.invoice_name
    };

    if (
      item.invoice.services &&
      item.invoice.services.length &&
      !item.invoice.services[0].amount
    ) {
      reportObject.service_description = item.invoice.services
        .map((item) => item.service)
        .join(", ");
      reportData.push({ ...reportObject });
    } else {
      for (const service of item.invoice.services) {
        reportObject.service_description = service.service;
        reportObject.net_amount = service.report_amount;
        reportObject.vat_amount =
          item.invoice.vat_percent != 0
            ? (service.report_amount * item.invoice.vat_percent) / 100
            : 0;
        reportObject.gross_amount =
          parseFloat(reportObject.net_amount) +
          parseFloat(reportObject.vat_amount);
        reportData.push({ ...reportObject });
      }
    }
  }

  out.data = {
    data: reportData
  };
  out.report_name = "invoiceDataRecord";
  out.filename = `Data record ${moment(date_from).format(
    "DD.MM.YYYY"
  )}-${moment(date_to).format("DD.MM.YYYY")}`;
  out.type = "Monthly invoice report";
  out.format = data.format;

  if (!data.manually) {
    out.attachFileToOrder = attachFileToOrder; //there is no order, but we save file for the reports module
    out.order_id = await dbHelper.getDefaultRealm(); //realm_id will be used as owner_id in files table
  }

  return out;
}

async function getMonthlyInovices(date_from, date_to) {
  let invoices = await db.invoice.findAll({
    where: {
      ctime: getDateConditions(date_from, date_to)
    },
    raw: true
  });

  return { success: true, invoices };
}

function getDateConditions(date_from, date_to) {
  const out = {};
  if (date_from) out[Op.gte] = new Date(date_from);
  if (date_to)
    out[Op.lte] = new Date(new Date(date_to).getTime() + 24 * 3600000);
  return out;
}

async function attachFileToOrder(data) {
  const uuid = require("uuid/v4");
  let res;
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
  let file = await db.file.findOne({
    where: { id: data.id }
  });
  if (file && file.dataValues.id) {
    await db.file.update(insData, {
      where: { id: file.dataValues.id }
    });
  } else {
    res = await db.file.create(insData, { raw: true });
  }
  if (res) return { success: true, ...res };
  return { success: false };
}

export default {
  prepareTplForDataRecord
};
