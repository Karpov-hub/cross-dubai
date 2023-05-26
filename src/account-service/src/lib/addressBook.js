import db from "@lib/db";
import uuid from "uuid/v4";
import Queue from "@lib/queue";

async function _getActiveMerchantsByWalletId(wallet_id) {
  const merchants = await db.org_cryptowallet.findAll({
    where: {
      wallet_id
    },
    attributes: ["org_id"],
    raw: true
  });

  return merchants || [];
}

async function _getMerchants(user_id) {
  const merchants = await db.merchant.findAll({
    where: {
      user_id
    },
    attributes: ["id", "name"],
    raw: true
  });

  return merchants || [];
}

async function getAddressBook(data, realm, user) {
  let cryptoWallets = await db.crypto_wallet.findAndCountAll({
    where: { user_id: user, removed: 0 },
    attributes: ["id", "num", "name", "status", "send_via_chain_required"],
    offset: data.start || 0,
    limit: data.limit || null,
    order: [["status", "DESC"]],
    raw: true
  });

  if (data.currency && cryptoWallets.rows && cryptoWallets.rows.length) {
    const allAddresses = cryptoWallets.rows.map((item) => item.num);
    const validAddresses = await _getAddressesByCurrency(
      allAddresses,
      data.currency
    );

    cryptoWallets.rows = cryptoWallets.rows.filter((item) =>
      validAddresses.includes(item.num)
    );
  }

  return { list: cryptoWallets.rows, count: cryptoWallets.count };
}

async function getWalletDataFromAddressBook(data, realm, user) {
  const wallet = await db.crypto_wallet.findOne({
    where: { id: data.wallet_id },
    attributes: ["id", "num", "name", "status", "send_via_chain_required"],
    raw: true
  });

  const merchants = await _getMerchants(user);

  const activeMerchants = await _getActiveMerchantsByWalletId(data.wallet_id);

  merchants.forEach((merchant) => {
    for (const org of activeMerchants) {
      if (merchant.id === org.org_id) {
        merchant.activeWallet = true;
      }
    }
  });

  return { ...wallet, merchants };
}

async function upsertWalletAddressBook(data, realm, user) {
  data.num = data.num.trim();
  data.wallet_id = data.wallet_id || uuid();

  await db.crypto_wallet.upsert({
    id: data.wallet_id,
    num: data.num,
    name: data.name,
    status: data.status,
    send_via_chain_required: data.send_via_chain_required,
    user_id: data.user_id || user
  });

  await _updateOrgWallets(data);

  return { success: true };
}

async function _updateOrgWallets(data) {
  await db.org_cryptowallet.destroy({
    where: {
      wallet_id: data.wallet_id
    }
  });

  if (!data.walletAccess || !data.walletAccess.length) {
    return;
  }

  const orgWallets = [];

  for (const wallet of data.walletAccess) {
    orgWallets.push({
      wallet_id: data.wallet_id,
      org_id: wallet,
      ctime: new Date()
    });
  }

  await db.org_cryptowallet.bulkCreate(orgWallets);

  return;
}

async function _getAddressesByCurrency(addresses, currency) {
  const { result } = await Queue.newJob("ccoin-service", {
    method: "getValidAddressesForCurrency",
    data: {
      currency,
      addresses
    }
  });

  return result;
}

async function deleteWalletFromAddressBook(data, realm, user) {
  try {
    await db.sequelize.transaction(async (t) => {
      await db.crypto_wallet.update(
        {
          removed: 1,
          status: 0
        },
        {
          where: {
            id: data.wallet_id,
            user_id: user
          },
          transaction: t
        }
      );
      await db.org_cryptowallet.destroy({
        where: { wallet_id: data.wallet_id },
        transaction: t
      });
    });
  } catch (error) {
    throw "ERROR_WHILE_REMOVE_CRYPTO_WALLET";
  }

  return { success: true };
}

export default {
  getAddressBook,
  getWalletDataFromAddressBook,
  upsertWalletAddressBook,
  deleteWalletFromAddressBook
};
