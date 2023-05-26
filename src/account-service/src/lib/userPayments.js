import db from "@lib/db";
import Queue from "@lib/queue";
import planFunc from "./plan";
import transferFunc from "./transfer";
import config from "@lib/config";

async function _checkIfCurrencyInactive(currency) {
  const curr = await db.currency.findOne({
    where: { ui_active: true, abbr: currency },
    raw: true
  });
  return !!!curr;
}

async function initSendTransfer(data, realm, user) {
  if (await _checkIfCurrencyInactive(data.currency)) {
    throw "CURRENCY_NOT_AVAILABLE";
  }

  const { plan, account_data, merchant, order } = await getDataForTransfer(
    data.type || "send",
    data,
    user
  ).catch((e) => {
    throw e;
  });

  const variables = await prepareSendTransferVariables(
    plan.items,
    { acc_src: account_data.crypto_address, acc_dst: data.address_dst },
    data.currency
  );

  await Queue.newJob("account-service", {
    method: "paymentByPlan",
    data: {
      plan_id: plan.id,
      merchant_id: merchant.id_merchant,
      variables,
      amount: data.amount,
      description: data.description,
      ref_id: order.id,
      origin: "ui"
    },
    realmId: realm
  }).catch((e) => {
    console.log(
      "initSendTransfer API, account-service:startPipeline job error: ",
      e
    );
    throw typeof e == "string" ? e : "PAYMENTNOTPROVIDED";
  });

  return { success: true };
}

async function prepareSendTransferVariables(items, accounts, currency) {
  const variables = [];

  for (let item of items) {
    if (item.extra && item.extra.includes("$"))
      item.extra = item.extra.slice(1);
    if (
      item.extra &&
      (item.extra.includes(`FROM_${currency}`) ||
        item.extra.includes(`FROM_INNER_${currency}`))
    )
      variables.push({ key: item.extra, value: accounts.acc_src });
    if (
      item.extra &&
      (item.extra.includes(`TO_${currency}`) ||
        item.extra.includes(`TO_INNER_${currency}`))
    )
      variables.push({ key: item.extra, value: accounts.acc_dst });
  }

  return variables;
}

async function prepareSwapTransferVariables(items, accounts) {
  const variables = [];

  for (const currency of Object.keys(accounts)) {
    for (let item of items) {
      if (item.extra && item.extra.includes("$"))
        item.extra = item.extra.slice(1);
      if (item.acc_no && item.acc_no.includes("$"))
        item.acc_no = item.acc_no.slice(1);
      if (item.acc_no && item.acc_no.includes(`ACC_${currency}`))
        variables.push({ key: item.acc_no, value: accounts[currency].acc_no });
      if (
        item.extra &&
        (item.extra.includes(`ADDR_${currency}`) ||
          item.extra.includes(`TO_${currency}`))
      )
        variables.push({ key: item.extra, value: accounts[currency].address });
    }
  }

  return variables;
}

async function getDataForTransfer(type, data, user) {
  if (!data.currency && data.currency_src) {
    data.currency = data.currency_src;
  }

  let plan;

  switch (type) {
    case "send":
    case "inner transfer": {
      plan = await db.sequelize.query(
        `select ap.id, ap.items -> '_arr' items from accounts_plans ap,
        json_array_elements(ap.items -> '_arr') item
        where ap.description = :type and item ->> 'currency' = :currency
        group by ap.id`,
        {
          replacements: {
            currency: data.currency,
            type:
              data.type == "inner transfer" ? "innertransfer" : "manualtransfer"
          },
          raw: true,
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      const planMethod = data.viaChain
        ? "ccoin-service/sendViaChain"
        : "ccoin-service/monitoring2external";

      plan = plan.filter(
        (item) => item.items[item.items.length - 1].method == planMethod
      );

      break;
    }
    case "swap": {
      plan = await db.sequelize.query(
        `select ap.id, ap.items -> '_arr' items from accounts_plans ap,
        json_array_elements(ap.items -> '_arr') item
        where ap.description = 'swap'
        and ap.items -> '_arr' -> 0 ->> 'currency'::text = :currency_src
        and ap.items -> '_arr' -> (json_array_length(ap.items -> '_arr')-1) ->> 'currency'::text = :currency_dst
        group by ap.id`,
        {
          replacements: {
            currency_src: data.currency_src,
            currency_dst: data.currency_dst
          },
          raw: true,
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      break;
    }
    default:
      throw "TYPEOFTRANSFERNOTFOUND";
  }

  if (!plan || !plan.length) {
    throw "PLANNOTFOUND";
  }

  plan = plan[0];
  console.log(plan);
  const account_data = await db.vw_client_accs.findOne({
    where: {
      acc_no: data.acc_src,
      owner: user,
      currency: data.currency
    },
    attributes: ["id", "crypto_address"],
    raw: true
  });

  if (!account_data) {
    throw "SENDERACCOUNTNOTFOUND";
  }

  const merchant = await db.merchant_account.findOne({
    where: { id_account: account_data.id },
    attributes: ["id_merchant"],
    raw: true
  });

  const order = await db.order.findOne({
    where: {
      merchant: user,
      organisation: merchant.id_merchant,
      status: 1,
      removed: 0
    },
    attributes: ["id", "order_num"],
    raw: true
  });

  if (!order) {
    throw "ORDERNOTFOUND";
  }

  return { plan, account_data, merchant, order };
}

async function initSwapTransfer(data, realm, user) {
  if (await _checkIfCurrencyInactive(data.currency_src)) {
    throw "CURRENCY_NOT_AVAILABLE";
  }
  if (await _checkIfCurrencyInactive(data.currency_dst)) {
    throw "CURRENCY_NOT_AVAILABLE";
  }

  const { plan, merchant, order } = await getDataForTransfer(
    "swap",
    data,
    user
  ).catch((e) => {
    throw e;
  });

  const variables = await prepareSwapTransferVariables(plan.items, {
    [data.currency_src]: { acc_no: data.acc_src, address: data.address_src },
    [data.currency_dst]: { acc_no: data.acc_dst, address: data.address_dst }
  });

  await Queue.newJob("account-service", {
    method: "paymentByPlan",
    data: {
      plan_id: plan.id,
      merchant_id: merchant.id_merchant,
      variables,
      amount: data.amount,
      description: data.description,
      ref_id: order.id,
      origin: "ui"
    },
    realmId: realm
  }).catch((e) => {
    console.log(
      "initSwapTransfer API, account-service:startPipeline job error: ",
      e
    );
    throw typeof e == "string" ? e : "PAYMENTNOTPROVIDED";
  });

  return { success: true };
}

async function _getLastPlanTransferData(data) {
  const planTransfer = await db.transfer.findOne({
    where: {
      plan_transfer_id: data.plan_transfer_id,
      held: true,
      canceled: false
    },
    attributes: ["id", "data", "ref_id", "amount", "realm_id"],
    raw: true
  });

  if (!planTransfer) throw "TRANSFERNOTFOUND";

  return planTransfer;
}

async function resumePaymentByPlan(data, realm, user) {
  const planTransfer = await _getLastPlanTransferData(data);

  const currencySrc = planTransfer?.data?.plan?.from?.currency;
  const currencyDst = planTransfer?.data?.plan?.to?.currency;

  if (currencySrc) {
    if (await _checkIfCurrencyInactive(currencySrc)) {
      throw "CURRENCY_NOT_AVAILABLE";
    }
  }

  if (currencyDst) {
    if (await _checkIfCurrencyInactive(currencyDst)) {
      throw "CURRENCY_NOT_AVAILABLE";
    }
  }

  data.planTransfer = planTransfer;

  await cancelPaymentByPlan(data);

  const resumeTransferData = {
    pipeline: planTransfer.data.pipeline,
    ref_id: planTransfer.ref_id,
    merchant_id: planTransfer.data.merchant_id || planTransfer.data.merchant,
    amount: planTransfer.amount,
    realm_id: planTransfer.realm_id
  };

  return await planFunc.resumeTransfer(resumeTransferData);
}

async function cancelPaymentByPlan(data, realm, user) {
  const planTransfer =
    data.planTransfer || (await _getLastPlanTransferData(data));

  const cancelPaymentData = {
    ref_id: planTransfer.ref_id,
    transfer_id: planTransfer.id,
    plan_transfer_id: data.plan_transfer_id
  };

  return await transferFunc.rollback(cancelPaymentData, planTransfer.realm_id);
}

async function checkTransferViaChainAvailable(data, realm, user) {
  if (await _checkIfCurrencyInactive(data.currency)) {
    throw "CURRENCY_NOT_AVAILABLE";
  }

  let plan = await db.sequelize.query(
    `select ap.id, ap.items -> '_arr' items from accounts_plans ap,
    json_array_elements(ap.items -> '_arr') item
    where ap.description = :type and item ->> 'currency' = :currency
    group by ap.id`,
    {
      replacements: {
        currency: data.currency,
        type: data.type == "inner transfer" ? "innertransfer" : "manualtransfer"
      },
      raw: true,
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  plan = plan.filter(
    (item) =>
      item.items[item.items.length - 1].method == "ccoin-service/sendViaChain"
  );

  if (!plan || !plan.length) {
    return { success: false };
  }

  const out = { success: true };

  if (config.IS_TEST) {
    out.plan = plan;
  }

  return out;
}

export default {
  initSendTransfer,
  initSwapTransfer,
  resumePaymentByPlan,
  cancelPaymentByPlan,
  checkTransferViaChainAvailable
};
