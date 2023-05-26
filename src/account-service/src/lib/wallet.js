import db from "@lib/db";
import Queue from "@lib/queue";
import Account from "./account";
import uuid from "uuid/v4";

async function _checkAddressValidation(address, currency) {
  const { result } = await Queue.newJob("ccoin-service", {
    method: "validateAddress",
    data: { address, currency }
  });

  return result.valid;
}

async function _checkAddressMerchantLink(address, merchant) {
  const merchantAddress = await db.vw_accounts_with_gas.findOne({
    where: { address: address },
    attributes: ["id", "merchant_id"],
    raw: true
  });

  if (merchantAddress && merchantAddress.merchant_id != merchant) return false;

  return true;
}

async function _removeExistedWalletsByCurrencies(address, currencies) {
  const crypto_wallets = await db.account_crypto.findAll({
    where: { address, abbr: currencies },
    attributes: ["abbr"],
    raw: true
  });

  if (!crypto_wallets.length) {
    return currencies;
  }

  crypto_wallets = crypto_wallets.map((el) => el.abbr);

  for (const wallet of crypto_wallets) {
    currencies = currencies.filter((el) => el != wallet);
  }

  return currencies;
}

async function _getWalletsData(address, currencies) {
  const accounts = [];

  for (const currency of currencies) {
    accounts.push({ address, currency });
  }

  return await Queue.newJob("ccoin-service", {
    method: "getWalletsBalances",
    data: { accounts }
  });
}

async function _generateWalletAddressByInitCurrency(currency) {
  const wallet = await Queue.newJob("ccoin-service", {
    method: "generateAddress",
    data: { currency }
  });

  return wallet && wallet.result ? wallet.result : null;
}

async function _bindAccToMerchant(data) {
  await db.merchant_account.create({
    id_merchant: data.merchant,
    id_account: data.id,
    ctime: new Date()
  });

  return true;
}

async function _createUserMemo(memo, account, maker) {
  let ref_id = account.id;

  const bindedAcc = await db.account_crypto.findOne({
    where: { acc_no: account.acc_no },
    attributes: ["id"],
    raw: true
  });

  if (bindedAcc) {
    ref_id = bindedAcc.id;
  }

  await db.users_memo.create({
    ref_id,
    memo,
    maker
  });

  return true;
}

async function createWallet(data, realm, user) {
  data.currencies = [data.init_currency];

  switch (data.init_currency) {
    case "ETH": {
      data.currencies.push("USDT", "USDC");
      break;
    }
    case "TRX": {
      data.currencies.push("USTR");
      break;
    }
    default: {
      break;
    }
  }

  if (
    data.address &&
    !(await _checkAddressValidation(data.address, data.init_currency))
  ) {
    throw "ADDRESS_VALIDATION_ERROR";
  }

  if (
    data.address &&
    !(await _checkAddressMerchantLink(data.address, data.merchant_id))
  ) {
    throw "MERCHANT_ADDRESS_LINK_ERROR";
  }

  const merchant_data = await db.merchant.findOne({
    where: { id: data.merchant_id },
    attributes: ["name", "user_id"],
    raw: true
  });
  const user_data = await db.user.findOne({
    where: { id: merchant_data.user_id },
    attributes: ["realm"],
    raw: true
  });
  const currency_data = await db.currency.findOne({
    where: { abbr: data.init_currency },
    attributes: ["crypto"],
    raw: true
  });

  let crypto_wallets_data = null;
  let currencies = data.currencies;

  if (data.address) {
    currencies = await _removeExistedWalletsByCurrencies(
      data.address,
      data.currencies
    );
    if (!currencies.length) {
      return { success: true, count: 0 };
    }

    crypto_wallets_data = await _getWalletsData(data.address, currencies);
    if (crypto_wallets_data) {
      crypto_wallets_data = crypto_wallets_data.result;
    }
  }

  if (!data.address && currency_data.crypto) {
    data.address = await _generateWalletAddressByInitCurrency(
      data.init_currency
    );
  }

  const accounts = [];

  for (const currency of currencies) {
    const acc_data = {
      acc_name: merchant_data.name,
      currency,
      overdraft: -1,
      wallet_type: data.wallet_type
    };

    if (data.address) {
      acc_data.address = data.address;
    }

    const account = await Account.create(
      acc_data,
      user_data.realm,
      merchant_data.user_id
    );

    if (crypto_wallets_data) {
      const wallet_data = crypto_wallets_data.find((el) => {
        return el.currency == account.currency;
      });
      await db.account.update(
        { balance: wallet_data.crypto_wallet_balance },
        { where: { id: account.id } }
      );
      account.balance = wallet_data.crypto_wallet_balance;
    }

    await _bindAccToMerchant({
      merchant: data.merchant_id,
      id: account.id
    });

    if (data.user_memo) {
      await _createUserMemo(data.user_memo, account, data.maker || user);
    }

    accounts.push(account);
  }

  return { success: true, count: accounts.length, accounts };
}

async function editWalletMemo(data, realm, user) {
  const cryptoAccounts = await db.account_crypto.findAll({
    where: { address: data.address },
    attributes: ["id", "abbr"],
    raw: true
  });

  if (!cryptoAccounts.length) {
    throw "WALLET_NOT_FOUND";
  }

  let ref_id = cryptoAccounts[0].id;

  for (const ca of cryptoAccounts) {
    if (["ETH", "TRX"].includes(ca.abbr)) {
      ref_id = ca.id;
    }
  }

  const memo = await db.users_memo.findOne({ where: { ref_id, maker: user } });

  await db.users_memo.upsert({
    id: memo ? memo.id : uuid(),
    maker: user,
    ref_id: ref_id,
    memo: data.memo
  });

  return { success: true };
}

export default {
  createWallet,
  editWalletMemo
};
