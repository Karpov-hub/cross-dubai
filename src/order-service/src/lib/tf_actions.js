import db from "@lib/db";
import Queue from "@lib/queue";

async function validateCryptoAddress(variables, currencies) {
  let crypto_currencies = await db.currency.findAll({
    where: {
      crypto: true,
      abbr: currencies
    },
    attributes: ["abbr"],
    raw: true
  });
  let currencies_array = [],
    result = {};
  for (let currency of crypto_currencies) {
    let crypto_currency = currencies.find((el) => {
      el == currency.abbr;
    });
    if (crypto_currency) {
      currencies_array.push(crypto_currency);
      result[crypto_currency] = null;
    }
  }

  for (let currency of currencies_array) {
    let addresses = [];
    for (let variable of variables)
      if (
        variable.key.includes(`${currency}_ADDR`) ||
        variable.key.includes(`EXTERNAL_${currency}`)
      )
        addresses.push(variable.value);
    if (addresses.length)
      result[currency] = await Queue.newJob("ccoin-service", {
        method: "validateAddresses",
        data: {
          addresses,
          currency
        }
      });
  }
  for (let currency of currencies_array)
    if (!result[currency].result.valid) return false;
  return true;
}

async function updateOrderAdditionalData(order_id, field, value) {
  let { additional_data } = await db.non_ad_order.findOne({
    where: { id: order_id },
    attributes: ["additional_data"],
    raw: true
  });
  additional_data[`${field}_transfer_id`] = value;
  await db.non_ad_order.update(
    {
      additional_data
    },
    { where: { id: order_id } }
  );
  return true;
}

async function approveTransfer(data, realm, user) {
  let transfer = await db.not_sent_plan_transfer.findOne({
    where: {
      id: data.transfer_id
    },
    raw: true
  });
  if (!transfer) throw "TRANSFERNOTFOUND";
  if (transfer.approver) throw "TRANSFERALREADYAPPROVED";
  let request = {
    merchant_id: transfer.merchant_id,
    amount: transfer.amount,
    plan_id: transfer.plan_id,
    ref_id: transfer.ref_id,
    tariff: transfer.tariff,
    variables:
      transfer.variables && transfer.variables._arr
        ? transfer.variables._arr
        : transfer.variables,
    description: transfer.description,
    order_id: transfer.ref_id
  };

  if (
    !(await validateCryptoAddress(transfer.variables, [
      transfer.currency,
      transfer.result_currency
    ]))
  )
    throw "ADDRESSESARENOTVALID";

  let { result } = await Queue.newJob("account-service", {
    method: "paymentByPlan",
    data: request,
    realmId: realm,
    userId: user
  }).catch((e) => {
    console.log(e);
    throw "ERRORSENDINGTRANSFER";
  });
  if (!result?.transfer?.id) return { success: false, field: data.field };
  await db.not_sent_plan_transfer.update(
    { approver: user, status: 1 },
    { where: { id: data.transfer_id } }
  );

  await updateOrderAdditionalData(
    transfer.ref_id,
    data.field,
    result.transfer.plan_transfer_id
  );

  return {
    success: true,
    field: data.field,
    transfer_id: result.transfer.plan_transfer_id
  };
}

async function rejectTransfer(data, realm, user) {
  const transfer = await db.not_sent_plan_transfer.findOne({
    where: {
      id: data.transfer_id
    },
    raw: true
  });

  if (!transfer) throw "TRANSFERNOTFOUND";
  if (transfer.approver) throw "TRANSFERALREADYAPPROVED";

  await updateOrderAdditionalData(transfer.ref_id, data.field, null);

  await db.not_sent_plan_transfer.destroy({
    where: { id: data.transfer_id }
  });

  await updateOrderStatus(transfer.ref_id);

  return { success: true, field: data.field };
}

async function updateOrderStatus(id) {
  const transferFields = {};

  const { additional_data } = await db.non_ad_order.findOne({
    where: { id: id },
    attributes: ["additional_data"],
    raw: true
  });

  for (const key of Object.keys(additional_data)) {
    if (/transfer_id/.test(key)) transferFields[key] = additional_data[key];
  }

  if (
    !Object.values(transferFields).some((el) => {
      return !!el;
    })
  ) {
    await db.non_ad_order.update({ status: 0 }, { where: { id } });
  }
}

export default {
  approveTransfer,
  rejectTransfer
};
