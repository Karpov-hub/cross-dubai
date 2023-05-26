import account from "./account";
import db from "@lib/db";
import Queue from "@lib/queue";

async function refund(data, realm_id, userId, transactions, hooks) {
  const techAccount = await account.getTechAccountByRealmId(
    realm_id,
    data.currency,
    1
  );
  if (!techAccount) throw "THEREISNTTECHACCOUNT";

  const user_id = await account.checkAccountNoForRealm(data.acc_no, realm_id);
  if (!user_id) throw "THEREISNTUSERACCOUNT";

  const amount = parseFloat(data.amount);
  if (isNaN(amount)) throw "AMOUNTISNAN";

  if (!data.options) data.options = {};

  const transferData = {
    owner: user_id,
    ref_id: data.ref_id,
    transfer_type: "refund",
    acc_src: data.acc_no,
    acc_dst: techAccount.account.acc_no,
    amount,
    description: data.description,
    options: data.options || {}
  };

  let transfer_status = await db.transfer.update(
    { status: 5 },
    {
      where: { id: data.ref_id, realm_id }
    }
  );
  if (transfer_status.length == 0) throw "STATUSNOTUPDATED";

  hooks.beforeSendResult = (result, transfer) => {
    result.options.details = "Refund money";
    result.id = transfer ? transfer.get("id") : null;

    Queue.broadcastJob("call-admin", {
      model: db.transfer.adminModelName,
      method: "onChange",
      data: transfer
    });
  };
  return transferData;
}

export default {
  refund
};
