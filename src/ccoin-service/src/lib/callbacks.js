import db from "@lib/db";
import Wallet from "./wallet.js";
import MemStore from "@lib/memstore";
import axios from "axios";
import Queue from "@lib/queue";
import log from "./logs";
import Withdrawal from "./withdrawal.js";
import NewCallbacks from "./callbacks_new.js";

const CURRENCY_ALIAS = {
  TRX_USDT: "USTR"
};

async function saveTx(data) {
  const opt = {
    id: data.txId,
    currency_id: CURRENCY_ALIAS[data.currencyId] || data.currencyId,
    amount: data.amount,
    transfer_id: data.transfer_id || null,
    address: data.address,
    tag: data.tag,
    confirmations: data.confirmations,
    tx_status: data.txStatus,
    sign: data.sign,
    network_fee: data.networkFee,
    network_fee_currency_id: data.networkFeeCurrencyId,
    crypto_bot: data.crypto_bot,
    provided: false
  };

  if (data.test) return opt;

  let res;
  try {
    res = await db.cryptotx.create(opt);
  } catch (e) {
    try {
      log.push(data.transfer_id, "ERROR", `CRYPTOTXEXISTS ${data.txId}`, opt);
    } catch (error) {
      console.log("NOTRANSFERID");
    }
    throw "CRYPTOTXEXISTS";
  }
  return res ? res.toJSON() : null;
}

async function callCallback(data) {
  const key = data.address + "_" + data.txId;
  const callbackUrl = await MemStore.get("clbk" + key);
  if (callbackUrl) {
    const res = await axios.get(callbackUrl);
    if (res) {
      await MemStore.del("clbk" + key);
    }
  }
}

async function getTechAccountByRealmId(realm_id, currency, type) {
  const res = await db.realmaccount.findOne({
    where: { realm_id, type },
    include: [
      {
        model: db.account,
        attributes: ["acc_no"],
        where: { currency }
      }
    ]
  });
  return res ? res.toJSON() : null;
}

async function provide(data, realm_id, userId, transactions, hooks) {
  console.log("provide:", data);

  data.currencyId = CURRENCY_ALIAS[data.currencyId] || data.currencyId;

  data.amount_fee = data.networkFee;

  const tx = await saveTx(data);
  if (!tx) throw "TXALREADYPROVIDED";

  const newWithdrawalResult = await NewCallbacks.provide(
    data,
    realm_id,
    userId,
    transactions,
    hooks,
    tx
  );

  // Проверяем трансферы и проводим по новому алгоритму
  if (
    newWithdrawalResult &&
    newWithdrawalResult.provided == newWithdrawalResult.total
  ) {
    await db.cryptotx.update(
      {
        provided: true
      },
      { where: { id: data.txId } }
    );
    //return newWithdrawalResult;
  }

  let provide_res, err;
  try {
    provide_res = await provide_do(
      data,
      realm_id,
      userId,
      transactions,
      hooks,
      tx
    );
  } catch (e) {
    err = e;
  }

  if (provide_res || newWithdrawalResult)
    return provide_res || newWithdrawalResult;
  throw err;
}

async function provide_do(data, realm_id, userId, transactions, hooks, tx) {
  const monitoringAccount = await getMonitoringAccount(data);

  if (monitoringAccount) {
    data.acc_monitor = monitoringAccount;
    data.action = "deposit";
    return await completeDeposit(data, realm_id, userId, transactions, hooks);
  }
  data.action = "withdrawal";

  let result = {};

  const account = await Wallet.getAccountByAddress(tx.address, tx.currency_id);

  if (!account) {
    const providedTransfers = await sendFromSkToMonitoringWallet(tx, realm_id);
    if (!providedTransfers || !providedTransfers.length)
      throw "ACCOUNTNOTFOUND";

    await db.cryptotx.update(
      {
        provided: true
      },
      { where: { id: data.txId } }
    );

    result.transfers = providedTransfers;
    //data.amount_fee += networkFees;
  }

  if (account) {
    const techAccount = await getTechAccountByRealmId(
      realm_id,
      tx.currency_id,
      1
    );
    if (!techAccount) throw "THEREISNTTECHACCOUNT";

    result = {
      owner: realm_id,
      acc_src: techAccount.account.acc_no,
      acc_dst: account.acc_no,
      amount: data.amount,
      currency: account.currency,
      crypto_tx: tx.id
    };

    if (!data.requestId) {
      let order = await getActiveOrderByAccount(account.acc_no);
      if (order) {
        data.requestId = order.id;
        data.ref_id = order.id;
        result.ref_id = order.id;
      }
    }
  }

  hooks.onTariffCompleted = (result, transfers, txQueries) => {
    if (txQueries && txQueries.list && txQueries.list.length) {
      txQueries.list.push({
        model: "cryptotx",
        action: "update",
        data: { provided: true },
        where: { id: tx.id }
      });
    }
  };

  hooks.beforeSendResult = async (result, transfer, list) => {
    await callCallback(data);
  };

  return result;
}

function compareAmounts(amount1, amount2) {
  const a = Math.abs(amount1 / amount2);
  return a >= 0.99 && a <= 1.01;
}

async function getWithdrawalByAmount(amount, currency) {
  const where = {
    currency: CURRENCY_ALIAS[currency] || currency,
    status: 1
  };

  const withdrawals = await db.withdrawal.findAll({
    where,
    order: [["ctime", "desc"]],
    raw: true
  });

  let withdrawal;
  for (let w of withdrawals) {
    if (compareAmounts(w.amount, amount)) {
      withdrawal = w;
      break;
    }
  }

  if (!withdrawal) return null;

  withdrawal.transfers = await getTranswersByWithdrawal(withdrawal.id);
  return withdrawal;
}

async function getTranswersByWithdrawal(withdrawal_id) {
  const recs = await db.sequelize.query(
    "select * from transfers where id in (SELECT transfer_id FROM withdrawal_transfers WHERE withdrawal_id = :withdrawal_id)",
    {
      replacements: { withdrawal_id },
      type: db.sequelize.QueryTypes.SELECT
    }
  );
  return recs;
}

async function sendFromSkToMonitoringWallet(data, realm) {
  const skAddress = await Wallet.getMasterAddress(data.currency_id);

  if (skAddress.toLowerCase() != data.address.toLowerCase()) return false;

  const withdrawal = await getWithdrawalByAmount(data.amount, data.currency_id);
  if (!withdrawal) throw "TRANSFERAMOUNTNOTFOUND";

  const ures = await db.cryptotx.update(
    { transfer_id: withdrawal.id },
    { where: { id: data.id } }
  );

  await db.withdrawal.update({ status: 2 }, { where: { id: withdrawal.id } });

  for (let transfer of withdrawal.transfers) {
    log.push(
      transfer.id,
      "WARNING",
      "Callback 1. Money is received on SK",
      data
    );
    await sendTransferFromSkToMonitoringWallet(transfer, data);
  }
  return withdrawal.transfers;
}

async function sendTransferFromSkToMonitoringWallet(transfer, data) {
  const monitoringAddress = await Wallet.getMonitoringAddressByMerchant(
    transfer.data.merchant,
    data.currency_id,
    transfer
  );

  const externalAddress = transfer.data.wallet;

  if (
    !(await Wallet.checkMerchantWallet(externalAddress, transfer.data.merchant))
  ) {
    log.push(
      transfer.id,
      "ERROR",
      `Invalid crypto address ${externalAddress}`,
      transfer
    );
    return null;
  }

  /*await Wallet.getExternalAddressByMerchant(
    transfer.data.merchant,
    data.currency_id
  );*/

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
      log.push(
        transfer.id,
        "ERROR",
        `There isn't monitoring address`,
        transfer
      );
      return null;
    }
    if (!externalAddress) {
      log.push(transfer.id, "ERROR", `There isn't external address`, transfer);
      return null;
    }
  }
  return null;
}

async function provideInnerTransfer(transfer, realmId) {
  await Queue.newJob("account-service", {
    method: "accept",
    data: {
      transfer_id: transfer.id,
      ref_id: ""
    },
    realmId
  });
}

async function checkCryptoExists(data) {
  const opt = {
    id: data.txId,
    currency_id: data.currencyId,
    amount: data.amount,
    transfer_id: data.transfer_id || null,
    address: data.address,
    tag: data.tag,
    confirmations: data.confirmations,
    tx_status: data.txStatus,
    sign: data.sign,
    network_fee: data.networkFee,
    network_fee_currency_id: data.networkFeeCurrencyId,
    crypto_bot: null,
    provided: true
  };

  try {
    await db.cryptotx.create(opt);
  } catch (e) {
    try {
      log.push(data.transfer_id, "ERROR", `CRYPTOTXEXISTS ${data.txId}`, opt);
    } catch (error) {
      console.log("NOTRANSFERID");
    }
    throw "CRYPTOTXEXISTS";
  }
}

async function complete(data, realm, userId, transactions, hooks) {
  console.log("complete:", data);
  data.currencyId = CURRENCY_ALIAS[data.currencyId] || data.currencyId;
  await checkCryptoExists(data);
  return await completeWithdrawal(data, realm, userId, transactions, hooks);
}

async function completeWithdrawal(data, realm, userId, transactions, hooks) {
  log.push(data.requestId, "WARNING", "Complete callback", data);

  //const tx = await saveTx(data);
  //if (!tx) throw "TXALREADYPROVIDED";

  const transfer = await db.transfer.findOne({
    where: { id: data.requestId },
    raw: true
  });

  if (!transfer) throw "CRYPTOTRANSFERNOTFOUND";
  if (data.info != "SendViaMixer" && transfer.status == 4)
    throw "TRANSFERALREADYPROVIDED";

  data.amount_fee = data.networkFee;
  data.currency_fee = data.networkFeeCurrencyId;
  data.ref_id = transfer.ref_id;
  data.merchant = transfer.data.merchant;

  await _getNetworkFeeAccount(data);

  hooks.onTariffCompleted = async (result, transfers, txQueries) => {
    if (txQueries && txQueries.list && txQueries.list.length) {
      txQueries.transfer.data.user_id = transfer.user_id;
      txQueries.list.push({
        model: "transfer",
        action: "increment",
        data: { status: 1 },
        where: { id: transfer.id }
      });

      txQueries.list.push({
        model: "cryptotx",
        action: "update",
        data: { transfer_id: transfer.id, provided: true },
        where: { id: data.txId }
      });
    }

    if (data.info == "SendViaMixer") {
      if (
        transfer.data.plan &&
        transfer.data.plan.to &&
        transfer.data.plan.to.extra == data.address
      ) {
        await provideInnerTransfer(transfer, realm);
      }
    } else if (
      transfer.status == 3 ||
      (transfer.status == 2 && data.info == "MasterToExternal")
    ) {
      if (data.info == "MasterToExternal")
        result.nil = await provideWithdrawal(data, transfer, realm);
      else await provideInnerTransfer(transfer, realm);
      //console.log("txQueries:", txQueries.list[0]);
    } else if (data.info == "SEND") await provideInnerTransfer(transfer, realm);
  };

  return { ...data, transfer };
}

async function _getNetworkFeeAccount(data) {
  if (!data.fromAddress) return;

  const account = await db.vw_client_accs.findOne({
    where: {
      crypto_address: data.fromAddress,
      currency:
        CURRENCY_ALIAS[data.networkFeeCurrencyId] || data.networkFeeCurrencyId
    },
    attributes: ["acc_no"],
    raw: true
  });

  if (account) {
    data.acc_fee_network = account.acc_no;
  }

  return;
}

async function getMonitoringAccount(data) {
  const skAddress = await Wallet.getMasterAddress(data.currencyId);
  if (
    data.address &&
    skAddress &&
    data.address.toLowerCase() == skAddress.toLowerCase()
  )
    return false;

  const monitoringAccount = await db.account_crypto.findOne({
    where: {
      address: data.address,
      abbr: CURRENCY_ALIAS[data.currencyId] || data.currencyId
    },
    attributes: ["acc_no"],
    raw: true
  });

  return monitoringAccount ? monitoringAccount.acc_no : false;
}

async function completeDeposit(data, realm, userId, transactions, hooks) {
  data.amount_fee = data.networkFee;
  data.currency_fee = data.networkFeeCurrencyId;
  if (!data.ref_id) {
    const order = await getActiveOrderByAccount(data.acc_monitor);
    // if (order) throw "ACTIVEORDERNOTFOUND";
    data.ref_id = order ? order.id : "0";
  }

  hooks.onTariffCompleted = async (result, transfers, txQueries) => {
    if (txQueries && txQueries.list && txQueries.list.length) {
      txQueries.list.push({
        model: "cryptotx",
        action: "update",
        data: { provided: true },
        where: { id: data.txId }
      });
    }

    result.tx = transfers.list;
  };
  return data;
}

async function getActiveOrderByAccount(acc_no) {
  const recs = await db.sequelize.query(
    "select o.* from orders o, vw_org_accounts a where a.acc_no=:acc_no and o.status=1 and o.organisation=a.org",
    {
      replacements: { acc_no },
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  return recs && recs[0] ? recs[0] : null;
}

async function provideWithdrawal(data, transfer, realm) {
  const isCryptoCur = await isCrypto(data.currencyId);
  if (isCryptoCur) return await Withdrawal.cryptoAmount(data, transfer, realm);
  return await Withdrawal.fiatAmount(data, transfer, realm);
}

async function isCrypto(currency) {
  const cur = await db.currency.findOne({
    where: { abbr: currency },
    attribute: ["crypto"],
    raw: true
  });
  return cur.crypto;
}

async function masterWalletBalance(data, realm) {
  if (data.hide_label) {
    await MemStore.del("mwbclbk");
    return {};
  }

  if (data.getClbk) {
    let res = await MemStore.get("mwbclbk");
    res = JSON.parse(res);

    if (!res) return {};

    if (res.availableBalance < res.requireBalance)
      return {
        message: `${res.walletType} Wallet ${res.currencyId} ${res.txType} [${res.availableBalance}] is lower than ${res.requireBalance}`
      };
  }

  if (data.txType == "BALANCE")
    await MemStore.set("mwbclbk", JSON.stringify(data));
  return { success: true };
}

async function resendCallback(data, realm) {
  let api = await Wallet.getApiByAbbr(data.currency);
  if (!api) throw "CRYPTOAPINOTFOUND";

  let res;
  try {
    res = await Wallet.sendGetRequest(
      api,
      `tx/getReceiveCallback/${data.hash_id}`
    );
  } catch (e) {
    console.log("e:", e);
    log.push(null, "ERROR", "Resend callback. Invalid Hash ID", {}, data);
    throw "CRYPTOREQUESTERROR";
  }

  if (res && res.data && res.data.result && res.data.result.status != "FAILED")
    log.push(null, "INFO", "Resend callback info", res.data, data);
  else
    log.push(null, "ERROR", "Resend callback info", res ? res.data : res, data);

  return;
}

export default {
  provide,
  complete,
  masterWalletBalance,
  completeDeposit,
  getWithdrawalByAmount,
  resendCallback
};
