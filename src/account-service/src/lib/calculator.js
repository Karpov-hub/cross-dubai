import db from "@lib/db";
import nil from "@lib/nil";

function getSysFeeFromArr(arr) {
  for (let item of arr) {
    if (item.key == "SYS_FEES") {
      return parseFloat(item.value);
    }
  }

  return;
}

async function getSysFee(merchant_id) {
  let out;
  let tariff;
  let res = await db.merchant.findOne({
    where: { id: merchant_id },
    attributes: ["user_id", "variables", "tariff"],
    raw: true
  });
  if (!res) throw "MERCHANTNOTFOUND";
  tariff = res.tariff;
  if (res.variables && res.variables._arr)
    out = getSysFeeFromArr(res.variables._arr);
  if (out) return out;

  res = await db.user.findOne({
    where: { id: res.user_id },
    attributes: ["realm", "variables", "tariff"],
    raw: true
  });
  if (!res) throw "USERNOTFOUND";
  if (!tariff) tariff = res.tariff;
  if (res.variables && res.variables._arr)
    out = getSysFeeFromArr(res.variables._arr);
  if (out) return out;

  res = await db.realm.findOne({
    where: { id: res.realm },
    attributes: ["variables", "tariff"],
    raw: true
  });
  if (!res) throw "REALMNOTFOUND";
  if (!tariff) tariff = res.tariff;
  if (res.variables && res.variables._arr)
    out = getSysFeeFromArr(res.variables._arr);

  if (out) return out;
  res = await db.tariffplan.findOne({
    where: { id: tariff },
    attributes: ["variables", "tariffs"],
    raw: true
  });
  if (!res) throw "TARIFFNOTFOUND";

  if (res.variables && res.variables._arr)
    out = getSysFeeFromArr(res.variables._arr);
  if (out) return out;

  res = await db.tariff.findAll({
    where: { id: res.tariffs._arr },
    attributes: ["variables"],
    raw: true
  });

  for (let item of res) {
    if (item.variables && item.variables._arr)
      out = getSysFeeFromArr(item.variables._arr);
    if (out) return out;
  }

  return out;
}

async function getExchangeRate(data) {
  const price = await nil.getExchangeRate(
    data.currency_from,
    data.currency_to,
    data.amount
  );
  return { price };
}

async function calculateResultAmount(
  amount,
  currency_from,
  currency_to,
  fee,
  rate
) {
  let fees = (amount * fee) / 100;
  if (!rate) {
    const { price } = await getExchangeRate({
      currency_from,
      currency_to,
      amount
    });
    rate = price;
  }
  return {
    source: amount,
    netto: amount - fees,
    result: (amount - fees) / rate,
    fees,
    rate
  };
}

async function calculateSourceAmount(
  amount,
  currency_from,
  currency_to,
  fee,
  rate
) {
  let brutto = (100 * amount) / (100 - fee);
  if (!rate) {
    const { price } = await getExchangeRate({
      currency_from,
      currency_to,
      brutto
    });
    rate = price;
  }
  let source = amount * rate;
  let fees = (fee * source) / (100 - fee);
  return {
    source: source + fees,
    netto: source,
    result: amount,
    fees,
    rate
  };
}

async function calculateAmount(data) {
  const sys_fee = await getSysFee(data.merchant_id);
  if (data.amount_from) {
    return await calculateResultAmount(
      parseFloat(data.amount_from),
      data.currency_from,
      data.currency_to,
      sys_fee,
      data.rate
    );
  } else {
    return await calculateSourceAmount(
      parseFloat(data.amount_to),
      data.currency_from,
      data.currency_to,
      sys_fee,
      data.rate
    );
  }
}

export default {
  calculateAmount
};
