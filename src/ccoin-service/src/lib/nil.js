import db from "@lib/db";
import config from "@lib/config";
import Wallet from "./wallet";
import nil from "@lib/nil";
import Withdrawal from "./withdrawal";

const Op = db.Sequelize.Op;

async function calculateSourceAmounteByTransferId(transfer_id, acc_no) {
  const txs = await db.transaction.findAll({
    where: { transfer_id },
    attributes: ["acc_src", "amount", "txtype"],
    raw: true
  });
  let amount = 0;
  for (let tx of txs) {
    if (tx.txtype == "transfer" && tx.acc_src == acc_no) {
      amount += tx.amount;
    }
  }
  return amount;
}

async function order(data) {
  const amount =
    data.payment.tag == "exchange_crypto"
      ? parseFloat(data.payment.amount)
      : data.txAmount;

  const exchange = await nil.exchange(
    amount,
    data.planStep.to.currency,
    data.planStep.from.currency,
    data.payment.transfer.id,
    1,
    null
  );
  let sourceAmount = await calculateSourceAmounteByTransferId(
    data.payment.transfer.id,
    data.plan[0].acc_no
  );
  let amount_delta = sourceAmount - exchange.quantity * exchange.executed_price;
  let amount_extra = 0;
  let amount_back = 0;
  if (amount_delta < 0) {
    amount_extra = exchange.quantity - sourceAmount / exchange.executed_price;
  } else if (amount_delta > 0) {
    amount_back = amount_delta;
  }
  return {
    amount: exchange.quantity - amount_extra,
    amount_extra,
    amount_back,
    acc_first: data.plan[0].acc_no,
    currency_delta: data.planStep.from.currency,
    exchange,
    accept: true
  };
}

// читаем все трансферы на тот-же технический аккаунт, которые в режиме held
async function getDeferredTransfersBySKAccount(acc_no) {
  const transfers = await db.sequelize.query(
    `WITH updated AS (UPDATE transfers SET status=2 WHERE status=1 and held=true and event_name=:event_name and id in (SELECT transfer_id FROM transactions WHERE acc_dst=:acc_no) RETURNING id) SELECT * FROM transfers WHERE id in (SELECT id FROM updated)`,
    {
      replacements: { acc_no, event_name: "account-service:doPipe" },
      type: db.sequelize.QueryTypes.SELECT
    }
  );
  return transfers;
}

async function getAccountCurrency(acc_no) {
  const { currency } = await db.account.findOne({
    where: { acc_no },
    attributes: ["currency"],
    raw: true
  });
  return currency;
}

async function rollbackTxStatus(tx, withdrawal_id) {
  const ids = tx.map((a) => a.id);
  await db.transfer.update({ status: 1 }, { where: { id: { [Op.in]: ids } } });
  await db.withdrawal.destroy({
    where: {
      id: withdrawal_id
    },
    cascade: true
  });
  await db.withdrawal_transfer.destroy({
    where: {
      withdrawal_id: withdrawal_id
    },
    cascade: true
  });
}

async function nil2sk(data) {
  const deferredTransfers = await getDeferredTransfersBySKAccount(
    data.planStep.to.acc_no
  );
  let amount = 0;
  deferredTransfers.forEach((a) => {
    if (a.data && a.data.amount) amount += parseFloat(a.data.amount);
  });
  const currency = await getAccountCurrency(data.planStep.to.acc_no);
  const skAddress = await Wallet.getMasterAddress(currency);
  if (!skAddress) throw "SKADDRESSNOTFOUND";
  const withdrawal_id = await Withdrawal.saveDefirredPayments(
    deferredTransfers,
    amount,
    currency
  );

  //if (data.payment.prevData && data.payment.prevData.amount_extra)
  //  amount += data.payment.prevData.amount_extra;

  const res = await nil.withdrawal(amount, currency, skAddress);
  if (!res || res.errors) {
    await rollbackTxStatus(deferredTransfers, withdrawal_id);
    return { accept: false };
  }
  return {
    amount: data.txAmount,
    amount_extra: data.payment.prevData.amount_extra,
    amount_back: data.payment.prevData.amount_back,
    nilWithdrawal: res,
    accept: false
  };
}

async function sk2monitoring(data) {
  const skAddress = await Wallet.getMasterAddress(data.planStep.to.currency);
  if (!skAddress) throw "SKADDRESSNOTFOUND";
  const dataToSend = {
    txId: data.payment.transfer.id,
    address_from: skAddress,
    address_to: data.planStep.to.extra,
    currency: data.planStep.to.currency,
    amount: data.txAmount
  };
  const res = await Wallet.sendCustom(dataToSend);
  return { amount: data.txAmount, net: res, accept: false };
}

async function monitoring2external(data) {
  const dataToSend = {
    txId: data.payment.transfer.id,
    address_from: data.planStep.from.extra,
    address_to: data.planStep.to.extra,
    currency: data.planStep.to.currency,
    amount: data.txAmount
  };

  console.log("monitoring2external:", dataToSend);

  const res = await Wallet.sendCustom(dataToSend);
  return { amount: data.txAmount, net: res, accept: false };
}

function getVarValue(name, vars) {
  for (let v of vars) {
    if (v.key == name) return v.value;
  }
  return null;
}

async function nil2bank(data) {
  const amount = data.payment.amount;

  const currency = await getAccountCurrency(data.planStep.to.acc_no);
  const destBankAcc = getVarValue("NIL_BANK_ACCOUNT", data.payment.variables);

  if (!destBankAcc) throw "NIL_BANK_ACCOUNT_NOT_FOUND";

  let res = await nil.withdrawalToBank(amount, currency, destBankAcc);

  if (!res || res.errors) {
    return { errors: res.errors };
  }

  return {
    amount: amount,
    nilWithdrawal: res
  };
}

export default {
  order,
  nil2sk,
  sk2monitoring,
  monitoring2external,
  nil2bank
};
