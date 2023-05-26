import moment from "moment";
import dbHelper from "./dbHelper";
import Queue from "@lib/queue";
import db from "@lib/db";

async function prepareTplForOrderInvoice(data) {
  const tplData = {};
  const invoice = {};
  const contractorData = await dbHelper.getContractorById(data.contractor);
  const orderData = await dbHelper.getOrderById(data.id);
  const daily_invoice_num = await dbHelper.getContractorDailyInvoiceNum();

  if (!orderData) return { invoice: false };

  let all_currensies = "";
  let user_id = data.merchant;
  let merchant_id = data.organisation;
  let monitoring = await dbHelper.getMonitoringAddress(user_id, merchant_id);
  let wirhdrawal_amounts = await dbHelper.getWithdrawalTransfersByOrderId(
    data.id
  );

  if (!wirhdrawal_amounts.length)
    return { success: false, error: "No withdrawal transfers" };

  tplData.data = {
    invoiceNumber: `IT-${moment(orderData.date_from).format(
      "YYYYMMDD"
    )}4${daily_invoice_num}`,
    location: contractorData.country,
    issueDate: moment(orderData.date_from).format("DD.MM.YYYY"),
    company: contractorData.name,
    reg: contractorData.reg_num,
    taxId: contractorData.tax_id,
    vat: contractorData.vat || "doesn't have",
    legalAddress: contractorData.legal_address,
    officeAddress: contractorData.office_address,
    paymentDetailsFrom:
      wirhdrawal_amounts.length == 2
        ? monitoring.addresses
        : wirhdrawal_amounts[0].currency == "USDT"
        ? monitoring.USDT
        : monitoring.BTC,
    paymentDetailsTo:
      wirhdrawal_amounts.length == 2
        ? "0x78b22647d0366e2a1e4f5f6f7293f00e6f20acb1, 1KWbL1fdNEctg7syGwmYJyabces7ndWxtr"
        : wirhdrawal_amounts[0].currency == "USDT"
        ? "0x78b22647d0366e2a1e4f5f6f7293f00e6f20acb1"
        : "1KWbL1fdNEctg7syGwmYJyabces7ndWxtr",
    phone: contractorData.phone,
    email: contractorData.email,
    agreementDate: moment(contractorData.agreement_date).format("DD.MM.YYYY"),
    agreementNumber: contractorData.agreement_num,
    launchDate: moment(orderData.date_from).format("DD.MM.YYYY"),
    endDate: moment(orderData.date_to).format("DD.MM.YYYY"),
    prepaymentDate: moment(orderData.date_to).format("DD.MM.YYYY"),
    px_list: []
  };

  for (const wa of wirhdrawal_amounts) {
    all_currensies += wa.currency + " and ";

    for (const amount of wa.tx_amounts) {
      if (!tplData.data[`tx_list_${wa.currency}`])
        tplData.data[`tx_list_${wa.currency}`] = [];
      tplData.data[`tx_list_${wa.currency}`].push({
        currency: wa.currency,
        description: "Services and advertising services",
        quantity: "1",
        vat: "0%",
        amount: amount.toFixed(4)
      });
    }

    tplData.data["px_list"].push({
      rate:
        wa.currency == "USDT"
          ? `The rate 1 ${orderData.currency} in ${wa.currency} (${orderData.currency}/${wa.currency})`
          : `The rate 1 ${wa.currency} in ${orderData.currency} (${wa.currency}/${orderData.currency})`,
      rateValue:
        wa.currency == "USDT"
          ? `${orderData.currency}/ ${wa.av_rate.toFixed(4)}`
          : `${wa.currency}/ ${wa.av_rate.toFixed(4)}`,
      currency: wa.currency,
      totalAmount: wa.tx_amounts.reduce((a, b) => a + b).toFixed(4)
    });
  }
  tplData.data.currency = all_currensies.slice(0, -5);

  invoice.data = {
    ...tplData.data
  };

  invoice.report_name = contractorData.report_name;
  invoice.filename = `${contractorData.name} - ${invoice.data.issueDate}`;
  invoice.attachFileToOrder = attachFileToOrder;
  invoice.order_id = orderData.id;
  invoice.type = "Insertion order";
  return invoice;
}

async function prepareTplForInvoice(data) {
  let realm_department = {};
  const invoice = {};
  const bankData = {};
  const iban = await dbHelper.getIBANById(data.iban);
  const rate = await dbHelper.getLatestRates(iban.currency);
  const bank = await dbHelper.getBankById(iban.bank_id);
  const contractData = await dbHelper.getContractById(data.contract_id);
  const merchantData = await dbHelper.getMerchantById(data.organisation);

  let realmDepartment;
  if (data.realm_department)
    realmDepartment = await dbHelper.getRealmDepartment(data.realm_department);
  const taxable = {
    taxableSt: merchantData.vat ? `§ 3c UStG` : "§1(1)N1 UstG",
    taxableEnd: `USt-IdNr. (VAT): ${merchantData.country}${merchantData.vat}`
  };
  const countryFull = merchantData.country
    ? await dbHelper.getCountryByAbbr(merchantData.country)
    : null;

  if (bank && iban) {
    bankData.rd_bank_name = bank.name || "";
    bankData.rd_iban = iban.iban || "";
    bankData.rd_bic = bank.swift || "";
    // bankData.rd_phone = bank.phone || "";
  }

  if (realmDepartment && Object.keys(realmDepartment).length) {
    realm_department = {
      rd_name: realmDepartment.name || "",
      rd_address: `${realmDepartment.street} ${realmDepartment.house}, ${realmDepartment.zip} ${realmDepartment.city}`,
      rd_director: realmDepartment.director || "",
      rd_register: realmDepartment.register || "",
      rd_st_nr: realmDepartment.tax_number || "",
      rd_ust_id: realmDepartment.vat_id || "",
      rd_phone: realmDepartment.phone || ""
    };
  }

  let no_invoice = await dbHelper.getInvoiceNo(iban.currency);
  no_invoice = `${no_invoice}-${new Date().getFullYear()}-${iban.currency}`;

  let date = moment(new Date()).format("DD.MM.YYYY");

  let fullAmount = 0;
  if (data.services && data.services.length)
    for (const service of data.services) {
      if (service.amount) {
        fullAmount += parseFloat(service.amount);
        service.report_amount = service.amount;
        service.amount = new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: iban.currency
        }).format(service.amount);
      }
    }

  if (fullAmount == 0) fullAmount = parseFloat(data.amount);

  let merchantAddress2 = [
    merchantData.street,
    merchantData.house,
    merchantData.short_address,
    merchantData.city_district
  ];

  let merchantAddress3 = [
    merchantData.zip,
    merchantData.city,
    merchantData.region
  ];

  merchantAddress2 = merchantAddress2.filter((n) => n);
  merchantAddress3 = merchantAddress3.filter((n) => n);

  if (merchantData.country && merchantData.country === "DE") {
    let vatPercent = await dbHelper.getVatPercent();
    let sumNetto = (fullAmount * vatPercent) / 100;

    invoice.data = {
      no: no_invoice,
      name: merchantData.name || "",
      address1: merchantData.address,
      address2: merchantAddress2.join(", "),
      address3: merchantAddress3.join(", "),
      country: countryFull ? countryFull.name : "",
      contractNum: contractData.contract_subject,
      rechnungsnummer: no_invoice,
      datum: date,
      sumNetto: new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: iban.currency
      }).format(fullAmount),
      zzgl: `zzgl. ${vatPercent}% Ust`,
      zzglSum: new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: iban.currency
      }).format(sumNetto),
      sumBrutto: new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: iban.currency
      }).format(fullAmount + sumNetto),
      amount: parseFloat(fullAmount),
      currency: iban.currency,
      services: data.services,
      vat_percent: vatPercent,
      period: data.date_from,
      reportTemplate: "ittechnologie",
      leist: `Leistungszeitraum ${moment(data.date_to)
        .locale("de")
        .format("MMMM YYYY")}`
    };
  } else {
    invoice.data = {
      no: no_invoice,
      VAT: merchantData.vat ? true : false,
      name: merchantData.name || "",
      address1: merchantData.address,
      address2: merchantAddress2.join(", "),
      address3: merchantAddress3.join(", "),
      country: countryFull ? countryFull.name : "",
      invoiceNum: no_invoice,
      date: date,
      totalNet: new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: iban.currency
      }).format(fullAmount),
      plus: `plus 0% VAT`,
      plusValue: new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: iban.currency
      }).format(0),
      totalGross: new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: iban.currency
      }).format(fullAmount),
      taxableSt: taxable.taxableSt,
      taxableEnd: taxable.taxableEnd,
      agreement: contractData
        ? `Agreement ${contractData.contract_subject} from ${moment(
            contractData.contract_date
          ).format("DD.MM.YYYY")}`
        : "",
      contractor: `Contractor Insertion Order Nr.${
        data.order_num
      } from ${moment(data.order_date || data.ctime).format("DD.MM.YYYY")}`,
      performance: `Perfomance period ${moment(data.date_to).format(
        "MMMM YYYY"
      )}`,
      period: data.date_from,
      amount: parseFloat(fullAmount),
      currency: iban.currency,
      services: data.services,
      vat_percent: 0,
      reportTemplate: "ittechnologieInvoice"
    };
  }

  invoice.data = { ...invoice.data, ...bankData, ...realm_department };
  invoice.data.rate = rate;
  invoice.data.invoice_name = "Invoice";
  invoice.report_name = invoice.data.reportTemplate;
  invoice.filename = invoice.data.no;

  invoice.attachFileToOrder = attachFileToOrder;
  invoice.order_id = data.id;
  invoice.type = "Invoice";

  let inv = await saveInvoice({
    realmDepartment,
    merchantData,
    invoice: invoice.data
  });

  invoice.invoice_id = inv.dataValues.id;
  return invoice;
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
    invoice_id: data.invoice_id,
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
  prepareTplForInvoice,
  prepareTplForOrderInvoice
};
