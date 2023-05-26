import db from "@lib/db";
import Queue from "@lib/queue";
import config from "@lib/config";
import nil from "@lib/nil";
import Wallet from "./wallet";
import axios from "axios";
import sha256 from "sha256";
import log from "./logs";

const Op = db.Sequelize.Op;

function sign(data) {
  return sha256(
    data.requestId +
      data.currencyId +
      data.amount +
      data.address +
      data.tag +
      config.cryptoMasterKey
  );
}

async function getApiByCurrencyAbbr(abbr) {
  const { api } = await db.currency.findOne({
    where: { abbr },
    attributes: ["api"]
  });
  return api;
}

async function sentPayment(data, transfer, list) {
  const sendData = {
    requestId: transfer.get("id"),
    address: data.to,
    tag: null,
    currencyId: data.currency,
    amount: 0,
    fee: 0,
    sign: "",
    note: data.description
  };

  list.forEach((item) => {
    if (item.txtype == "transfer") {
      sendData.amount += item.amount;
    } else if (item.txtype == "netfee") {
      sendData.fee += item.amount;
    }
  });

  if (sendData.amount) {
    sendData.sign = sign(sendData);
    const apiUrl = await getApiByCurrencyAbbr(data.currency);
    if (apiUrl) {
      //console.log("sendData:", sendData);
      const res = await axios.post(`${apiUrl}send`, sendData);
      if (res) {
        return true;
      }
    }
  }

  //console.log("data:", data);
  //console.log("transfer:", transfer);
  //console.log("list:", list);
  //console.log("sendData:", sendData);
  return false;
}

function calculateAmount(tx) {
  let amount = {
    amount: 0,
    currency_from: "",
    currency_to: ""
  };
  let acc_dst;

  tx.forEach((t) => {
    if (t.txtype == "transfer") {
      acc_dst = t.acc_dst;
      amount.amount += t.exchange_amount;
      amount.currency_to = t.exchange_currency;
      amount.currency_from = t.currency;
      amount.rate = t.exchange_amount / t.amount;
    }
  });
  tx.forEach((t) => {
    if (t.acc_src == acc_dst) {
      amount.amount -= t.amount;
    }
  });
  return amount;
}

async function getDeferredPayments(currency) {
  const recs = await db.sequelize.query(
    "select * from transfers where deferred=true and data->>'to_currency'=:currency and id not in (SELECT transfer_id FROM withdrawal_transfers)",
    {
      replacements: { currency },
      type: db.sequelize.QueryTypes.SELECT
    }
  );
  return recs.map((item) => {
    return {
      id: item.id,
      amount: item.data.finAmount
    };
  });
}

async function saveDefirredPayments(recs, amount, currency) {
  const withdrawal = await db.withdrawal.create({
    currency,
    amount,
    status: 1
  });
  for (let item of recs) {
    await db.withdrawal_transfer.create({
      withdrawal_id: withdrawal.get("id"),
      transfer_id: item.id,
      currency,
      amount: item.amount
    });
  }
  return withdrawal.get("id");
}

async function groupWithdrawal(txId, amount, currency) {
  const defired_payments = await getDeferredPayments(currency);
  defired_payments.push({
    id: txId,
    amount
  });

  let resultAmount = 0;
  defired_payments.forEach((d) => {
    resultAmount += d.amount;
  });
  const withdrawal_id = await saveDefirredPayments(
    defired_payments,
    resultAmount,
    currency
  );
  return { amount: resultAmount, withdrawal_id };
}

async function markAsDeferred(withdrawal_id) {
  await db.sequelize.query(
    "UPDATE transfers SET deferred=true WHERE id in (SELECT transfer_id FROM withdrawal_transfers WHERE withdrawal_id=:withdrawal_id)",
    {
      replacements: { withdrawal_id },
      type: db.sequelize.QueryTypes.UPDATE
    }
  );
  await db.withdrawal.destroy({ where: { id: withdrawal_id }, cascade: true });
  await db.withdrawal_transfer.destroy({
    where: { withdrawal_id },
    cascade: true
  });
}

async function getCurrencyByAcc(acc_no) {
  const { currency } = await db.account.findOne({
    where: { acc_no },
    attributes: ["currency"]
  });
  return currency;
}

async function send(data, realm_id, userId, transactions, hooks) {
  data.owner = userId;
  data.currency = await getCurrencyByAcc(data.acc_no);
  hooks.beforeSendResult = async (result, transfer, list) => {
    const amount = calculateAmount(data.tx);
    result.nil = await nilWithdrawal(data, realm_id, amount);
    if (result.nil.errors) {
      result.transfer.deferred = true;
    }
  };
  return data;
}

async function sendFromSk(data) {
  const transfer = data.transfer;
  const monitoringAddress = await Wallet.getMonitoringAddressByMerchant(
    transfer.data.merchant,
    data.to_currency,
    transfer
  );
  const externalAddress = await Wallet.getExternalAddressByMerchant(
    transfer.data.merchant,
    data.to_currency
  );
  if (monitoringAddress && externalAddress) {
    await Wallet.sendCryptoPayment(
      transfer.data.finAmount,
      transfer.data.to_currency,
      transfer.data.to_currency == "USDT"
        ? monitoringAddress.toLowerCase()
        : monitoringAddress,
      transfer.data.to_currency == "USDT"
        ? externalAddress.toLowerCase()
        : externalAddress,
      transfer.id
    );

    return transfer;
  } else {
    if (!monitoringAddress) {
      log.push(transfer.id, "ERROR", "Send from SK: No monitoring address", {});
      throw "NOMONITORINGADDRESS";
    }
    if (!externalAddress) {
      log.push(transfer.id, "ERROR", "Send from SK: No external address", {});
      throw "NOEXTERNALADDRESS";
    }
  }
  return null;
}

async function getTransfersAndGroupByCurrency(txIds) {
  const recs = await db.sequelize.query(
    "select * from transfers where deferred=true and id in (:txIds) and id not in (SELECT transfer_id FROM withdrawal_transfers)",
    {
      replacements: { txIds },
      type: db.sequelize.QueryTypes.SELECT
    }
  );
  let out = {};
  for (let item of recs) {
    if (!out[item.data.to_currency]) out[item.data.to_currency] = [];
    out[item.data.to_currency].push({
      id: item.id,
      amount: item.data.finAmount
    });
  }
  return out;
}

async function provideDeferredGroup(defired_payments, currency) {
  let resultAmount = 0;
  defired_payments.forEach((d) => {
    resultAmount += d.amount;
  });
  const withdrawal_id = await saveDefirredPayments(
    defired_payments,
    resultAmount,
    currency
  );
  const skAddress = await Wallet.getMasterAddress(currency);
  const res = await nil.withdrawal(resultAmount, currency, skAddress);
  if (res && res.errors && res.errors.length) {
    await markAsDeferred(withdrawal_id);
  }
  return res && res.withdrawal_id ? defired_payments.length : 0;
}

async function provideDeferred(data) {
  let provided = 0;
  const groupedTransfers = await getTransfersAndGroupByCurrency(data.txIds);
  for (let currency of Object.keys(groupedTransfers)) {
    provided += await provideDeferredGroup(
      groupedTransfers[currency],
      currency
    );
  }
  return { provided };
}

async function sendFromMonitoringToNilViaSk(data, realm, user) {
  const monitoringAddress = await Wallet.getMonitoringAddressByAccount(
    data.acc_no
  );
  if (!monitoringAddress) {
    log.push(data.transfer.id, "ERROR", "Monitoring address not found", {
      acc_no: data.acc_no
    });
    throw "MONITORINGADDRESSNOTFOUND";
  }
  const providerAddress = await Wallet.getProviderAddressByCurrency(
    data.currency
  );
  if (!providerAddress) {
    log.push(data.transfer.id, "ERROR", "Provider address not found", {
      currency: data.currency
    });
    throw "PROVIDERADDRESSNOTFOUND";
  }
  const amounts = calculateAmounts(data);

  const requestData = {
    requestId: data.transfer.id,
    fromAddress: monitoringAddress,
    toAddress: providerAddress,
    currencyId: data.currency,
    amount: amounts.amount,
    systemFee: amounts.system_fee
  };

  const wRes = await Wallet.sendToProviderViaWallet(requestData);
  return wRes;
}

function calculateAmounts(data) {
  const result = {
    amount: data.amount,
    system_fee:
      data.transfer.data.amount -
      data.transfer.data.finAmount / data.transfer.data.custom_exchange_rate
  };

  return result;
}

async function fiatAmount(data, transfer, realm) {
  // Send email to admin

  Queue.newJob("mail-service", {
    method: "send",
    data: {
      lang: "EN",
      code: "fiat-withdrawal",
      body: {
        data,
        transfer
      }
    },
    realmId: realm_id
  });

  return { result: "Message was sent to admin" };
}



async function nilWithdrawal(data, realm_id, amount) {
  let res = {};

  log.push(data.transfer.id, "DEBUG", "Calculate withdrawal amount", amount);

  const exchange_res = await nil.exchange(
    amount.amount,
    amount.currency_to,
    amount.currency_from,
    data.transfer.id,
    1 / data.custom_exchange_rate,
    data.valid_until
  );

  log.push(
    data.transfer.id,
    exchange_res.errors && exchange_res.errors.length ? "ERROR" : "WARNING",
    "NIL exchange result",
    exchange_res,
    {
      amount: amount.amount,
      currency_to: amount.currency_to,
      currency_from: amount.currency_from,
      transfer_id: data.transfer.id,
      price: 1 / data.custom_exchange_rate,
      valid_until: data.valid_until
    }
  );

  if (exchange_res.errors && exchange_res.errors.length) {
    throw "CRYPTOEXCHANGEFAULT";
  }

  if (exchange_res && !data.deferred_transfer) {
    const skAddress = await Wallet.getMasterAddress(data.to_currency);

    log.push(
      data.transfer.id,
      skAddress ? "WARNING" : "ERROR",
      "Getting SK address",
      { skAddress }
    );

    const withdrawal_group = await groupWithdrawal(
      data.transfer.id,
      amount.amount,
      data.to_currency
    );

    const amountToSend = withdrawal_group.amount;

    res = await nil.withdrawal(amountToSend, data.to_currency, skAddress);

    if (res.errors && res.errors.length) {
      await markAsDeferred(withdrawal_group.withdrawal_id);
    }

    log.push(
      data.transfer.id,
      res.errors && res.errors.length ? "ERROR" : "WARNING",
      "NIL withdrawal result",
      res,
      {
        amount: amount.amount,
        to_currency: data.to_currency,
        skAddress: skAddress
      }
    );
    if (res.errors && res.errors.length) {
      //  throw "CRYPTOEXCHANGEFAULT";
    }
  }
  //}
  return res;
}

async function cryptoAmount(data, transfer, realm) {
  // do crypto payment

  const nilData = { ...transfer.data, transfer };

  return await nilWithdrawal(nilData, realm, {
    amount: nilData.finAmount,
    currency_to: nilData.to_currency,
    currency_from: nilData.currency
  });
}

export default {
  send,
  calculateAmount,
  sendFromSk,
  provideDeferred,
  sendFromMonitoringToNilViaSk,
  fiatAmount,
  cryptoAmount,
  saveDefirredPayments
};
