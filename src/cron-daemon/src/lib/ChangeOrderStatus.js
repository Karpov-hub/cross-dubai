import db from "@lib/db";

const Op = db.Sequelize.Op;

const time = "0 */12 * * *"; // At minute 0 past every 12th hour
const description = "Change order status";

async function run() {
  const orders = await db.order.findAll({
    where: {
      status: 1
    },
    attributes: ["id", "date_to", "date_from", "status"]
  });
  let today = new Date();
  today.setDate(today.getDate() - 1);
  today.setHours(0, 0, 0, 0);

  let completed_orders = [];
  let ongoing_orders = [];

  for (let order of orders) {
    if (order.date_to) {
      order.date_to.setHours(0, 0, 0, 0);
      if (order.date_to.getTime() === today.getTime()) {
        completed_orders.push(order.id);
      }
    }

    //if order period started today change status from suspended to ongoing
    if (order.date_from) {
      order.date_from.setHours(0, 0, 0, 0);
      if (order.status == 3 && order.date_from.getTime() === today.getTime()) {
        ongoing_orders.push(order.id);
      }
    }
  }

  await changeStatus(completed_orders, 2);
  await changeStatus(ongoing_orders, 1);
  return;
}

function changeStatus(ids, status) {
  return db.sequelize.transaction(async (t) => {
    await db.order.update(
      {
        status: status
      },
      {
        where: {
          id: {
            [Op.in]: ids
          }
        },
        transaction: t
      }
    );
  });
}

export default {
  time,
  description,
  run
};
