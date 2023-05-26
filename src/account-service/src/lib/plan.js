import db from "@lib/db";
import Queue from "@lib/queue";

async function startPipeline(data, realmId) {
  await incrementPlanWeight(data);

  const plan = await db.accounts_plan.findOne({
    where: { id: data.plan_id },
    attributes: ["id", "name", "description", "items"],
    raw: true
  });

  if (!plan) throw "PLANNOTFOUND";

  const items = await compileItems(
    plan.items,
    data.merchant_id,
    data.tariff,
    data.variables
  );

  if (items && items._arr && items._arr[0] && items._arr[0].method) {
    const firstMethodResult = await runFirstMethod(items._arr[0].method, {
      data,
      plan,
      items
    });
    if (firstMethodResult && firstMethodResult.result == "Error") {
      return firstMethodResult;
    }
  }

  let plan_transfer_object = {
    plan_id: plan.id,
    tariff: data.tariff,
    variables: data.variables,
    items,
    step: 0
  };
  let tPlan;
  if (data.plan_transfer_id) {
    await db.transfers_plan.update(plan_transfer_object, {
      where: { id: data.plan_transfer_id }
    });
  } else tPlan = await db.transfers_plan.create(plan_transfer_object);

  let userId;
  if (data.merchant_id) {
    userId = await getUserIdByMerchant(data.merchant_id);
  }

  let pipeline = data.plan_transfer_id
    ? data.plan_transfer_id
    : tPlan.get("id");

  const params = {
    method: "doPipe",
    data: {
      ref_id: data.ref_id,
      merchant_id: data.merchant_id,
      merchant: data.merchant_id,
      organisation_name: await getOrgNameByMerchant(data.merchant_id),
      pipeline,
      plan: {
        name: plan.name,
        description: plan.description
      },
      amount: data.amount,
      order_id: data.order_id
    },
    realmId,
    userId
  };

  const doPipeRes = await Queue.newJob("account-service", params);

  if (data.description && pipeline) {
    await updateTransferDescription(pipeline, data.description, data.origin);
  }

  return doPipeRes.error ? doPipeRes : doPipeRes.result;
}

async function getUserIdByMerchant(merchant_id) {
  const merch = await db.merchant.findOne({
    where: { id: merchant_id },
    attributes: ["user_id"],
    raw: true
  });
  return merch ? merch.user_id : null;
}
async function runFirstMethod(service_method, data) {
  const items = service_method.split(";");
  for (let item of items) {
    item = item.trim();
    const [service, method] = service_method.replace(":", "/").split("/");
    if (!service || !method) throw "METHODDEFINITIONERROR";
    const { result } = await Queue.newJob(service, {
      method,
      data
    });
    if (result && result.result == "Error") {
      return result;
    }
  }
}

async function incrementPlanWeight(data) {
  const [res] = await db.plans_weight.increment(
    { weight: +1 },
    {
      where: { plan_id: data.plan_id, merchant_id: data.merchant_id },
      returning: true,
      plain: true,
      raw: true
    }
  );
  if (res[1] == 0)
    await db.plans_weight.create({
      plan_id: data.plan_id,
      merchant_id: data.merchant_id,
      weight: 1
    });
}

async function getOrgNameByMerchant(merchant_id) {
  const res = await db.merchant.findOne({
    where: { id: merchant_id },
    attributes: ["name"],
    raw: true
  });
  return res ? res.name : "";
}

function replaceVar(param, vars) {
  const key = param.substr(1);
  if (vars[key]) return vars[key];
  return "";
}

async function compileItems(items, merchant_id, tariff, variables) {
  let vars = {};

  const merch = await db.merchant.findOne({
    where: { id: merchant_id },
    attributes: ["variables"],
    raw: true
  });
  if (merch.variables) {
    merch.variables._arr.forEach((variable) => {
      vars[variable.key] = variable.value;
    });
  }
  if (variables) {
    variables.forEach((variable) => {
      vars[variable.key] = variable.value;
    });
  }
  let resItems = { _arr: [] };
  for (let item of items._arr) {
    if (checkCondition(item.condition, vars)) {
      if (item.acc_no && item.acc_no.charAt(0) == "$")
        item.acc_no = replaceVar(item.acc_no, vars);
      if (item.extra && item.extra.charAt(0) == "$")
        item.extra = replaceVar(item.extra, vars);
      resItems._arr.push(item);
    }
  }
  return resItems;
}

function checkCondition(condition, vars) {
  if (!condition) return true;
  for (let v in vars) {
    let re = RegExp(`[$]{1}${v}`, "g");
    condition = condition.replace(re, `\`${vars[v]}\``);
  }
  let x;
  try {
    x = new Function(`return !!(${condition})`);
  } catch (e) {}
  return x ? x() : false;
}

async function updateMerchantTariff(merchant_id, tariff, variables) {
  await db.merchant.update(
    {
      tariff,
      variables: { _arr: variables }
    },
    {
      where: { id: merchant_id }
    }
  );
}

async function updateTransferDescription(id, description, origin = "admin") {
  await db.transfers_plan.update(
    {
      description: { [origin]: description }
    },
    {
      where: { id }
    }
  );
}

async function getPlanByPipeline(pipe_id) {
  const res = await db.transfers_plan.findOne({
    attributes: ["id"],
    where: { id: pipe_id },
    include: [
      {
        model: db.accounts_plan,
        attributes: ["name", "description"]
      }
    ],
    raw: true
  });

  return res
    ? {
        name: res["accounts_plan.name"],
        description: res["accounts_plan.description"]
      }
    : {};
}

async function callNextStep(data, amount, realmId) {
  const plan = await getPlanByPipeline(data.pipeline);

  let userId;
  if (data.merchant_id) {
    userId = await getUserIdByMerchant(data.merchant_id);
  }
  const { result, error } = await Queue.newJob("account-service", {
    method: "doPipe",
    data: {
      ref_id: data.ref_id,
      merchant_id: data.merchant_id,
      merchant: data.merchant_id,
      organisation_name: await getOrgNameByMerchant(data.merchant_id),
      pipeline: data.pipeline,
      plan: {
        name: plan.name,
        description: plan.description
      },
      amount: amount,
      src_data: data.src_data || {}
    },
    realmId,
    userId
  });
  if (error) throw error;
  return result;
}

function calculateAmount(transactions, acc_no) {
  let amount = 0;
  transactions.forEach((tx) => {
    if (tx.acc_dst == acc_no) amount += tx.exchange_amount;
    else if (tx.acc_src == acc_no) amount -= tx.amount;
  });
  return amount;
}

async function runStepMethod(
  service_method,
  planStep,
  data,
  txAmount,
  realmId,
  plan
) {
  const [service, method] = service_method.replace(":", "/").split("/");
  if (!service || !method) throw "METHODDEFINITIONERROR";
  const { result } = await Queue.newJob(service, {
    method,
    data: {
      payment: data,
      planStep,
      plan,
      txAmount
    },
    realmId
  });
  if (result) {
    return result;
  }
  return { amount: txAmount };
}

async function increseStep(id) {
  await db.transfers_plan.increment(
    {
      step: 1
    },
    {
      where: { id }
    }
  );
}

async function saveMethodDataToTransfer(transfer, data) {
  await db.transfer.update(
    {
      data: {
        ...transfer.data,
        netData: data
      }
    },
    {
      where: { id: transfer.id }
    }
  );
}

async function acceptTx(transfer_id, realmId) {
  const { result } = await Queue.newJob("account-service", {
    method: "accept",
    data: {
      ref_id: transfer_id,
      transfer_id
    },
    realmId
  });
  return result;
}

async function markPaymentAsFinished(id) {
  await db.transfers_plan.update(
    { status: 1 },
    {
      where: { id }
    }
  );
  return id;
}

async function doPipe(data, realm, user_id, transactions, hooks) {
  const pipeline = await db.transfers_plan.findOne({
    where: { id: data.pipeline },
    attributes: ["id", "plan_id", "step", "items", "variables", "prevdata"],
    raw: true
  });

  if (!pipeline) throw "PIPELINENOTFOUND";

  const plan = pipeline.items._arr;

  if (pipeline.step >= plan.length - 1) {
    await markPaymentAsFinished(data.pipeline);
    return { status: "PAYMENTFINISHED" };
  }

  const resData = {
    ref_id: data.ref_id,
    user_id,
    acc_src: plan[pipeline.step].acc_no,
    acc_dst: plan[pipeline.step + 1].acc_no,
    amount: data.amount,
    currency: plan[pipeline.step + 1].currency,
    tag: plan[pipeline.step + 1].tag,
    step: pipeline.step,
    extra: plan[pipeline.step + 1].extra,
    prevData: pipeline.prevdata || {},
    variables: pipeline.variables,
    plan,
    sender_data: await prepareTransferParticipantData(plan[pipeline.step]),
    receiver_data: await prepareTransferParticipantData(plan[pipeline.step + 1])
  };

  hooks.onTariffCompleted = async (result, transfers, txQueries) => {
    if (txQueries && txQueries.list) {
      txQueries.transfer.data.plan_transfer_id = pipeline.id;
      txQueries.transfer.data.description = plan[pipeline.step + 1].descript;
      txQueries.transfer.data.data.plan = {
        from: plan[pipeline.step],
        to: plan[pipeline.step + 1]
      };
    }
  };

  hooks.beforeSendResult = async (result, transfer, transactions) => {
    if (!transfer) return true;
    result.transfer = {
      ...transfer.toJSON(),
      transactions
    };
    let amount = calculateAmount(transactions, resData.acc_dst);

    let doAccept = false;
    if (plan[pipeline.step + 1].method) {
      const outData = await runStepMethod(
        plan[pipeline.step + 1].method,
        {
          from: plan[pipeline.step],
          to: plan[pipeline.step + 1]
        },
        resData,
        amount,
        realm,
        plan
      );

      await db.transfers_plan.update(
        { prevdata: outData },
        { where: { id: pipeline.id } }
      );

      doAccept = !!outData.accept;

      if (outData) {
        if (outData.amount) amount = outData.amount;
        await saveMethodDataToTransfer(transfer.toJSON(), outData);
      }
    }

    if (!transfer.get("held")) {
      await increseStep(pipeline.id);
      callNextStep(data, amount, realm);
    } else if (doAccept) {
      acceptTx(transfer.get("id"), transfer.get("realm_id"));
    }
  };

  return resData;
}

async function prepareTransferParticipantData(plan_item) {
  let data = {
    wallet_data: { id: null, address: null, currency: null, acc_no: null },
    acc_data: { id: null, acc_no: null, owner: null, currency: null },
    user_data: { id: null, email: null, phone: null, legalname: null },
    merchant_data: { id: null, name: null }
  };

  if (plan_item.extra && plan_item.currency) {
    data.wallet_data = (await db.account_crypto.findOne({
      where: {
        address: plan_item.extra,
        abbr: plan_item.currency
      },
      attributes: ["id", "address", ["abbr", "currency"], "acc_no"],
      raw: true
    })) || { id: null, address: null, currency: null, acc_no: null };
    if (data.wallet_data.acc_no) {
      data.acc_data = (await db.account.findOne({
        where: {
          acc_no: data.wallet_data.acc_no
        },
        attributes: ["id", "acc_no", "owner", "currency"],
        raw: true
      })) || { id: null, acc_no: null, owner: null, currency: null };
    }
  }
  if (plan_item.acc_no && (!data.acc_data || !data.acc_data.id)) {
    data.acc_data = (await db.account.findOne({
      where: {
        acc_no: plan_item.acc_no,
        currency: plan_item.currency
      },
      attributes: ["id", "acc_no", "owner", "currency"],
      raw: true
    })) || { id: null, acc_no: null, owner: null, currency: null };
  }
  if (data.acc_data && data.acc_data.owner) {
    data.user_data = (await db.user.findOne({
      where: {
        id: data.acc_data.owner
      },
      attributes: ["id", "email", "phone", "legalname"],
      raw: true
    })) || { id: null, email: null, phone: null, legalname: null };
    if (data.acc_data.id) {
      data.merchant_data = (await db.merchant_account.findOne({
        where: {
          id_account: data.acc_data.id
        },
        attributes: [["id_merchant", "id"]],
        raw: true
      })) || { id: null };
      data.merchant_data = {
        ...data.merchant_data,
        ...((await db.merchant.findOne({
          where: {
            id: data.merchant_data.id
          },
          attributes: ["name"],
          raw: true
        })) || { name: null })
      };
    }
  }
  return { ...data };
}

async function onTransferAccept(data, transfer, acceptResult, realm_id) {
  if (!transfer.data.pipeline) return;

  const where = { id: transfer.data.pipeline };

  const pipeline = await db.transfers_plan.findOne({
    where,
    attributes: ["id", "plan_id", "step", "items"],
    raw: true
  });

  if (!pipeline) throw "PIPELINENOTFOUND";

  const plan = pipeline.items._arr;

  if (pipeline.step >= plan.length - 1) return { status: "PAYMENTFINISHED" };

  const transactions = await db.transaction.findAll({
    where: { transfer_id: transfer.id },
    raw: true
  });

  let amount = data.amount ? parseFloat(data.amount) : 0;

  if (!amount || isNaN(amount))
    amount = calculateAmount(transactions, plan[pipeline.step + 1].acc_no);

  await increseStep(pipeline.id);
  callNextStep(
    { ...transfer.data, ref_id: transfer.ref_id, src_data: { ...data } },
    amount,
    realm_id
  );
}

async function resumeTransfer(data) {
  return await callNextStep({ ...data }, data.amount, data.realm_id).catch(
    (e) => {
      throw e;
    }
  );
}

export default {
  startPipeline,
  doPipe,
  onTransferAccept,
  acceptTx,
  resumeTransfer
};
