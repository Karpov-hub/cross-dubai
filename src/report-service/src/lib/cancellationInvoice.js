import dbHelper from "./dbHelper";
import db from "@lib/db";
import moment from "moment";

async function prepareTplForCancelInvoice(data) {
  let invoiceRec = await dbHelper.getSavedInvoice(data.file_id);
  let fullAmount = 0;
  let report_name = null;

  data = invoiceRec.invoice;

  let no_invoice = await dbHelper.getInvoiceNo(data.currency);
  const merchantData = await dbHelper.getMerchantById(invoiceRec.merchant);
  const realmDepartment = await dbHelper.getRealmDepartment(
    invoiceRec.realm_department
  );

  let merchantAddress2 = [
    merchantData.street,
    merchantData.house,
    merchantData.short_address,
    merchantData.city_district
  ].filter((n) => n);

  let merchantAddress3 = [
    merchantData.zip,
    merchantData.city,
    merchantData.region
  ].filter((n) => n);

  if (data.services && data.services.length)
    for (const service of data.services) {
      if (service.report_amount) {
        service.report_amount = service.report_amount * -1;
        fullAmount += parseFloat(service.report_amount);
        service.amount = new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: data.currency
        }).format(service.report_amount);
      }
    }

  if (fullAmount == 0) fullAmount = parseFloat(data.amount * -1);

  no_invoice = `${no_invoice}-${new Date().getFullYear()}-${data.currency}`;

  data.old_no = data.no;
  data.no = no_invoice;
  data.amount = parseFloat(fullAmount);
  data.address1 = merchantData.address;
  data.address2 = merchantAddress2.join(", ");
  data.address3 = merchantAddress3.join(", ");

  if (merchantData.country && merchantData.country === "DE") {
    let vatPercent = await dbHelper.getVatPercent();
    let zzglSum = (fullAmount * vatPercent) / 100;

    data.zzgl = `zzgl. ${vatPercent}% Ust`;
    data.zzglSum = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: data.currency
    }).format(zzglSum);
    data.sumBrutto = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: data.currency
    }).format(fullAmount + zzglSum);
    data.amount = parseFloat(fullAmount);
    data.sumNetto = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: data.currency
    }).format(fullAmount);
    data.amount = parseFloat(fullAmount);
    data.canceled_from = `${moment(data.date_to).format("DD")}, ${moment(
      data.date_to
    )
      .locale("de")
      .format("MMMM YYYY")}`;
    report_name = "germanyCancellationInvoice";
  } else {
    data.totalNet = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: data.currency
    }).format(fullAmount);
    data.totalGross = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: data.currency
    }).format(fullAmount);
    report_name = "cancellationInvoice";
  }

  let out = {};
  out.data = { ...data };
  out.data.rate = data.rate;
  out.data.invoice_name = "Cancellation invoice";
  out.report_name = report_name;
  out.filename = out.data.no;

  out.attachFileToOrder = attachFileToOrder;
  out.order_id = invoiceRec.order_id;
  out.type = "Cancellation Invoice";

  await saveInvoice({ realmDepartment, merchantData, invoice: out.data });
  return out;
}

async function saveInvoice(data) {
  const insData = {
    invoice: data.invoice,
    realm_department: data.realmDepartment.id,
    merchant: data.merchantData.id
  };

  let invoice = await db.invoice.create(insData, { raw: true });

  return { success: true, ...invoice };
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
  prepareTplForCancelInvoice
};
