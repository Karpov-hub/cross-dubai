import Callbacks from "./callbacks.js";
import Queue from "@lib/queue";
import db from "@lib/db";

async function acceptTx(transfer_id, realmId, amount) {
  const data = {
    ref_id: transfer_id,
    transfer_id,
    amount
  };

  if (amount) data.amount = amount;
  const { result } = await Queue.newJob("account-service", {
    method: "accept",
    data,
    realmId
  });
  return result;
}

async function provide(data) {
  const withdrawal = await Callbacks.getWithdrawalByAmount(
    data.amount,
    data.currencyId
  );

  let transfers;

  if (withdrawal) transfers = withdrawal.transfers;
  else if (data.requestId)
    transfers = await db.transfer.findAll({
      where: { id: data.requestId },
      raw: true
    });

  if (!transfers || !transfers.length) return;

  let counter = 0;
  for (let tx of transfers) {
    if (tx.plan_transfer_id) {
      // транзакции созданные через план счетов просто акцептуем
      await acceptTx(tx.id, tx.realm_id);
      //  и убираем из виздравала
      await db.withdrawal_transfer.destroy({
        where: {
          transfer_id: tx.id
        }
      });
      counter++;
    }
  }
  return {
    provided: counter,
    total: transfers.length,
    transfers: transfers ? transfers.map((t) => t.id) : [],
    cbData: data,
    workflow: "plan"
  };
}

async function onComplete(data, realm) {
  const transfer = await db.transfer.findOne({
    where: { id: data.requestId, held: true },
    attributes: ["data", "held"],
    raw: true
  });
  if (!transfer) throw "TRANSFERNOTFOUND";
  const res = await acceptTx(data.requestId, realm);
  if (res)
    await db.transfer.update(
      {
        data: {
          ...transfer.data,
          cbData: data
        }
      },
      { where: { id: data.requestId } }
    );
  return { cbData: data };
}

export default {
  provide,
  onComplete
};
