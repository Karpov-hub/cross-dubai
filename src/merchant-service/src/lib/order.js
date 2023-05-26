import db from "@lib/db";
import uuid from "uuid/v4";
import pug from "pug";
import moment from "moment";
import FileProvider from "@lib/fileprovider";
import pdf from "html-pdf";
import transaction from "@lib/base/dist/transaction";
const Op = db.Sequelize.Op;
import Queue from "@lib/queue";

// async function generateOrderNumber(data) {
//   const order_sequence = await db.sequelize.query(
//     `SELECT nextval('order_seq')`,
//     {
//       type: db.sequelize.QueryTypes.SELECT
//     }
//   );
//   let orderNum =
//     Date.parse(new Date()) +
//     String(order_sequence[0].nextval).padStart(10, "0");
//   return orderNum;
// }

/* 
  @author Andrei Mikhin
  @date 22 Jul 2021
  @function updateOrderCounter
  @desc update order_counter to user
*/
async function updateOrderCounter(userId) {
  let orderCounter = await db.user.increment(
    { order_counter: +1 },
    {
      where: { id: userId },
      returning: true,
      plain: true,
      raw: true
    }
  );

  if (orderCounter && orderCounter.length)
    return Number(orderCounter[0][0].order_counter);

  throw "ERRORSETORDERNUM";
}

async function generateProformaInvoice(data, realmId, userId) {
  const metaData = {};
  metaData.report_name = data.report_name;
  metaData.format = data.format;
  // metaData.report_name = "itProformaInvoice";
  // metaData.format = "pdf";
  metaData.userId = userId;
  metaData.orderData = data;
  const invoice = await Queue.newJob("report-service", {
    method: "generateReport",
    data: metaData,
    realmId: realmId,
    userId: userId
  });

  if (
    invoice &&
    invoice.result &&
    invoice.result.success &&
    invoice.result.code
  ) {
    if (!invoice.result.exist)
      await db.order_invoice.create({
        order_id: metaData.orderData.id,
        code: invoice.result.code,
        generation_date: new Date()
      });
    return { success: true, code: invoice.result.code };
  }

  return { success: false };
}

async function createOrder(data, realmId, userId) {
  let order = {
    id: data.id || uuid(),
    merchant: data.merchant ? data.merchant : userId,
    organisation: data.organisation,
    amount: data.amount,
    currency: data.currency,
    res_currency: data.res_currency,
    realm_department: data.realm_department,
    status: data.status,
    details: data.details,
    contract_id: data.contract_id,
    bank_details: data.bank_details,
    order_num: data.order_num
      ? data.order_num
      : await updateOrderCounter(userId),
    date_to: data.date_to
      ? new Date(new Date(data.date_to).setHours(12))
      : new Date(),
    date_from: data.date_from
      ? new Date(new Date(data.date_from).setHours(12))
      : new Date(),
    removed: 0,
    receiver_account: data.receiver_account,
    order_date: data.order_date
      ? new Date(new Date(data.order_date).setHours(12)) ||
        new Date(new Date().setHours(12))
      : new Date(),
    merchant_website: data.merchant_website,
    merchant_owebsites: data.merchant_owebsites,
    amount2: data.amount2 ? data.amount2 : 0,
    currency2: data.currency2,
    additional_data: data.additional_data
  };
  await checkStatus(order);
  let orderData = {};
  orderData.order = order;
  orderData.order.reportTemplate = "itProformaInvoice";

  const res = await db.order.upsert(order);
  // await generateProformaInvoice(orderData, realmId, userId);
  return {
    success: true,
    order
  };
}

async function changeOrderStatus(data, realmId, userId) {
  const order = await db.order.findOne({
    where: {
      id: data.id
    },
    raw: true
  });

  order.status = data.status;

  await checkStatus(order);

  const res = await db.order.update(
    { status: data.status },
    {
      where: {
        id: data.id
      }
    }
  );

  return { success: true };
}

async function checkStatus(order) {
  if (order.status == 1) {
    await db.order.update(
      { status: 2 },
      {
        where: {
          organisation: order.organisation,
          realm_department: order.realm_department,
          contract_id: order.contract_id,
          status: 1
        }
      }
    );
  }
}

async function getOrders(data, realmId, userId) {
  let where = {
    removed: 0
  };

  if (data && data.org_id) where.organisation = data.org_id;
  if (data && data.filters) {
    if (data.filters.date_from && data.filters.date_to)
      where.ctime = {
        [Op.between]: [data.filters.date_from, data.filters.date_to]
      };
    if (
      data.filters.date_from &&
      data.filters.date_from == data.filters.date_to
    ) {
      let parts = data.filters.date_to.split("/");
      let date_to = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2]) + 1
      );
      date_to = `${date_to.getFullYear()}/${date_to.getMonth() +
        1}/${date_to.getDate()}`;
      where.ctime = {
        [Op.between]: [data.filters.date_from, date_to]
      };
    }
    if (data.filters.status) where.status = data.filters.status;
    else
      where.status = {
        [Op.in]: [1, 2]
      };
    if (data.filters.company) {
      where.organisation = data.filters.company;
    }
  }

  let orderObj = {};
  if (data.order && data.dir) {
    if (data.order == "merchant") {
      orderObj.order = [["merchantAlias", "name", `${data.dir}`]];
    } else orderObj.order = [[`${data.order}`, `${data.dir}`]];
  }

  let orders = await db.order.findAndCountAll({
    where,
    attributes: [
      "id",
      "ctime",
      "amount",
      "currency",
      "res_currency",
      "status",
      "order_num"
    ],
    include: [
      {
        model: db.realmdepartment,
        attributes: ["name"]
      },
      {
        model: db.merchant,
        as: "merchantAlias",
        attributes: ["id", "name", "active"],
        where: {
          user_id: userId
        }
      },
      {
        model: db.order_invoice,
        attributes: ["code"]
      }
    ],
    order: orderObj.order,
    offset: data.page > 1 ? data.limit * (data.page - 1) : 0,
    limit: data.limit >= 1 ? data.limit : null
  });

  return {
    list: await prepareOrderData(orders.rows),
    total: orders.count
  };
}
async function prepareOrderData(orders) {
  let listCurrencyDecimal = await getListCurrencyDecimal();
  let arr = [];
  for (let order of orders) {
    let oo = {
      id: order.dataValues.id,
      ctime: order.dataValues.ctime,
      amount: order.dataValues.amount.toFixed(
        listCurrencyDecimal[order.dataValues.currency]
      ),
      currency: order.dataValues.currency,
      res_currency: order.dataValues.res_currency,
      status: order.dataValues.status,
      realm_company: order.dataValues.realmdepartment.dataValues.name,
      company: order.dataValues.merchantAlias.dataValues.name,
      company_id: order.dataValues.merchantAlias.dataValues.id,
      code: order.dataValues.order_invoice
        ? order.dataValues.order_invoice.dataValues.code
        : "",
      order_num: order.order_num,
      merchant_active: order.dataValues.merchantAlias
        ? order.dataValues.merchantAlias.dataValues.active
        : ""
    };
    arr.push(oo);
  }
  return arr;
}
async function getOrderTransactions(data, realmId, userId) {
  let orderObj = {};
  if (data.order && data.dir)
    orderObj.order = [[`${data.order}`, `${data.dir}`]];
  let oo = {
    offset: data.page > 1 ? data.limit * (data.page - 1) : 0,
    limit: data.limit
  };
  let sqlCount = `select count(*) from transfers t, transactions x where x.transfer_id=t.id and x.txtype='transfer' and (t.event_name ~* 'withdrawal' or t.event_name ~* 'deposit') and t.ref_id= :order_id and t.show_to_client=true`;

  let sql = `select t.id, t.event_name, t.held, t.ref_id, t."data", x.transfer_id, x.id, x.acc_src, x.currency_src, x.acc_dst,
  x.currency_dst, x.amount, x.description_dst, x.txtype, x.ctime,
  case when t.status = 3 or t.status = 4 and t.event_name ~* 'withdrawalCustomExchangeRate' then (select id from cryptotx where transfer_id = t.id order by ctime desc limit 1) 
       else '-' end hash
    from transfers t, transactions x
    where x.transfer_id=t.id and x.txtype='transfer' and (t.event_name ~* 'withdrawal' or t.event_name ~* 'deposit') and t.ref_id= :order_id and t.show_to_client=true
    ORDER BY x.ctime desc  
  LIMIT :limit OFFSET :offset`;

  let tx_count = await db.sequelize.query(sqlCount, {
    replacements: {
      order_id: data.order_id
    },
    raw: true,
    type: db.Sequelize.QueryTypes.SELECT
  });

  let res = await db.sequelize.query(sql, {
    replacements: {
      order_id: data.order_id,
      limit: data.limit >= 1 ? data.limit : null,
      offset: data.page > 1 ? data.limit * (data.page - 1) : 0
    },
    raw: true,
    type: db.Sequelize.QueryTypes.SELECT
  });
  // let res = await db.transfer.findAndCountAll({
  //   where: { ref_id: data.order_id },
  //   attributes: ["id", "event_name", "ref_id", "data"],
  //   include: [
  //     {
  //       model: db.transaction,
  //       attributes: [
  //         "transfer_id",
  //         "id",
  //         "acc_src",
  //         "currency_src",
  //         "acc_dst",
  //         "currency_dst",
  //         "amount",
  //         "description_dst",
  //         "txtype",
  //         "ctime"
  //       ],
  //       where: { txtype: "transfer" }
  //     }
  //   ],
  //   order: orderObj.order,
  //   offset: data.page > 1 ? data.limit * (data.page - 1) : 0,
  //   limit: data.limit >= 1 ? data.limit : null
  // });
  return res.length > 0
    ? await prepareTransactions(res, data.order_id, tx_count[0].count)
    : { order_id: data.order_id, financialData: {}, list: [], total: 0 };
}
async function computeDepositAndBalanceByOrder(data, realmId, userId) {
  let listCurrencyDecimal = await getListCurrencyDecimal();
  let money = {
    deposit: 0,
    withdrawn: 0,
    balance: 0
  };
  let txRawData = await db.transfer.findAll({
    where: { ref_id: data.order_id },
    attributes: ["id", "event_name"],
    include: [
      {
        model: db.transaction,
        attributes: ["id", "currency_src", "currency_dst", "amount"],
        where: { txtype: "transfer" }
      }
    ]
  });
  if (txRawData.length) {
    for (let txRaw of txRawData) {
      let method = txRaw.dataValues.event_name.split(":")[1];
      if (method == "deposit")
        money.deposit += Number(txRaw.dataValues.transaction.dataValues.amount);
      if (method == "withdrawalCustomExchangeRate")
        money.withdrawn += Number(
          txRaw.dataValues.transaction.dataValues.amount
        );
    }
    money.balance = money.deposit - money.withdrawn;
    money.balance = money.balance.toFixed(
      listCurrencyDecimal[
        txRawData[0].dataValues.transaction.dataValues.currency_src
      ]
    );
    money.deposit = money.deposit.toFixed(
      listCurrencyDecimal[
        txRawData[0].dataValues.transaction.dataValues.currency_src
      ]
    );
    money.withdrawn = money.withdrawn.toFixed(
      listCurrencyDecimal[
        txRawData[0].dataValues.transaction.dataValues.currency_src
      ]
    );
  }
  return { financialData: money };
}
async function prepareTransactions(txRawData, order_id, total) {
  let listCurrencyDecimal = await getListCurrencyDecimal();
  let txData = [];

  let transferIDsArr = [];
  for (let txRaw of txRawData) {
    if (!transferIDsArr.includes(txRaw.id)) transferIDsArr.push(txRaw.id);
    let oo = {};
    oo.id = txRaw.id;
    oo.transfer_id = txRaw.transfer_id;
    oo.data = txRaw.data;
    oo.ctime = txRaw.ctime;
    oo.currency_src = txRaw.currency_src;
    oo.currency_dst = txRaw.currency_dst;
    oo.description_dst = txRaw.description_dst;
    oo.amount = Number(txRaw.amount).toFixed(
      listCurrencyDecimal[txRaw.currency_src]
    );
    oo.order_id = txRaw.ref_id;
    oo.hash = txRaw.hash;
    oo.held = txRaw.held;
    txData.push(oo);
  }
  await addFeesToTransactions(txData, transferIDsArr, listCurrencyDecimal);

  return { order_id, list: txData, total };
}
async function addFeesToTransactions(txData, tfArr, listCurrencyDecimal) {
  let feesTransactions = await db.transaction.findAll({
    where: { transfer_id: tfArr, txtype: "fee" },
    attributes: ["transfer_id", "amount", "currency_src"]
  });
  for (let tx of txData) {
    for (let feeTx of feesTransactions) {
      if (tx.id == feeTx.dataValues.transfer_id) {
        tx.fee_amount = Number(feeTx.dataValues.amount).toFixed(
          listCurrencyDecimal[feeTx.dataValues.currency_src]
        );
        tx.fee_currency = feeTx.dataValues.currency_src;
      }
    }
  }
  return txData;
}

/***
@Author: Ivan Danilenko
@Date: 24.02.2021
@Description: function for get all decimal values of currencies
@Input: undefined
@Output: Array, Items: {${AbbrCurrency}:${DecimalValue}}
Example response: { USDT: 8, RUR: 3, EUR: 5, USD: 2 }
*/
async function getListCurrencyDecimal() {
  let resulstArray;
  let res = await db.vw_currency_values.findAll({
    attributes: ["abbr", "decimal"],
    raw: true
  });
  resulstArray = prepareDecimalList(res);
  return resulstArray;
}

/***
@Author: Ivan Danilenko
@Date: 24.02.2021
@Description: Prepare data for comfortable using after got this
@Input: Array, Item example: [{"abbr": "USDT", "decimal": 2}]
@Output: Array, Items: {${AbbrCurrency}:${DecimalValue}}
Example response: { USDT: 8, RUR: 3, EUR: 5, USD: 2 }
*/
function prepareDecimalList(data) {
  let resultArray = {};
  for (let i = 0; i < data.length; i++) {
    resultArray[data[i].abbr] = data[i].decimal
      ? data[i].decimal
      : data[i].withdrawal_decimal;
  }
  return resultArray;
}

/***
@Author: Andrei Mikhin
@Date: 04.08.2021
@Description: fetch withdrawal decimals values of currencies
@Input: undefined
@Output: Array, Items: {${AbbrCurrency}:${DecimalValue}}
Example response: { USDT: 8, RUR: 3, EUR: 5, USD: 2 }
*/
async function getWithdrawalDecimalsOfCurrencies() {
  let resulstArray;
  let res = await db.vw_currency_values.findAll({
    attributes: ["abbr", "withdrawal_decimal"],
    raw: true
  });
  resulstArray = prepareDecimalList(res);
  return resulstArray;
}

async function buildDepartmentsArr(departments) {
  let arr = [];
  for (let department of departments) {
    let obj = {
      id: department.dataValues.id,
      name: department.dataValues.name
    };
    obj.currency =
      department.dataValues.realmaccount.dataValues.account.dataValues.currency;
    arr.push(obj);
  }
  return arr;
}
async function getRealmDepartments(data, realm, user) {
  let departments = await db.realmdepartment.findAll({
    where: { realm, status: "Active" },
    attributes: ["id", "name"],
    include: [
      {
        model: db.realmaccount,
        attributes: ["id"],
        include: [{ model: db.account, attributes: ["id", "currency"] }]
      }
    ]
  });
  let result = await buildDepartmentsArr(departments);
  return result;
}

async function getContractsByOrgId(data, realm, user) {
  let merch_contracts = await db.orgs_contract.findAll({
    where: { owner_id: data.org_id },
    include: [
      {
        model: db.contract
      }
    ]
  });
  let contractsArr = [];
  for (let contract of merch_contracts) {
    contractsArr.push(contract.dataValues.contract.dataValues.id);
  }
  let res = await db.orgs_contract.findAll({
    where: { owner_id: data.realm_org_id },
    include: [
      {
        model: db.contract,
        where: { id: { [Op.in]: contractsArr } }
      }
    ]
  });
  let resArr = [];
  for (let r of res) {
    resArr.push(r.dataValues.contract.dataValues);
  }
  return resArr;
}

async function generateInvoice(data, realm, user) {
  let orderData = await preparePdfData(data);
  let invoiceHtml = pug.renderFile(
    __dirname + "/template/invoice.pug",
    orderData
  );
  let buffer = await generatePdf(invoiceHtml);
  let file = await FileProvider.push({
    name: "invoice" + "-" + Date.parse(new Date()) + ".pdf",
    data: buffer
  });
  let res = await db.order_invoice.create({
    order_id: data.order_id,
    code: file.code,
    generation_date: new Date()
  });
  return { success: true, code: file.code };
}
async function generatePdf(data) {
  let options = {
    format: "A4",
    orientation: "portrait",
    border: {
      top: "2cm",
      right: "1cm",
      bottom: "2cm",
      left: "1.5cm"
    }
  };
  return new Promise((resolve, reject) => {
    pdf.create(data, options).toBuffer((err, buffer) => {
      return resolve(buffer);
    });
  });
}
async function preparePdfData(data) {
  let orderObj = await db.order.findOne({ where: { id: data.order_id } });
  let realmOrgObj = await db.realmdepartment.findOne({
    where: { id: orderObj.realm_department }
  });
  orderObj.ctime = moment(orderObj.ctime).format("L");
  return { orderObj, bank_details: realmOrgObj.bank_details };
}
export default {
  createOrder,
  changeOrderStatus,
  getOrders,
  getRealmDepartments,
  getContractsByOrgId,
  generateInvoice,
  getListCurrencyDecimal,
  getOrderTransactions,
  computeDepositAndBalanceByOrder,
  getWithdrawalDecimalsOfCurrencies,
  generateProformaInvoice
};
