import db from "@lib/db";
import account from "./account";
const Op = db.Sequelize.Op;

function getDateConditions(date_from, date_to, out) {
  if (date_from) {
    out.where.push("ctime>= :date_from ");
    out.replacements.date_from = new Date(date_from);
  }
  if (date_to) {
    out.where.push("ctime<= :date_to ");
    out.replacements.date_to = new Date(
      new Date(date_to).getTime() + 24 * 3600000
    );
  }
}

async function _getAccountsByWallet(address) {
  const res = await db.account_crypto.findAll({
    where: { address },
    attributes: ["acc_no"],
    raw: true
  });

  return res && res && res.length ? res.map((item) => item.acc_no) : null;
}

async function buildWhere(filters, user_id) {
  let out = { where: [], replacements: {} };
  let accounts = [];

  if (!filters) return out;

  if (filters.wallet) {
    accounts = await _getAccountsByWallet(filters.wallet);
  } else {
    accounts = await account.getAllUsersAccounts(user_id, filters.company);
  }

  if (!accounts) return out;

  out.where.push(
    "(acc_src in (:accounts) or acc_dst in (:accounts)) and event_name != :realmtransfer"
  );
  out.replacements.accounts = accounts;
  out.replacements.realmtransfer = "account-service:realmtransfer";

  if (filters.date_from || filters.date_to) {
    getDateConditions(filters.date_from, filters.date_to, out);
  }

  if (filters.type == 1) {
    out.where.push("event_name IN (:event_name)");
  } else if (filters.type == 2) {
    out.where.push("event_name NOT IN (:event_name)");
  }
  out.replacements.event_name = [
    "account-service:deposit",
    "ccoin-service:deposit",
    "ccoin-service:completeTransfer"
  ];

  out.where.push("canceled != true");
  out.where.push(
    "(show_to_client = true OR (show_to_client = false AND invisibility_exp_date <= :invisibility_exp_date))"
  );
  out.where.push(`id not in (
    SELECT val1.id
    FROM vw_all_transfers val1
    where val1."type" = 'p' and val1.held = false and val1.canceled = true and val1.id not in (
      SELECT val2.id
      FROM vw_all_transfers val2
      where val2.held = true and val2.canceled = false and val2."type" = 'p'
    ) and id in (
    select tp.id
    from transfers_plans tp
    inner join accounts_plans ap
    on (ap.id = tp.plan_id and tp.step < json_array_length(ap.items -> '_arr')-1)
    )
  )
  `);
  out.replacements.invisibility_exp_date = new Date();
  return out;
}

async function completeMerchants(merchants, out) {
  const merchs = await db.merchant.findAll({
    where: { id: { [Op.in]: Object.keys(merchants) } },
    attributes: ["id", "name"],
    raw: true
  });

  merchs.forEach((m) => {
    for (let k in out) {
      if (m.id == out[k].merchant_id) {
        out[k].organisation_name = m.name;
      }
    }
  });
}

async function buildPlanItems(items, plans, userId) {
  const out = {};
  const merchants = {};
  const transfers = {};

  const clientAccounts = await db.vw_client_accs.findAll({
    where: { owner: userId },
    attributes: ["merchant_id", "crypto_address"],
    raw: true
  });

  for (let item of items) {
    transfers[item.id] = 1;
    if (item.canceled) continue;
    if (!out[item.plan_transfer_id]) {
      out[item.plan_transfer_id] = {
        id: item.plan_transfer_id,
        transfer_id: [],
        type: "Withdrawal",
        ctime: item.ctime,
        amount: item.amount,
        amount_currency: item.data.plan.from.currency,
        fees_currency: item.data.plan.from.currency,
        merchant_id: item.data.merchant_id,
        converted_currency: item.data.plan.to.currency,
        step: item.description,
        status: "PENDING",
        tx: 0,
        transfer_data: {},
        description: item.description.replace(/Withdrawal|Deposit|\n/g, "")
      };
      merchants[item.data.merchant_id] = "";
    }
    out[item.plan_transfer_id].tx++;
    out[item.plan_transfer_id].is_chain = item.is_chain;

    if (item?.data?.netData) {
      if (item.data.netData.net) {
        out[item.plan_transfer_id].converted_currency =
          item.data.netData.net.currencyId;
      }
      if (item.data.netData.exchange) {
        out[item.plan_transfer_id].exchange_rate =
          item.data.netData.exchange.executed_price;
        out[item.plan_transfer_id].converted =
          item.data.netData.exchange.quantity;
        out[item.plan_transfer_id].spent =
          item.data.netData.exchange.quantity *
          item.data.netData.exchange.executed_price;
      }
    }
    if (item?.data?.netData?.rate && item?.data?.netData?.amount) {
      out[item.plan_transfer_id].exchange_rate = item.data.netData.rate;
      out[item.plan_transfer_id].converted = item.data.netData.amount;
    }
    out[item.plan_transfer_id].step = item.description;
    out[item.plan_transfer_id].transfer_id.push(item.id);

    if (plans[item.plan_transfer_id]?.prevdata?.net) {
      if (plans[item.plan_transfer_id].prevdata.net.error) {
        plans[item.plan_transfer_id].prevdata.net =
          typeof plans[item.plan_transfer_id].prevdata.net.error === "string"
            ? JSON.parse(plans[item.plan_transfer_id].prevdata.net.error)
            : plans[item.plan_transfer_id].prevdata.net.error;
      }
      out[item.plan_transfer_id].transfer_data = {
        ...plans[item.plan_transfer_id].prevdata.net,
        address: plans[item.plan_transfer_id].prevdata.net.toAddress
      };
    }
    if (plans[item.plan_transfer_id])
      out[item.plan_transfer_id].tf_by_plan_description =
        plans[item.plan_transfer_id].tf_by_plan_description &&
        plans[item.plan_transfer_id].tf_by_plan_description.ui
          ? plans[item.plan_transfer_id].tf_by_plan_description.ui
          : "";
    if (
      plans[item.plan_transfer_id] &&
      plans[item.plan_transfer_id]._arr &&
      plans[item.plan_transfer_id].step >=
        plans[item.plan_transfer_id]._arr.length - 1
    ) {
      out[item.plan_transfer_id].status = "COMPLETED";
    }

    // if within one order there was a transfer to the client's account within the system
    // need to show the merchant of the recipient, not the sender
    if (item.user_id != userId) {
      for (const ca of clientAccounts) {
        if (item.data.plan.from.extra == ca.crypto_address) {
          out[item.plan_transfer_id].merchant_id = ca.merchant_id;
        }
      }
    }
  }

  await completeMerchants(merchants, out);

  await completeFees(transfers, out);

  return Object.keys(out).map((k) => out[k]);
}

async function completeFees(transfers, out) {
  const items = await db.transaction.findAll({
    where: { transfer_id: { [Op.in]: Object.keys(transfers) } },
    raw: true
  });
  const transactions = {};
  for (let item of items) {
    if (!transactions[item.transfer_id])
      transactions[item.transfer_id] = { fee: 0 };
    if (item.txtype == "fee") transactions[item.transfer_id].fee += item.amount;
  }
  for (let k in out) {
    let fee = 0;
    if (transactions[out[k].transfer_id[0]])
      fee = transactions[out[k].transfer_id[0]].fee;
    out[k].fees = fee;
    out[k].amount_netto = out[k].amount - out[k].fees;
    out[k].unspent = out[k].amount_netto - out[k].spent;

    // calculate exchange rate if unspent more than 0
    out[k].exchange_rate =
      out[k].unspent > 0
        ? out[k].amount_netto / parseFloat(out[k].converted)
        : parseFloat(out[k].exchange_rate);

    // hide spent from response
    delete out[k].spent;
  }
}

async function getPlanRecords(ids, userId) {
  const items = await db.transfer.findAll({
    where: { plan_transfer_id: { [Op.in]: ids } },
    order: [["ctime", "ASC"]],
    raw: true
  });
  const plans = await db.transfers_plan.findAll({
    where: { id: { [Op.in]: ids } },
    attributes: ["id", "items", "step", "prevdata", "description"],
    raw: true
  });
  const planObj = {};
  plans.forEach((i) => {
    planObj[i.id] = {
      ...i.items,
      step: i.step,
      prevdata: i.prevdata,
      tf_by_plan_description:
        i.description && i.description.ui ? i.description : ""
    };
  });
  return await buildPlanItems(items, planObj, userId);
}

async function getNormalRecords(ids, userId) {
  const transfers = await db.vw_transfer.findAll({
    where: { id: { [Op.in]: ids } },
    order: [["ctime", "DESC"]],
    raw: true
  });
  const transactions = await db.transaction.findAll({
    where: { transfer_id: { [Op.in]: ids }, hidden: false },
    order: [["ctime", "ASC"]],
    raw: true
  });
  const crypto = await db.cryptotx.findAll({
    where: { transfer_id: { [Op.in]: ids } },
    order: [["ctime", "ASC"]],
    attributes: ["id", "transfer_id", "amount", "currency_id", "tag"],
    raw: true
  });

  return await buildNormalTransfers(transfers, transactions, crypto, userId);
}

async function buildNormalTransfers(transfers, transactions, crypto, userId) {
  let out = [];

  const clientAccounts = await db.vw_client_accs.findAll({
    where: { owner: userId },
    attributes: ["owner", "merchant_name", "crypto_address"],
    raw: true
  });

  for (let transfer of transfers) {
    let txs = [];
    let ctx = null;
    let ccount = 0;

    for (let tx of transactions) {
      if (tx.transfer_id == transfer.id) {
        txs.push(tx);
      }
    }
    for (let tx of crypto) {
      if (tx.transfer_id == transfer.id) {
        ctx = tx;
        ccount++;
      }
    }

    let item = buildOneNormalTx(
      transfer,
      txs,
      ctx,
      ccount,
      clientAccounts,
      userId
    );
    if (item) out.push(item);
  }
  return out;
}

function buildOneNormalTx(
  transfer,
  transactions,
  crypto,
  ccount,
  clientAccounts,
  userId
) {
  const result = {
    id: transfer.id,
    type: "Normal",
    ctime: transfer.data.deposit_date || transfer.ctime,
    amount: transfer.amount,
    amount_currency: transfer.currency,
    organisation_name: transfer.organisation_name,
    fees: 0,
    fees_currency: transfer.currency,
    amount_netto: 0,
    spent: 0,
    unspent: 0,
    exchange_rate: 0,
    converted: crypto ? crypto.amount : 0,
    converted_currency: crypto ? crypto.currency_id : "",
    hash: "",
    status: ccount == 3 ? "COMPLETED" : "PENDING",
    transfer_data: transfer.data
  };

  let isHeld = false;

  for (let tx of transactions) {
    if (tx.txtype == "transfer") {
      const type = tx.description_src.replace("money", "").trim();
      result.type = type == "Deposit" ? "Inward" : type;
      isHeld = tx.held;
    }
    if (tx.txtype == "fee") result.fees += tx.amount;
  }

  if (result.fees) {
    result.amount_netto = result.amount - result.fees;
    result.spent = result.amount_netto;
    result.exchange_rate = result.converted
      ? result.spent / result.converted
      : 0;
  }

  // if within one order there was a transfer to the client's account within the system
  // need to show the merchant of the recipient, not the sender
  if (transfer.user_id != userId) {
    for (const ca of clientAccounts) {
      if (
        transfer.data.address &&
        ca.crypto_address &&
        transfer.data.address.toLowerCase() == ca.crypto_address.toLowerCase()
      ) {
        result.organisation_name = ca.merchant_name;
      }
    }
  }

  // if there was a transfer within one client between its merchants
  // then on the receipt it is necessary to show the merchant of the recipient
  if (result.type == "Inward") {
    for (const ca of clientAccounts) {
      if (
        transfer.data.address &&
        ca.crypto_address &&
        transfer.data.address.toLowerCase() ==
          ca.crypto_address.toLowerCase() &&
        transfer.user_id == ca.owner
      ) {
        result.organisation_name = ca.merchant_name;
      }
    }
  }

  result.status = isHeld ? "PENDING" : "COMPLETED";

  if (!isHeld) {
    result.hash = crypto
      ? crypto.id
      : transfer.data.txId
      ? transfer.data.txId
      : "";
  }

  return result;
}

function updateItem(item, rec) {
  for (let key in rec) {
    item[key] = rec[key];
  }
}

async function completePlanTransfers(items, userId) {
  const ids = items.filter((item) => item.type == "p").map((item) => item.id);
  if (!ids || !ids.length) return;
  const records = await getPlanRecords(ids, userId);
  records.forEach((rec) => {
    for (let item of items) {
      if (item.id == rec.id) {
        updateItem(item, rec);
        break;
      }
    }
  });
}

async function completeNormalTransfers(items, userId) {
  const ids = items.filter((item) => item.type == "t").map((item) => item.id);
  if (!ids || !ids.length) return;
  const records = await getNormalRecords(ids, userId);
  records.forEach((rec) => {
    for (let item of items) {
      if (item.id == rec.id) {
        updateItem(item, rec);
        break;
      }
    }
  });
}

async function addHashes(items) {
  let tIds = [];
  let currencies = [];
  for (let item of items) {
    currencies.push(item.amount_currency);
    if (item.transfer_id) tIds = tIds.concat(item.transfer_id);
    else tIds.push(item.id);
  }
  const hashes = await db.cryptotx.findAll({
    where: { transfer_id: { [Op.in]: tIds } },
    attributes: ["id", "transfer_id"],
    raw: true
  });
  const explorer_urls = await db.currency.findAll({
    where: { abbr: currencies },
    attributes: ["abbr", "explorer_url"],
    raw: true
  });
  for (let hash of hashes) {
    for (let item of items) {
      if (hash.transfer_id == item.id) {
        item.hash = hash.id;
        let { explorer_url = "" } =
          explorer_urls.find((el) => {
            return el.abbr == item.amount_currency;
          }) || {};
        item.explorer_url = explorer_url;
        break;
      } else if (
        item.transfer_id &&
        item.transfer_id.length &&
        hash.transfer_id == item.transfer_id[item.transfer_id.length - 1]
      ) {
        item.hash = item.status == "COMPLETED" ? hash.id : "";
        let { explorer_url = "" } =
          explorer_urls.find((el) => {
            return el.abbr == item.amount_currency;
          }) || {};
        item.explorer_url = explorer_url;
        break;
      }
    }
  }
}

async function list(data, realm, user) {
  const find = await buildWhere(data.filters, user);
  const where = find.where.join(" and ");

  let sql = `SELECT count(*) as cnt FROM (SELECT id FROM vw_all_transfers WHERE ${where} GROUP BY id) as t`;

  let items;
  try {
    items = await db.sequelize.query(sql, {
      replacements: find.replacements,
      type: db.sequelize.QueryTypes.SELECT
    });
  } catch (e) {
    console.log("e:", e);
  }

  if (!items || !items[0] || !items[0].cnt) return { count: 0, list: [] };

  const count = items[0].cnt;
  let start = parseInt(data.start) || 0;
  let limit = parseInt(data.limit) || 20;
  if (limit > 50) limit = 20;

  sql = `SELECT id, type, ctime FROM vw_all_transfers WHERE ${where} GROUP BY id, type, ctime ORDER BY ctime DESC OFFSET ${start} LIMIT ${limit}`;
  items = null;
  try {
    items = await db.sequelize.query(sql, {
      replacements: find.replacements,
      type: db.sequelize.QueryTypes.SELECT
    });
  } catch (e) {
    console.log("e:", e);
  }

  await completePlanTransfers(items, user);
  await completeNormalTransfers(items, user);
  await addHashes(items);

  return {
    count,
    list: items
  };
}

export default {
  list,
  getPlanRecords
};
