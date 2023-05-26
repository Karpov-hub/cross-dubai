import db from "@lib/db";
import Queue from "@lib/queue";
import account from "./account";
import request from "request";
import memstore from "@lib/memstore";
import excelGenerator from "@lib/excel-generator";
import uuid from "uuid/v4";
import plan from "./plan";

const Op = db.Sequelize.Op;

async function realmtransfer(data, realm_id, userId, transactions, hooks) {
  const amount = parseFloat(data.amount);
  if (isNaN(amount)) throw "AMOUNTISNAN";

  const amount_dst = amount / parseFloat(data.exchange_rate);

  data.sentAmount = amount;
  data.finAmount = amount_dst;
  data.custom_exchange_rate = data.exchange_rate;
  data.currency = data.currency_src;
  data.to_currency = data.currency_dst;

  const transferData = {
    ref_id: data.ref_id,
    transfer_type: "transfer",
    acc_src: data.acc_src,
    currency: data.currency_src,
    acc_dst: data.acc_dst,
    to_currency: data.currency_dst,
    amount,
    amount_dst,
    description: data.description,
    options: data.options || {}
  };

  hooks.beforeSendResult = async (result, transfer, transactions) => {
    if (transfer) result.id = transfer.id;
    if (result.tx) result.tx = account.removeHiddenTransactions(result.tx);
    return;
  };

  return transferData;
}

async function transfer(data, realm_id, user_id) {
  if (!data.list || !data.list.length) return {};
  let out = { list: [] };

  const accountsCurrency = await account.checkAccounts(data.list);

  out.transfer = {
    action: "create",
    data: {
      ref_id: data.data.ref_id,
      realm_id,
      user_id,
      event_name: `${data.service}:${data.method}`,
      held: account.checkHoldStatus(data.list),
      description: data.data.description || "",
      data: data.data,
      amount: account.getAmount(data.data)
    }
  };

  let amount_tx, exchange_amount;
  let index = 0;

  let balances = {};
  const updateBalance = function(acc_no, amount) {
    if (!balances[acc_no]) balances[acc_no] = 0;
    balances[acc_no] += amount;
  };

  for (let transaction of data.list) {
    amount_tx = transaction.amount;
    if (
      transaction.amount_to_acc_currency &&
      transaction.amount_to_acc_currency == transaction.acc_dst
    ) {
      exchange_amount = amount_tx;
      amount_tx = await account.exchange(
        amount_tx,
        accountsCurrency[transaction.acc_dst],
        accountsCurrency[transaction.acc_src]
      );
    } else {
      exchange_amount = await account.exchange(
        amount_tx,
        accountsCurrency[transaction.acc_src],
        accountsCurrency[transaction.acc_dst]
      );
    }

    transaction.exchange_amount = exchange_amount;
    transaction.currency = accountsCurrency[transaction.acc_src];
    transaction.exchange_currency = accountsCurrency[transaction.acc_dst];

    out.list.push({
      model: "transaction",
      action: "create",
      data: {
        ref_id: data.data.ref_id,
        realm_id,
        user_id,
        index: index++,
        transfer_id: "",
        txtype: transaction.txtype,
        tariff_id: transaction.tariff_id,
        plan_id: transaction.tariff_plan_id,
        held: transaction.hold,
        hidden: transaction.hidden,
        amount: amount_tx,
        exchange_amount: exchange_amount,
        acc_src: transaction.acc_src,
        acc_dst: transaction.acc_dst,
        description_src: transaction.description_src,
        description_dst: transaction.description_dst,
        currency_src: accountsCurrency[transaction.acc_src],
        currency_dst: accountsCurrency[transaction.acc_dst],
        tariff: transaction.tariff,
        plan: transaction.tariff_plan
      }
    });

    if (!transaction.hold) {
      // increment receiver balance
      updateBalance(transaction.acc_dst, exchange_amount);
    }
    // decrement source balance
    updateBalance(transaction.acc_src, -amount_tx);
  }

  Object.keys(balances).forEach((acc_no) => {
    if (balances[acc_no]) {
      out.list.push({
        model: "account",
        action: balances[acc_no] > 0 ? "increment" : "decrement",
        data: {
          balance: (balances[acc_no] > 0 ? 1 : -1) * balances[acc_no]
        },
        where: { acc_no }
      });
    }
  });

  return out;
}

async function accept(data, realm_id, userId, transactions, hooks) {
  if (!data.transfer_id) throw "THEREISNTID";
  const transfer = await db.transfer.findOne({
    where: { id: data.transfer_id }
  });
  if (!transfer) throw "TRANSFERNOTFOUND";
  if (!transfer.held) throw "TRANSFERPROVIDED1:" + data.transfer_id;

  hooks.beforeSendResult = async (result) => {
    const res = await accept_do(data, realm_id, transfer, arguments[7].lang);
    for (let key in res) result[key] = res[key];

    const a1 = { ...data };
    const a2 = { ...transfer.toJSON() };
    const a3 = { ...res };

    plan.onTransferAccept(a1, a2, a3, realm_id);
  };
  return { ref_id: data.ref_id };
}

// prepare balances if tariff resolves
async function accept_do(data, realm_id, transfer, lang) {
  let transfer_status = await db.transfer.update(
    { status: 3 },
    {
      where: { id: data.transfer_id, realm_id }
    }
  );
  if (transfer_status.length == 0) throw "STATUSNOTUPDATED";

  const transactions = await db.transaction.findAll({
    where: { transfer_id: data.transfer_id, held: true },
    attributes: ["id", "acc_dst", "exchange_amount"]
  });
  await complete_transactions(data.transfer_id, transactions);
  await checkAndSendCallbackRequests(data, transactions);

  const transferData = transfer.toJSON();

  if (transferData.data) {
    if (transferData.data.dst_email) {
      Queue.newJob("auth-service", {
        method: "sendNotificationToTheUser",
        data: {
          code: "payment-accept-receiver",
          recipient: transferData.data.dst_email,
          body: transfer
        },
        realmId: realm_id
      });
    }
    if (transferData.data.src_email) {
      Queue.newJob("auth-service", {
        method: "sendNotificationToTheUser",
        data: {
          code: "payment-accept-sender",
          recipient: transferData.data.src_email,
          body: transfer
        },
        realmId: realm_id
      });
    }
  }

  Queue.broadcastJob("call-admin", {
    model: db.transfer.adminModelName,
    method: "onChange",
    data: transfer
  });

  return { provided: transactions.length, ref_id: data.ref_id };
}

async function acceptTxByCode(data, realm_id, user_id) {
  if (!data.code) throw "SECURECODEEXCEPTED";
  const transfer_id = await memstore.get("txcode:" + data.code);
  if (!transfer_id) throw "SECURECODEEXCEPTED";
  const transfer = await db.sequelize.query(
    "SELECT * FROM transactions WHERE transfer_id=:transfer_id and acc_dst in (SELECT acc_no FROM accounts WHERE owner = :user_id and status=1)",
    { replacements: { transfer_id, user_id } }
  );
  if (!transfer || !transfer[0] || !transfer[0].length) {
    throw "ACCESSDENIED";
  }
  const res = await accept({ transfer_id }, realm_id);
  await memstore.del("txcode:" + data.code);
  return res;
}

async function checkAndSendCallbackRequests(transfer, transactions) {
  for (let transaction of transactions) {
    const techAccount = await account.getTechAccountByAccNo(
      transaction.acc_dst
    );
    if (techAccount && techAccount.callback) {
      await sendCallbackData(techAccount, transfer, transaction);
    }
  }
}

function sendCallbackData(techAccount, transfer, transaction) {
  return new Promise((resolve, reject) => {
    if (!techAccount.callback) {
      return resolve();
    }
    request(
      {
        uri: techAccount.callback,
        method: "POST",
        json: {
          ref_id: transfer.ref_id,
          transfer_id: transfer.transfer_id,
          amount: transaction.amount || transaction.exchange_amount
        }
      },
      function(error) {
        if (error) reject("REALMCALLBACKERROR");
        else resolve();
      }
    );
  });
}

function complete_transactions(transfer_id, transactions) {
  return db.sequelize.transaction(async (t) => {
    for (let transaction of transactions) {
      await account.updateAccountBalance(
        transaction.acc_dst,
        transaction.exchange_amount,
        "+",
        t
      );
      await db.transaction.update(
        {
          held: false
        },
        {
          where: { id: transaction.id },
          transaction: t
        }
      );
    }
    await db.transfer.update(
      {
        held: false
      },
      {
        where: { id: transfer_id },
        transaction: t
      }
    );
  });
}

async function rollback_transactions(
  transfer_id,
  plan_transfer_id,
  transactions
) {
  return db.sequelize.transaction(async (t) => {
    for (let transaction of transactions) {
      await account.updateAccountBalance(
        transaction.acc_src,
        transaction.amount,
        "+",
        t
      );
      await db.transaction.update(
        {
          held: false,
          canceled: true
        },
        {
          where: { id: transaction.id },
          transaction: t
        }
      );
    }
    await db.transfer.update(
      {
        held: false,
        canceled: true
      },
      {
        where: { id: transfer_id },
        transaction: t
      }
    );

    if (plan_transfer_id && plan_transfer_id != "1")
      await db.transfers_plan.update(
        {
          status: 1
        },
        {
          where: { id: plan_transfer_id },
          transaction: t
        }
      );
  });
}

async function rollback(data, realm_id) {
  if (!data.transfer_id) throw "THEREISNTID";
  const transfer = await db.transfer.findOne({
    where: { id: data.transfer_id, realm_id }
  });
  if (!transfer) throw "TRANSFERNOTFOUND";
  if (!transfer.held) throw "TRANSFERPROVIDED2";
  const transactions = await db.transaction.findAll({
    where: { transfer_id: data.transfer_id, held: true },
    attributes: ["id", "acc_src", "amount"]
  });

  let transfer_status = await db.transfer.update(
    { status: 4 },
    {
      where: { id: data.transfer_id, realm_id }
    }
  );
  if (transfer_status.length == 0) throw "STATUSNOTUPDATED";

  await rollback_transactions(
    data.transfer_id,
    data.plan_transfer_id,
    transactions
  );

  if (transfer.is_chain) {
    Queue.newJob("ccoin-service", {
      method: "cancelChain",
      data: { transfer }
    });
  }

  // check user and send mail
  if (transfer.user_id) {
    const user = await db.user.findOne({
      where: { id: transfer.user_id },
      attributes: ["email"]
    });
    if (user && user.email)
      Queue.newJob("auth-service", {
        method: "sendNotificationToTheUser",
        data: {
          code: "rollback",
          recipient: user.email,
          body: transfer
        },
        realmId: realm_id
      });
  }

  Queue.broadcastJob("call-admin", {
    model: db.transfer.adminModelName,
    method: "onChange",
    data: transfer
  });

  return { provided: transactions.length, ref_id: data.ref_id };
}

function getDateConditions(date_from, date_to) {
  const out = {};
  if (date_from) out[Op.gte] = new Date(date_from);
  if (date_to)
    out[Op.lte] = new Date(new Date(date_to).getTime() + 24 * 3600000);
  return out;
}

async function getTransactions(data, realm_id, user_id) {
  let listCurrencyDecimal = await Queue.newJob("merchant-service", {
    method: "getListCurrencyDecimal",
    data: {}
  });
  let orderBy = [["ctime", "DESC"]];

  let filterWhereObj = {
    user_id,
    realm_id,
    data: {},
    canceled: false
  };

  if (data.filters) {
    if (data.filters.date_from && data.filters.date_to)
      filterWhereObj.ctime = {
        [Op.between]: [data.filters.date_from, data.filters.date_to]
      };

    if (data.filters.status) {
      if (data.filters.status == 1)
        filterWhereObj.description_src = "Inward money";
      if (data.filters.status == 2)
        filterWhereObj.description_src = "Withdrawal money";
    }

    if (data.filters.company) {
      filterWhereObj[Op.or] = [
        { data: { merchant: data.filters.company } },
        { data: { merchant_id: data.filters.company } }
      ];
    }
    // if (data.filters.sortBy == "organisation_name") {
    //   orderBy = [
    //     ["merchant_name"]
    //   ];
    //   orderBy[0].push(data.filters.order ? data.filters.order : "DESC");
    // } else if (data.filters.sortBy == "description") {
    //   orderBy = [["description_src"]];
    //   orderBy[0].push(data.filters.order ? data.filters.order : "DESC");
    // } else {
    //   orderBy = [[data.filters.sortBy ? data.filters.sortBy : "ctime"]];
    //   orderBy[0].push(data.filters.order ? data.filters.order : "DESC");
    // }
    //if (!data.filters.status)
    //   filterWhereObj.description_src = {
    //     [Op.in]: ["Inward money", "Withdrawal money"]
    //  };
  }

  //console.log("filterWhereObj:", filterWhereObj);

  let res = await db.vw_transactions_view.findAndCountAll({
    where: filterWhereObj,
    limit: data.limit ? data.limit : null,
    offset: data.start ? data.start : 0,
    order: orderBy
    // group: ["transaction.ctime", "transaction.id", "transfer.id"]
  });

  // let res = await db.transaction.findAndCountAll({
  //   where: filterWhereObj,
  //   limit: data.limit ? data.limit : null,
  //   offset: data.start ? data.start : 0,
  //   include: [
  //     {
  //       model: db.transfer,
  //       where: filterWhereForTransfer,
  //       as: "transfer",
  //               // group: "data.deposit_date"
  //     }
  //   ],
  //   order: orderBy,
  //   // group: ["transaction.ctime", "transaction.id", "transfer.id"]
  // });

  for (let r of res.rows) {
    // console.log(r.dataValues.transfer.dataValues);
    let res = await db.cryptotx.findAll({
      where: {
        transfer_id: r.dataValues.transfer_id
      },
      limit: 1,
      order: [["ctime", "DESC"]],
      raw: true
    });

    if (res && res.length) r.dataValues.cryptotx = res[0];
    r.dataValues.amount = parseFloat(r.dataValues.amount).toFixed(
      listCurrencyDecimal.result[r.currency_dst]
    );
    r.dataValues.description = r.dataValues.description;
    if (r.dataValues.held && r.dataValues.canceled) r.dataValues.status = 1;
    if (!r.dataValues.held && r.dataValues.canceled) r.dataValues.status = 2;
    if (r.dataValues.held && !r.dataValues.canceled) r.dataValues.status = 3;
    if (!r.dataValues.held && !r.dataValues.canceled) r.dataValues.status = 4;
  }
  return res.rows && res.count
    ? { list: res.rows, count: res.count }
    : { list: [], count: 0 };
}
async function getTransfers(data, realm_id, user_id) {
  const filters = data.filters || {};
  const accounts = await account.getAllUsersAccounts(
    user_id,
    filters.marchant_id
  );

  if (!accounts) return { list: [], count: 0 };

  let where = {
    [Op.or]: [
      { acc_src: { [Op.overlap]: accounts } },
      { acc_dst: { [Op.overlap]: accounts } }
    ]
  };

  if (filters.acc_no) {
    let acc = [];
    acc.push(filters.acc_no);
    where = {
      [Op.or]: [
        { acc_src: { [Op.overlap]: acc } },
        { acc_dst: { [Op.overlap]: acc } }
      ]
    };
  }

  if (filters.id) where.id = filters.id;
  if (filters.invoice) where["data.invoice.no"] = filters.invoice;
  if (filters.date_from || filters.date_till)
    where.ctime = getDateConditions(filters.date_from, filters.date_till);
  if (filters.date_processed_from || filters.date_processed_to)
    where.mtime = getDateConditions(
      filters.date_processed_from,
      filters.date_processed_to
    );

  if (filters.status == "pending") {
    where.canceled = false;
    where.held = true;
  }
  if (filters.status == "accepted") {
    where.canceled = false;
    where.held = false;
  }
  if (filters.status == "canceled") {
    where.canceled = true;
    where.held = true;
  }
  if (filters.status == "refund") {
    where.canceled = true;
    where.held = false;
  }

  const params = {
    where,
    offset: data.start || 0,
    limit: data.limit || 20,
    order: [["ctime", "DESC"]],
    attributes: [
      "id",
      "ref_id",
      "held",
      "index",
      "canceled",
      "ctime",
      "mtime",
      "data",
      "acc_src",
      "acc_dst",
      "currency_src",
      "currency_dst",
      "amount",
      "exchange_amount",
      "txtype",
      "status"
    ]
  };

  if (data.xls) {
    delete params.offset;
    delete params.limit;
  }

  const res = await db.vw_transfer_transaction.findAndCountAll(params);

  const list = res.rows.map((transfer) => {
    const amounts = calculateAmounts(transfer, accounts);
    return {
      ref_id: transfer.ref_id,
      id: transfer.id,
      ctime: transfer.ctime,
      status: getTransferStatus(transfer),
      // tx_number:transfer
      // beneficiar:transfer.data.iban?transfer.data.iban:transfer.data.wallet?transfer.data.wallet:"",'
      src_account: amounts.src_account,
      dst_account: amounts.dst_account,
      tx_status: transfer.status,
      mtime: transfer.mtime,
      data: transfer.data || {},
      amount: amounts.amount,
      amount_currency: amounts.amount_currency,
      commission: amounts.commission,
      commission_currency: amounts.commission_currency,
      total: amounts.total,
      total_currency: amounts.total_currency,
      tx: amounts.tx
    };
  });

  return {
    count: res.count,
    list
  };
}
async function preBuildData(data) {
  let list = [];
  for (let d of data.list) {
    d.dataValues.transfer = d.dataValues.transfer.dataValues;
    list.push(d.dataValues);
  }
  return { list };
}
async function buildData(data) {
  let list = [];
  for (let d of data.list) {
    list.push({
      Date: d.ctime,
      Description: d.description,
      "Source account": d.acc_src,
      Amount: d.amount + " " + d.currency_dst,
      "Destination account": d.acc_dst,
      Status:
        d.status == 1
          ? "CANCELED"
          : d.status == 2
          ? "REFUND"
          : d.status == 3
          ? "PENDING"
          : d.status == 4
          ? "TRANSFERRED"
          : ""
    });
  }
  return { list };
}
async function getXls(data, realm_id, user_id) {
  data.xls = true;
  const repData = await getTransactions(data, realm_id, user_id);
  // let preRes = await preBuildData(repData);
  let res = await buildData(repData);
  let keys = await getKeys(res.list[0]).flat(4);
  let columns = [];

  for (const item of keys) {
    if (item != "ref_id" && item != "data" && item != "options") {
      let width = 50;
      if (item == "Date" || item == "Status") width = 20;
      if (
        item == "Source account" ||
        item == "Destination account" ||
        item == "Amount"
      )
        width = 30;
      columns.push({ header: item, key: item, width });
    }
  }

  if (res && res.list && res.list.length) {
    let xls_data = {
      name: `Transactions ${new Date()}.xlsx`,
      title: "Title",
      description: "Description",
      lists: [
        {
          title: `Report ${new Date()}`,
          columns,
          data: res.list
        }
      ]
    };
    let xls_code = await excelGenerator.generate(xls_data);
    return xls_code;
  }
}

function getTransferStatus(transfer) {
  if (transfer.held && transfer.cancel) return "cancel";
  if (!transfer.held && transfer.cancel) return "refund";
  if (transfer.held && !transfer.cancel) return "pending";
  if (!transfer.held && !transfer.cancel) return "success";
}

function calculateAmounts(transferObj, accounts) {
  let result = {
    amount: 0,
    amount_currency: "",
    commission: 0,
    commission_currency: "",
    total: 0,
    total_currency: "",
    tx: []
  };
  transfer = transferObj.toJSON();

  transfer.index.forEach((indx, i) => {
    if (transfer.txtype[i] == "fee") {
      if (accounts.includes(transfer.acc_src[i])) {
        result.src_account = transfer.acc_src[i];
        result.dst_account = transfer.acc_dst[i];
        result.commission += transfer.amount[i];
        result.commission_currency = transfer.currency_src[i];
        result.total += transfer.amount[i];
        result.total_currency = transfer.currency_src[i];
        result.tx[indx] = [transfer.amount[i], transfer.currency_src[i], "-"];
      } else if (accounts.includes(transfer.acc_dst[i])) {
        result.commission += transfer.exchange_amount[i];
        result.commission_currency = transfer.currency_dst[i];
        result.tx[indx] = [
          transfer.exchange_amount[i],
          transfer.currency_dst[i],
          "+"
        ];
      }
    } else {
      if (accounts.includes(transfer.acc_src[i])) {
        result.src_account = transfer.acc_src[i];
        result.dst_account = transfer.acc_dst[i];
        result.amount = transfer.amount[i];
        result.amount_currency = transfer.currency_src[i];
        result.tx[indx] = [transfer.amount[i], transfer.currency_src[i], "-"];
      } else if (accounts.includes(transfer.acc_dst[i])) {
        result.amount = -transfer.exchange_amount[i];
        result.amount_currency = transfer.currency_dst[i];
        result.tx[indx] = [
          transfer.exchange_amount[i],
          transfer.currency_dst[i],
          "+"
        ];
      }
    }
  });
  if (result.amount < 0) result.amount *= -1;

  result.total -= result.amount;
  if (result.total < 0) result.total *= -1;

  return result;
}

async function getStatusById(data, realm) {
  if (!data.transfer_id) throw "THEREISNTID";
  const res = await db.transfer.findOne({
    where: { id: data.transfer_id },
    attributes: ["id", "invoice_number", "held", "canceled", "ctime", "mtime"]
  });
  if (res) return res.toJSON();
  throw "TRANSFERNOTFOUND";
}

function getTxByAccNo(tx, acc_no) {
  for (let t of tx) {
    if (t.acc_src == acc_no) return t;
  }
  return null;
}

async function saveActivateTransferCode(data, transfer_id) {
  const getDuration = (dateStr) => {
    let tm;
    try {
      tm = (new Date(dateStr).getTime() - Date.now()) / 1000;
    } catch (e) {}

    return tm || 0;
  };

  switch (data.limt) {
    case "time":
      {
        await memstore.set(
          "txcode:" + data.code,
          transfer_id,
          getDuration(data.code_expire_time)
        );
      }
      break;
    case "date":
      {
        await memstore.set(
          "txcode:" + data.code,
          transfer_id,
          getDuration(data.code_expire_date)
        );
      }
      break;
    default: {
      await memstore.set("txcode:" + data.code, transfer_id);
    }
  }
}

function getKeys(obj) {
  if (obj != null)
    return Object.keys(obj).map((key, i, keys) => {
      if (typeof obj[key] !== "object") return key;
      return [key, getKeys(obj[key])];
    });
}

async function getBusinessTypes(data, realm_id) {
  const res = await db.business_type.findAll({
    attributes: ["id", "type"]
  });
  if (!res && !res.length) throw "BUSINESSTYPENOTFOUND";
  return res;
}

async function createTransferForApproval(data, realm) {
  let res = await db.not_sent_plan_transfer
    .upsert(data, { returning: true })
    .catch((e) => {
      throw e;
    });
  return { success: true, id: res[0].get("id") };
}

async function rejectTransferForApproval(data, realm) {
  await db.not_sent_plan_transfer
    .update(
      { last_rejection_reason: data.rejection_reason, is_draft: true },
      { where: { id: data.id } }
    )
    .catch((e) => {
      throw e;
    });
  return { success: true, id: data.id };
}

export default {
  rollback,
  accept,
  transfer,
  realmtransfer,
  getStatusById,
  getTransfers,
  getTxByAccNo,
  acceptTxByCode,
  getXls,
  getBusinessTypes,
  getTransactions,
  createTransferForApproval,
  rejectTransferForApproval
};
