import db from "@lib/db";
import Queue from "@lib/queue";
import MemStore from "@lib/memstore";

const Op = db.Sequelize.Op;

/**
 *
 * @param {
 *   merchant_id: '18e16935-0ca9-4dcb-a0d5-fb2c4da53add',
     ref_id: '2',
     amount: 100,
     currency: 'USD',
     callback: '/demo'
    }
 */
async function deposit(data, realm) {
  const cryptoAddress = await getAddressByMerchantId(data.merchant_id);
  if (!cryptoAddress) throw "CRYPTOADDRESSNOTFOUND";
  const amount = await exchangeCalculate(
    data.amount,
    data.currency,
    cryptoAddress.abbr,
    realm,
    data.merchant_id
  );

  if (!amount) throw "CRYPTOEXCHANGEERROR";

  await savePendingInfo({
    address: cryptoAddress.address,
    ref_id: data.ref_id,
    callback: data.callback
  });

  return {
    amount,
    currency: cryptoAddress.abbr,
    address: cryptoAddress.address
  };
}

async function savePendingInfo(data) {
  const key = data.address + "_" + data.ref_id;
  await MemStore.set("clbk" + key, data.callback, 3600);
}

async function getAddressByMerchantId(merchant_id) {
  const { acc_no } = await db.vw_merchants.findOne({
    where: { id: merchant_id },
    attributes: ["acc_no"]
  });
  if (acc_no) {
    const res = await db.account_crypto.findOne({
      where: { acc_no: { [Op.in]: acc_no } },
      attributes: ["address", "abbr"]
    });
    return res.toJSON();
  }
  return null;
}

async function getUserByMerchantId(merchant_id) {
  const { user_id } = await db.merchant.findOne({
    where: { id: merchant_id }
  });
  return user_id;
}

async function exchangeCalculate(
  amount,
  currency_src,
  currency_dst,
  realmId,
  merchant_id
) {
  const userId = await getUserByMerchantId(merchant_id);
  const opt = {
    method: "exchange",
    data: {
      amount,
      currency_src,
      currency_dst
    },
    realmId,
    userId
  };
  const { result } = await Queue.newJob("account-service", opt);
  return result ? result.amount : null;
}

export default {
  deposit
};
