import db from "@lib/db";
import account from "./account";
import transfer from "./transfer";
import pug from "pug";

async function getDataByTransferId(data, realm) {
  if (!data.transfer_id) throw "THEREISNTID";
  const transferData = await db.transfer.findOne({
    where: { id: data.transfer_id },
    attributes: ["data", "held", "canceled", "ctime", "id"]
  });
  if (!transferData) throw "TRANSFERNOTFOUND";
  const tx = await db.transaction.findAll({
    where: { transfer_id: data.transfer_id },
    attributes: ["acc_src", "amount", "currency_src"]
  });
  if (!tx) throw "TRANSFERNOTFOUND";

  const tech = await account.getTechAccountsByAccsNo(
    tx.map((t) => t.acc_src),
    "1"
  );

  if (!tech) throw "THEREISNTTECHACCOUNT";

  let out = [];
  tech.map((item) => {
    const t = transfer.getTxByAccNo(tx, item.account.acc_no);

    if (t) {
      out.push({
        amount: t.amount,
        currency: t.currency_src,
        iban: item.iban.iban,
        details: item.details,
        country: item.country,
        bank: item.iban.bank
      });
    }
  });

  return {
    invoices: out,
    data: transferData.data,
    held: transferData.held,
    canceled: transferData.canceled,
    id: transferData.id,
    ctime: transferData.ctime
  };
}

async function getTplForUser(invoice_tpl) {
  const res = await db.invoice_template.findOne({
    where: invoice_tpl ? { invoice_tpl } : { def: true },
    attributes: ["html"]
  });
  if (res && res.html) return res.html;
  return "";
}

async function getHtmlByTransferId(data, realmId, userId) {
  const invoiceData = await getDataByTransferId(data, realmId);
  invoiceData.user = await db.user.findOne({ where: { id: userId } });
  invoiceData.transfer_id = data.transfer_id;
  invoiceData.date = new Date().toLocaleDateString("en-US");

  invoiceData.no = invoiceData.data.no;

  const tpl = await getTplForUser(invoiceData.user.invoice_tpl);
  const html = pug.render(tpl, invoiceData);

  return {
    html
  };
}

export default {
  getHtmlByTransferId,
  getDataByTransferId
};
