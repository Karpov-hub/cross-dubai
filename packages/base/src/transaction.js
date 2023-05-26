import db from "@lib/db";
import uuid from "uuid/v4";

function transaction(data, hook, operation) {
  return db.sequelize.transaction(async t => {
    let transfer;
    if (data.transfer) {
      transfer = await db.transfer.createWF(data.transfer.data, {
        transaction: t
      });
    }

    const transfer_id = transfer ? transfer.get("id") : uuid();

    if (!!hook) {
      await hook(t, transfer_id);
    }

    if (!!operation) {
      await db.operation_processed.create(operation, { transaction: t });
    }

    if (data.list && data.list.length) {
      for (let transaction of data.list) {
        let opt = { transaction: t };
        if (transaction.data.transfer_id === "")
          transaction.data.transfer_id = transfer_id;
        if (transaction.where) opt.where = transaction.where;
        await db[transaction.model][transaction.action](transaction.data, opt);
      }
    }
    return transfer;
  });
}

export default {
  transaction
};
