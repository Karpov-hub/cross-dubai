import nil from "@lib/nil";

async function exchange(data) {
  let amount = parseFloat(data.txAmount);
  let rate = 1;
  let log = true;
  if (data && data.payment && data.payment.variables) {
    for (let item of data.payment.variables) {
      if (item.key == "EXCHANGE_RATE" && item.value) {
        rate = parseFloat(item.value);
        amount = amount / rate;
        log = false;
        break;
      }
    }
  }
  if (log) {
    const currency = getFromToCurrency(data.plan);
    if (currency) {
      rate = await nil.getExchangeRate(currency.from, currency.to);
    }
    if (!rate) rate = 1;
    amount = amount / rate;
  }
  return { amount, rate };
}

function getFromToCurrency(plan) {
  for (let i = 0; i < plan.length; i++) {
    if (plan[i].method == "account-service/doExchange") {
      return { from: plan[i].currency, to: plan[i].currency };
    }
  }
  return null;
}

export default {
  exchange
};
