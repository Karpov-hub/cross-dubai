import db from "@lib/db";
const Op = db.Sequelize.Op;

async function getUserMerchants(user_id) {
  let merchants = await db.merchant.findAll({
    where: { user_id },
    attributes: ["id", "name"],
    raw: true
  });
  return merchants;
}

async function getNonAdOrdersList(
  { filters = null, order = null, opts: { start, limit } },
  realm,
  user
) {
  let merchants_data = await getUserMerchants(user);
  if (!merchants_data.length) throw "MERCHANTNOTFOUND";
  let merchants_ids = merchants_data.map((el) => {
    return el.id;
  });
  let where = { organisation: merchants_ids };

  if (filters?.date) where.ctime = {};
  if (filters?.date?.from) where.ctime[Op.gte] = filters.date.from;
  if (filters?.date?.to) where.ctime[Op.lte] = filters.date.to;
  if (filters?.merchant_id) where.merchant_id = filters.merchant_id;
  if (filters?.status) where.status = filters.status;

  let options = {
    where,
    attributes: [
      "id",
      "organisation",
      "order_type",
      "ctime",
      "status",
      "no",
      "short_id"
    ],
    offset: start,
    limit,
    raw: true,
    order: [["ctime", "DESC"]]
  };
  if (order?.field && order?.dir) options.order = [[order.field, order.dir]];
  let { count, rows: list } = await db.non_ad_order
    .findAndCountAll(options)
    .catch((e) => {
      console.log("getnonAdOrdersList: ", e);
      throw "ORDERSSELECTIONERROR";
    });

  list = list.map((el) => {
    let merchant = merchants_data.find((merch) => {
      return merch.id == el.organisation;
    });
    return { ...el, merchant_name: merchant.name };
  });
  return { list, count };
}

async function getOrderTransfer(transfer_id) {
  let transfer = await db.not_sent_plan_transfer.findOne({
    where: { id: transfer_id },
    raw: true
  });
  if (transfer) {
    let { name: merchant_name } = await db.merchant.findOne({
      where: { id: transfer.merchant_id },
      attributes: ["name"],
      raw: true
    });
    transfer.merchant_name = merchant_name;

    let { name: plan_name } = await db.accounts_plan.findOne({
      where: { id: transfer.plan_id },
      attributes: ["name"]
    });
    transfer.plan_name = plan_name;
    return { ...transfer, type: "not_approved" };
  }
  transfer = await db.transfers_plan.findOne({
    where: { id: transfer_id },
    raw: true
  });
  if (!transfer) return { type: "not_valid" };
  transfer.transfers = await db.transfer.findAll({
    where: { plan_transfer_id: transfer_id },
    raw: true
  });
  if (!transfer.transfers) return { type: "not_valid" };
  let tf_ids = transfer.transfers.map((el) => {
    return el.id;
  });
  let transactions = await db.transaction.findAll({
    where: { transfer_id: tf_ids },
    raw: true
  });
  for (let tf of transfer.transfers)
    for (let tx of transactions)
      if (tf.id == tx.transfer_id) {
        if (!tf.transactions) {
          tf.transactions = [tx];
          continue;
        }
        tf.transactions.push(tx);
      }
  return { ...transfer, type: "approved" };
}

async function prepareOrderTransfers(order_data) {
  for (let key of Object.keys(order_data.additional_data))
    if (order_data?.additional_data[`${key}_transfer_id`])
      order_data.additional_data[
        `${key}_transfer_data`
      ] = await getOrderTransfer(
        order_data.additional_data[`${key}_transfer_id`]
      );
  return order_data;
}

async function prepareOrderTranches(order_id) {
  return await db.tranche.findAll({ where: { ref_id: order_id }, raw: true });
}

async function getNonAdOrder({ order_id }, realm, user) {
  let non_ad_order = await db.non_ad_order.findOne({
    where: { id: order_id },
    attributes: [
      "id",
      "ctime",
      "organisation",
      "order_type",
      "status",
      "no",
      "additional_data",
      "short_id"
    ],
    raw: true
  });

  if (non_ad_order.additional_data) await prepareOrderTransfers(non_ad_order);
  non_ad_order.tranches = await prepareOrderTranches(non_ad_order.id);
  return non_ad_order;
}

export default {
  getNonAdOrdersList,
  getNonAdOrder
};
