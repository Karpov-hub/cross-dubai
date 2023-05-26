import db from "@lib/db";
import Queue from "@lib/queue";
import config from "@lib/config";
import { expect } from "chai";
import RuleFunctions from "./ruleFunctions";
import vm from "vm";

let Views = {};

async function calculate(data, realmId, userId) {
  const tariffs = await readTariffByTriggerRealmUser(
    data.trigger,
    realmId,
    userId,
    data.data.merchant,
    data.data.order_id
  );
  let output = {};
  let transactions = [];
  let tags = [];
  for (const tariff of tariffs) {
    let bultData = await buildDataByTariffConfig(data, tariff.data.__conf);
    let res = await doTariffActions(bultData, tariff, realmId, data.variables);
    if (res.tx && res.tx.length) {
      transactions = transactions.concat(res.tx);
    }
    if (res.tags && res.tags.length) {
      tags = tags.concat(
        res.tags.map((t) => {
          return { entity: t.entity, tag: t.tag };
        })
      );
    }
    if (bultData.output) {
      Object.keys(bultData.output).forEach((key) => {
        output[key] = bultData.output[key];
      });
    }
  }

  return { transactions, tags, output };
}

async function buildDataByTariffConfig(data, config) {
  const outData = data;

  if (!config) return outData;
  for (const key in config) {
    outData[key] = await getExtraObjectsByConfigItem(outData, config[key]);
  }
  return outData;
}

async function getExtraObjectsByConfigItem(data, configItem) {
  const keys = getValueByKeyString(data, configItem.keyfield);
  const operator =
    Object.prototype.toString.call(keys) === "[object Array]" ? "in" : "=";

  if (!Views[configItem.collection]) throw "ERRORINTARIFF";

  const sql = `SELECT w.* FROM (${Views[configItem.collection]}) w WHERE w.${
    configItem.field
  } ${operator} :keys`;
  const res = await db.sequelize.query(sql, {
    replacements: {
      keys
    },
    type: db.sequelize.QueryTypes.SELECT
  });
  return res;
}

function getValueByKeyString(data, keystring) {
  if (!keystring) {
    return null;
  }
  const keys = keystring.split(":");
  let out = data;
  for (let i = 1; i < keys.length; i++) {
    if (i == keys.length - 1 && !/^[0-9]{1,}$/.test(keys[i])) {
      return out[keys[i]] || null;
    }
    switch (Object.prototype.toString.call(out[keys[i]])) {
      case "[object Object]":
        out = out[keys[i]];
        break;
      case "[object Array]": {
        return getValuesFromArray(out[keys[i]], keys[i + 1], keys[i + 2]);
      }
      case "[object String]": {
        return out[keys[i]];
      }
      case "[object Number]": {
        return out[keys[i]];
      }
    }
  }
  return null;
}

function getValuesFromArray(arr, key, index) {
  if (index !== undefined) index = parseInt(index);
  let out = [];

  for (const item of arr) {
    if (Object.prototype.toString.call(item) === "[object Object]") {
      out.push(item[key]);
    }
  }

  if (index !== undefined && !isNaN(index)) {
    return out[index];
  }
  return out;
}

async function getPlanByMerchant(id) {
  const res = await db.merchant.findOne({
    where: { id },
    attributes: ["tariff"],
    raw: true
  });
  return res && res.tariff ? res.tariff : null;
}
async function getPlanByUser(id) {
  const res = await db.user.findOne({
    where: { id },
    attributes: ["tariff"],
    raw: true
  });
  return res && res.tariff ? res.tariff : null;
}
async function getPlanByContract(contract_id) {
  const res = await db.contract.findOne({
    where: { id: contract_id },
    attributes: ["tariff"],
    raw: true
  });

  return res && res.tariff ? res.tariff : null;
}

function _isUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str
  );
}

async function getContractByOrder(order_id) {
  if (!_isUUID(order_id)) return null;

  const order = await db.order.findOne({
    where: { id: order_id },
    attributes: ["contract_id"],
    raw: true
  });

  return order && order.contract_id ? order.contract_id : null;
}

async function readTariffByTriggerRealmUser(
  trigger,
  realmId,
  userId,
  merchant,
  orderId
) {
  const triggerPaths = trigger.split(":");

  const replacements = {
    realmId,
    userId,
    service: triggerPaths[0],
    method: triggerPaths[1]
  };

  let planId;
  if (orderId) {
    const contract_id = await getContractByOrder(orderId);
    if (contract_id) {
      planId = await getPlanByContract(contract_id);
      replacements.contract = contract_id;
    }
  }

  if (merchant) {
    replacements.merchant = merchant;
  }
  if (merchant && !planId) {
    planId = await getPlanByMerchant(merchant);
  }

  if (userId && !planId) {
    planId = await getPlanByUser(userId);
  }
  replacements.planId = planId;

  const sql = `SELECT
  t.name,
  t.data,
  t.variables,
  t.actions,
  t.rules,
  t.id,
  t.name,
  p.variables as plan_variables,
  p.id as plan_id,
  p.name as plan_name,
  ${replacements.contract ? "c.variables as contract_variables," : ""}
  ${merchant ? "m.variables as merch_variables," : ""}
  ${userId ? "u.variables as user_variables," : ""}
  r.variables as realm_variables
FROM
  tariffs t,
  (
    select
      id,
      variables,
      name,
      json_array_elements_text(tariffs->'_arr') tariff
    from tariffplans
  ) p,
  ${replacements.contract ? `contracts c,` : ""}
  ${merchant ? "merchants m," : ""}
  ${userId ? "users u," : ""}
  realms r

WHERE
  ${planId ? "p.id = :planId and " : ""}
  ${replacements.contract ? "c.id = :contract and " : ""}
  ${merchant ? "m.id = :merchant and " : ""}
  ${userId ? "u.id = :userId and " : ""}
  ${!planId && realmId ? "r.id = :realmId and r.tariff=p.id and " : ""}
  t.trigger in (SELECT id FROM triggers WHERE service = :service and method = :method) and
  p.tariff=t.id::text`;

  let tariffs;
  try {
    tariffs = await db.sequelize.query(sql, {
      replacements,
      type: db.sequelize.QueryTypes.SELECT
    });
  } catch (e) {
    console.log("e:", e);
  }
  let out = {};

  tariffs.forEach((tariff) => {
    out[tariff.id] = tariff;
  });

  return Object.keys(out).map((key) => out[key]);
}

async function doTariffActions(data, tariff, realmId, requestVariables) {
  const variables = getVariables(tariff, requestVariables);
  let transactions = [];

  if (!tariff.rules || !tariff.rules._arr || !tariff.rules._arr.length)
    return null;
  for (const rule of tariff.rules._arr) {
    let res = await checkRule(data, rule, variables);
    if (res.status) {
      if (res.actions && res.actions.length) {
        transactions = transactions.concat(
          doActions(data, res.actions, tariff.actions._arr, variables, realmId)
        );
      }
      if (res.stop) {
        return completeTransactions(transactions, tariff);
      }
    }
  }
  return completeTransactions(transactions, tariff);
}

function completeTransactions(transactions, tariff) {
  let tags = [];
  let tx = [];

  transactions.forEach((transaction) => {
    if (transaction.type == "tx") {
      const r = {
        parent_id: transaction.parent_id,
        txtype: transaction.txtype,
        hold: transaction.hold,
        hidden: transaction.hidden || false,
        acc_src: transaction.acc_src,
        acc_dst: transaction.acc_dst,
        description_src: transaction.description_src,
        description_dst: transaction.description_dst,
        amount: transaction.fee,
        tariff: tariff.name,
        tariff_id: tariff.id,
        tariff_plan: tariff.plan_name,
        tariff_plan_id: tariff.plan_id
      };
      if (transaction.fee_acc_currency)
        r.amount_to_acc_currency = transaction.fee_acc_currency;
      tx.push(r);
    } else if (transaction.type == "tag") {
      tags.push(transaction);
    }
  });

  return { tx, tags };
}

function getValueByValueField(value_field, variables, data) {
  if (Array.isArray(value_field)) {
    return value_field.map((item) => {
      if (/^root:/.test(item)) return getValueByKeyString(data, item);
      return getValueFromString2(item, variables, data);
    });
  } else {
    return [getValueFromString2(value_field, variables, data)];
  }
}

async function checkRule(data, rule, variables) {
  const result = {
    status: true,
    actions: [],
    stop: false
  };
  let value;
  let vals = getValueByValueField(rule.value_field, variables, data);

  if (rule.render_function && !!RuleFunctions[rule.render_function]) {
    value = RuleFunctions[rule.render_function].apply(null, vals);
  } else {
    value = vals[0];
  }

  if (rule.custom_function) {
    if (await doCustomFunction(rule.custom_function, data, variables)) {
      result.status = true;
      result.result = rule.result;
      result.stop = rule.stop;
      result.actions = rule.action;
    } else {
      result.result = false;
      result.status = false;
      result.actions = rule.action;
    }
  } else if (
    doCompare(
      value,
      getValueFromString2(rule.value, variables, data),
      rule.operator,
      rule.ne
    )
  ) {
    result.status = true;
    result.result = rule.result;
    result.stop = rule.stop;
    result.actions = rule.action;
  } else {
    result.result = false;
    result.status = false;
  }

  return result;
}

function doCompare(value1, value2, operator, ne) {
  if (!value1 && !value2 && (!operator || operator == "=")) return true;
  if (value2 === undefined) return false;
  switch (operator) {
    case "=":
      return ne ? !(value1 == value2) : value1 == value2;
    case ">":
      return ne ? !(value1 > value2) : value1 > value2;
    case "<": {
      return ne ? !(value1 < value2) : value1 < value2;
    }
    case ">=":
      return ne ? !(value1 >= value2) : value1 >= value2;
    case "<=":
      return ne ? !(value1 <= value2) : value1 <= value2;
    case "empty": {
      return ne ? !!value1 : !value1;
    }
    case "regexp":
      return !!value2.test
        ? ne
          ? !value2.test(value1)
          : value2.test(value1)
        : false;
    case "in":
      return !!value2.includes
        ? ne
          ? !value2.includes(value1)
          : value2.includes(value1)
        : false;
  }
  return false;
}

function getValueFromString2(value, variables, data) {
  if (value === undefined) return null;

  let params = value.match(/root\:[a-z0-9:_]{5,}/gi);
  let out = value;

  if (params && params.length) {
    params.forEach((item) => {
      const v = getValueByKeyString(data, item);
      out = v ? out.replace(item, v) : v;
    });
  }
  if (/^root\:[a-z0-9:_]{5,}$/i.test(value)) {
  } else out = getValueFromString(out, variables);

  return out;
}

function getValueFromString(value, variables) {
  let comand = [];
  if (variables) {
    Object.keys(variables).forEach((k) => {
      let v = variables[k];

      if (
        (typeof v === "string" || v instanceof String) &&
        (v === "" || (/[a-z]/i.test(v) && v.charAt(0) != "'"))
      )
        v = "'" + v + "'";
      comand.push(`const $${k} = ${v}`);
    });
  }

  if (value !== "") {
    comand.push("x = " + value + ";");
  }

  const commmandStr = comand.join(";\n");

  try {
    let x;
    eval(commmandStr);
    return x;
  } catch (e) {
    console.log("Tariff error (command):", commmandStr);
    console.log("Tariff error (msg):", e);
    throw "SOME_VAR_IS_BROKEN";
    // return undefined;
  }
}

function getActionsToRun(actionsNames, actions) {
  return actionsNames.map((name) => {
    for (let action of actions) {
      if (name == action.name) {
        return action;
      }
    }
    return;
  });
}

function doActions(data, actionsNames, actions, variables, realmId) {
  let out = [];

  const actionsToRun = getActionsToRun(actionsNames, actions);
  for (let action of actionsToRun) {
    if (action) {
      let tx = doOneAction(data, action, variables, realmId);
      if (tx) {
        out.push(tx);
      }
    }
  }
  return out;
}

function getAccNoByAction(data, accStr, variables) {
  if (/^root:/.test(accStr)) return getValueByKeyString(data, accStr);
  if (accStr.charAt(0) == "$") {
    let v = accStr.substr(1);
    if (!!variables[v]) return variables[v];
  }
  return accStr;
}

function calculatePercentFee(fee, amount) {
  if (!fee || !amount || isNaN(fee) || isNaN(amount)) return 0;
  return (fee * amount) / 100;
}

function doOneAction(data, action, variables, realmId) {
  switch (action.type) {
    case "transfer":
      return doActionTransfer(data, action.options, variables);
    case "message":
      return doActionMessage(data, action.options, variables, realmId);
    case "internal_message":
      return doActionInternalMessage(data, action.options, variables, realmId);
    case "tag":
      return doActionTag(data, action.options, variables);
    case "error":
      throw action.options.code;
  }
  return;
}

function doActionTag(data, action, variables) {
  const entity = action.entity
    ? getValueByKeyString(data, action.entity)
    : null;
  if (!entity) return;
  return {
    type: "tag",
    entity,
    tag: action.tag
  };
}

function doActionTransfer(data, action, variables) {
  const parent_id = action.parent_id
    ? getValueByKeyString(data, action.parent_id)
    : null;

  const acc_src = getAccNoByAction(data, action.acc_src, variables);
  const acc_dst = getAccNoByAction(data, action.acc_dst, variables);

  let fee = parseFloat(getValueFromString2(action.fee, variables, data));

  let fee_acc_currency;
  if (action.feetype != "ABS") {
    if (action.amount_field) {
      fee = calculatePercentFee(
        fee,
        parseFloat(getValueByKeyString(data, action.amount_field))
      );
    } else fee = 0;
  } else if (action.currency) {
    fee_acc_currency = action.currency == "src" ? acc_src : acc_dst;
  }

  return fee
    ? {
        type: "tx",
        txtype: action.txtype,
        hold: action.hold,
        hidden: action.hidden,
        parent_id,
        acc_src,
        acc_dst,
        description_src: action.description_src,
        description_dst: action.description_dst,
        fee,
        fee_acc_currency
      }
    : null;
}

function getVariables(tariff, requestVariables) {
  let out = {};
  const f = (vars) => {
    if (vars && vars._arr)
      for (let item of vars._arr)
        if (item.key !== undefined && item.key !== null) {
          out[item.key] = item.value;
        }
  };
  f(tariff.variables);
  f(tariff.plan_variables);
  f(tariff.realm_variables);
  f(tariff.user_variables);
  f(tariff.merch_variables);
  f(tariff.contract_variables);
  f({ _arr: requestVariables });

  return out;
}

function doActionMessage(data, action, variables, realmId) {
  if (data.data.test) return;

  let to = getValueByKeyString(data, action.to);
  if (/\$/.test(to)) to = getValueFromString(to, variables);

  const opt = {
    method: "sendNotificationToTheUser",
    data: {
      code: action.tpl,
      recipient: to,
      body: data
    },
    realmId
  };
  Queue.newJob("auth-service", opt);
}

async function getAdminRecipients(action) {
  if (action.to) return action.to.replace(/\s/g, "");

  let sql = "select email from admin_users";
  if (action.extra_params) sql += " where " + action.extra_params;
  let res;
  try {
    res = await db.sequelize.query(sql, {
      type: db.sequelize.QueryTypes.SELECT
    });
  } catch (e) {}
  if (!res || !res.length) return false;
  return res
    .map((el) => el.email)
    .filter((el) => !!el)
    .join(",");
}

async function doActionInternalMessage(data, action, variables, realmId) {
  if (data.data.test) return;
  let recipients = await getAdminRecipients(action);

  if (!recipients) return;
  const opt = {
    method: "send",
    data: {
      code: action.tpl,
      to: config.SYSTEM_NOTIFICATIONS_RECEIVER,
      bcc: recipients,
      body: data,
      lang: "en"
    },
    realmId
  };
  return Queue.newJob("mail-service", opt);
}

async function doCustomFunction(customCode, apiData, variables) {
  const context = {
    db,
    apiData,
    variables,
    result: false
  };
  vm.createContext(context);
  await vm.runInContext("(async () => {" + customCode + "})()", context);
  return context.result;
}

function viewsSet(data) {
  Views = data;
}

export default {
  getValueFromString,
  calculate,
  viewsSet
};
