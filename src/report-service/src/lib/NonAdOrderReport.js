import db from "@lib/db";

function parseNumberValue(string_num) {
  if (typeof string_num != "string") return string_num;
  return Number(string_num.replace(",", "."));
}

async function getOrderAndTranchesData(order_id) {
  let order_data = await db.non_ad_order.findOne({
    where: { id: order_id },
    attributes: ["short_id", "additional_data"],
    raw: true
  });
  order_data = { ...order_data.additional_data, short_id: order_data.short_id };
  let tranches = await db.tranche.findAll({
    where: { ref_id: order_id },
    attributes: ["data"],
    raw: true
  });
  let settings = await db.settings.findAll({
    where: {
      key: [
        "report_erc_address",
        "report_trc_address",
        "report_erc_address_currency",
        "report_trc_address_currency"
      ]
    },
    attributes: ["key", "value"],
    raw: true
  });
  return { order_data, tranches, settings };
}
function changeCurrencyToUsdtIfUstr(currency) {
  if (!currency) return currency;
  return currency.toUpperCase() == "USTR" ? "USDT" : currency;
}
async function prepareCardsWithWithdrawalFiatReport(data) {
  let { order_data, tranches } = await getOrderAndTranchesData(data.order_id);
  let tranches_data = [];
  let total_result_tranche = 0,
    result_tranche = [],
    client_total_amount_brutto = 0,
    client_usdt = [];
  for (let { data: tranche } of tranches) {
    total_result_tranche += parseNumberValue(
      tranche.to_currency_amount_tranche
    );
    result_tranche.push(
      parseNumberValue(tranche.to_currency_amount_tranche).toFixed(2)
    );
    client_total_amount_brutto += parseNumberValue(
      tranche.client_amount_brutto_tranche
    );
    client_usdt.push(
      parseNumberValue(tranche.client_amount_brutto_tranche).toFixed(2)
    );
    tranches_data.push({
      amount: parseNumberValue(tranche.amount_tranche).toFixed(2),
      currency: changeCurrencyToUsdtIfUstr(tranche.amount_tranche_currency),
      from_currency: changeCurrencyToUsdtIfUstr(
        tranche.amount_tranche_currency
      ),
      rate: tranche.our_rate_tranche,
      result_tranche: parseNumberValue(
        tranche.to_currency_amount_tranche
      ).toFixed(2),
      to_currency: changeCurrencyToUsdtIfUstr(
        tranche.to_currency_amount_tranche_currency
      ),
      client_rate: tranche.client_rate_tranche,
      // delta: parseNumberValue(order_data.delta).toFixed(2),
      client_result_tranche: parseNumberValue(
        tranche.client_amount_brutto_tranche
      ).toFixed(2),
      rate_delta: tranche.rate_delta_tranche,
      delta_profit: parseNumberValue(tranche.rate_delta_profit_tranche).toFixed(
        2
      )
    });
  }

  let details_data = {
    commission: order_data.fee_percent,
    client_usdt: `${
      client_usdt.length > 1 ? client_usdt.join(" + ") + " = " : ""
    }${parseNumberValue(client_total_amount_brutto).toFixed(2)} * 0.${100 -
      order_data.fee_percent} = ${
      order_data.client_amount_netto
    } ${changeCurrencyToUsdtIfUstr(order_data.to_currency)} клиента`,
    usdt_profit_per_ruble: `${
      result_tranche.length > 1 ? result_tranche.join(" + ") + " = " : ""
    }${parseNumberValue(order_data.total_our_amount).toFixed(
      2
    )} - ${parseNumberValue(order_data.client_amount_netto).toFixed(2)} = ${(
      parseNumberValue(order_data.total_our_amount) -
      parseNumberValue(order_data.client_amount_netto)
    ).toFixed(2)} ${changeCurrencyToUsdtIfUstr(
      order_data.to_currency
    )} прибыль с ${changeCurrencyToUsdtIfUstr(order_data.from_currency)}`,

    intermediary_part: `${order_data.total_profit} / ${
      order_data.agent_part
    } = ${order_data.agent_fee} ${changeCurrencyToUsdtIfUstr(
      order_data.to_currency
    )} ${
      order_data.agent_currency != order_data.to_currency
        ? ` * ${order_data.agent_rate} = ${order_data.agent_amount} ${order_data.agent_currency}`
        : ""
    }`,

    our_net_profit: `${order_data.total_profit} - ${order_data.agent_fee} = ${
      order_data.our_profit
    } ${changeCurrencyToUsdtIfUstr(order_data.our_profit_currency)}`,
    client: `${
      order_data.client_payout_currency != order_data.to_currency
        ? `${
            order_data.total_conversion_amount_netto_profit
          } ${changeCurrencyToUsdtIfUstr(order_data.to_currency)}`
        : `${order_data.client_amount_netto} ${changeCurrencyToUsdtIfUstr(
            order_data.to_currency
          )}`
    } ${
      order_data.client_payout_currency != order_data.to_currency
        ? `(${order_data.client_payout} ${changeCurrencyToUsdtIfUstr(
            order_data.client_payout_currency
          )})`
        : ""
    }`,
    intermediary: `${order_data.agent_fee} ${changeCurrencyToUsdtIfUstr(
      order_data.to_currency
    )} ${
      order_data.agent_currency != order_data.to_currency
        ? `(${order_data.agent_amount} ${order_data.agent_currency})`
        : ""
    }`
  };
  if (
    changeCurrencyToUsdtIfUstr(order_data.client_payout_currency) !=
    changeCurrencyToUsdtIfUstr(order_data.to_currency)
  )
    details_data = {
      ...details_data,
      client_payout_currency: order_data.client_payout_currency,
      client_price_1: `${order_data.client_amount_netto} * ${order_data.our_rate} = ${order_data.our_rate_client_payout} ${order_data.client_payout_currency} наши`,
      client_price_2: `${order_data.client_amount_netto} * ${order_data.client_rate} = ${order_data.client_payout} ${order_data.client_payout_currency} клиента`,
      client_payout_delta: `${order_data.our_rate} - ${order_data.client_rate} = ${order_data.client_payout_rate_delta}`,
      delta_formula: `${order_data.our_rate_client_payout} - ${order_data.client_payout} = ${order_data.client_currency_conversion_profit_amount} ${order_data.client_payout_currency} / ${order_data.our_rate} = ${order_data.working_currency_conversion_profit_amount} ${order_data.to_currency}`,
      total_profit_formula: `${(
        parseNumberValue(order_data.total_our_amount) -
        parseNumberValue(order_data.client_amount_netto)
      ).toFixed(2)} + ${
        order_data.working_currency_conversion_profit_amount
      } = ${order_data.total_profit} ${order_data.to_currency}`
    };

  return {
    filename: `Order: Cards with withdrawal fiat - ${order_data.no ||
      new Date()}`,
    data: { tranches_data, ...details_data },
    ...data
  };
}

async function prepareCardsWithWithdrawalReport(data) {
  let { order_data, tranches } = await getOrderAndTranchesData(data.order_id);
  let tranches_data = [];
  let result_tranche = [],
    result_tranche_amount = 0,
    client_total_amount_brutto = 0,
    client_usdt = [],
    total_tranche_profit = 0;
  for (let { data: tranche } of tranches) {
    total_tranche_profit += parseNumberValue(tranche.total_tranche_profit);
    result_tranche_amount += parseNumberValue(
      tranche.client_amount_brutto_tranche
    );
    result_tranche.push(
      parseNumberValue(tranche.client_amount_brutto_tranche).toFixed(2)
    );
    client_total_amount_brutto += parseNumberValue(
      tranche.to_currency_amount_tranche
    );
    client_usdt.push(
      parseNumberValue(tranche.to_currency_amount_tranche).toFixed(2)
    );
    tranches_data.push({
      amount: tranche.amount_tranche,
      currency: changeCurrencyToUsdtIfUstr(tranche.amount_tranche_currency),
      from_currency: changeCurrencyToUsdtIfUstr(
        tranche.amount_tranche_currency
      ),
      rate: tranche.client_rate_tranche,
      result_tranche: tranche.client_amount_brutto_tranche,
      to_currency: changeCurrencyToUsdtIfUstr(
        tranche.to_currency_amount_tranche_currency
      ),
      client_rate: parseNumberValue(tranche.our_rate_tranche).toFixed(
        parseNumberValue(tranche.client_rate_tranche)
          .toString()
          .split(".")[1]?.length || 0
      ),
      // delta: tranche.delta,
      client_result_tranche: tranche.to_currency_amount_tranche,
      rate_delta: parseNumberValue(
        parseNumberValue(tranche.our_rate_tranche) -
          parseNumberValue(tranche.client_rate_tranche)
      ).toFixed(
        parseNumberValue(tranche.client_rate_tranche)
          .toString()
          .split(".")[1]?.length || 0
      ),
      delta_profit: parseNumberValue(tranche.rate_delta_profit_tranche).toFixed(
        2
      )
    });
  }
  let tranches_data_2 = [
    {
      commission: order_data.fee_percent,
      client_usdt: `${
        client_usdt.length > 1 ? client_usdt.join(" + ") + " = " : ""
      }${client_total_amount_brutto} * ${(100 - order_data.fee_percent) /
        100} = ${
        order_data.total_client_payout_amount
      } ${changeCurrencyToUsdtIfUstr(
        order_data.total_client_payout_amount_currency
      )} клиента`,

      usdt_profit_per_ruble: `${
        result_tranche.length > 1 ? result_tranche.join(" + ") + " = " : ""
      }${parseNumberValue(result_tranche_amount).toFixed(
        2
      )} - ${parseNumberValue(order_data.total_client_payout_amount).toFixed(
        2
      )} = ${total_tranche_profit} ${changeCurrencyToUsdtIfUstr(
        order_data.to_currency
      )} прибыль с ${changeCurrencyToUsdtIfUstr(order_data.from_currency)}`,

      intermediary_part: `${total_tranche_profit} / ${order_data.agent_part}`,
      agent_result: `${
        order_data.agent_fee_amount
      } ${changeCurrencyToUsdtIfUstr(order_data.agent_fee_amount_currency)}`,
      our_net_profit: `${total_tranche_profit} - ${
        order_data.agent_fee_amount
      } = ${order_data.our_profit_total} ${changeCurrencyToUsdtIfUstr(
        order_data.our_profit_total_currency
      )}`,
      client: `${
        order_data.total_client_payout_amount
      } ${changeCurrencyToUsdtIfUstr(
        order_data.total_client_payout_amount_currency
      )}`,
      intermediary: `${
        order_data.agent_fee_amount
      } ${changeCurrencyToUsdtIfUstr(order_data.agent_fee_amount_currency)}`
    }
  ];
  return {
    filename: `Order: Cards with withdrawal - ${order_data.no || new Date()}`,
    data: { tranches_data, tranches_data_2 },
    ...data
  };
}

async function prepareCryptoFiatWithRateReport(data) {
  let { order_data, settings } = await getOrderAndTranchesData(data.order_id);
  return {
    filename: `Order: Crypto-fiat with tariff delta - ${order_data.no ||
      new Date()}`,
    data: {
      amount: order_data.order_amount,
      amount_currency: changeCurrencyToUsdtIfUstr(order_data.from_currency),
      cross_course: order_data.cross_rate,
      client_rate: order_data.client_rate,
      rate_platform: order_data.our_rate,
      amount_expected_from_the_client: order_data.client_amount,
      amount_expected_from_the_client_currency: changeCurrencyToUsdtIfUstr(
        order_data.client_amount_currency
      ),
      amount_to_send: order_data.our_rate_amount,
      amount_to_send_currency: changeCurrencyToUsdtIfUstr(
        order_data.our_rate_amount_currency
      ),
      amount_after_cross_rate: order_data.cross_rate_amount,
      amount_after_cross_rate_currency: changeCurrencyToUsdtIfUstr(
        order_data.cross_rate_amount_currency
      ),
      transaction_profit: order_data.our_profit,
      transaction_profit_currency: changeCurrencyToUsdtIfUstr(
        order_data.our_profit_currency
      ),
      delivery_fee: order_data.delivery_fee,
      delivery_fee_currency: changeCurrencyToUsdtIfUstr(
        order_data.delivery_fee_currency
      ),
      delivery_fee_cross_rate: order_data.delivery_fee_cross_rate,
      delivery_fee_after_cross: order_data.delivery_fee_after_cross,
      delivery_fee_after_cross_currency: changeCurrencyToUsdtIfUstr(
        order_data.delivery_fee_after_cross_currency
      ),
      swap_fee: order_data.swap_fee,
      swap_fee_currency: changeCurrencyToUsdtIfUstr(
        order_data.swap_fee_currency
      ),
      amount_expected_from_the_client_before_charges:
        order_data.client_amount_before_charges,
      amount_to_send_before_charges: order_data.our_rate_amount_before_charges,
      client_action_type: order_data._client_action_type,
      which_percent_bigger: order_data._which_percent_bigger,
      address_data: [
        {
          address: order_data.report_trc_address || settings.report_trc_address,
          address_currency:
            order_data.report_trc_address_currency ||
            settings.report_trc_address_currency
        },
        {
          address: order_data.report_erc_address || settings.report_erc_address,
          address_currency:
            order_data.report_erc_address_currency ||
            settings.report_erc_address_currency
        }
      ]
    },
    ...data
  };
}

async function prepareCryptoFiatWithExchangeRateDeltaReport(data) {
  let { order_data, settings } = await getOrderAndTranchesData(data.order_id);
  return {
    filename: `Order: Crypto-fiat with exchange rate delta - ${order_data.no ||
      new Date()}`,
    data: {
      amount: order_data.order_amount,
      amount_currency: changeCurrencyToUsdtIfUstr(order_data.from_currency),
      client_exchange_rate: order_data.client_exchange_rate,
      our_exchange_rate: order_data.our_exchange_rate,
      amount_expected_from_the_client: order_data.client_amount,
      amount_expected_from_the_client_currency:
        order_data.client_amount_currency,
      amount_to_send: order_data.our_exchange_rate_amount,
      amount_to_send_currency: order_data.our_exchange_rate_amount_currency,
      transaction_profit: order_data.our_profit,
      transaction_profit_currency: changeCurrencyToUsdtIfUstr(
        order_data.our_profit_currency
      ),
      delivery_fee: order_data.delivery_fee,
      delivery_fee_currency: changeCurrencyToUsdtIfUstr(
        order_data.delivery_fee_currency
      ),
      delivery_fee_cross_rate: order_data.delivery_fee_cross_rate,
      delivery_fee_after_cross: order_data.delivery_fee_after_cross,
      delivery_fee_after_cross_currency: changeCurrencyToUsdtIfUstr(
        order_data.delivery_fee_after_cross_currency
      ),
      swap_fee: order_data.swap_fee,
      swap_fee_currency: changeCurrencyToUsdtIfUstr(
        order_data.swap_fee_currency
      ),
      amount_expected_from_the_client_before_charges:
        order_data.client_amount_before_charges,
      amount_to_send_before_charges:
        order_data.our_exchange_rate_amount_berfore_charges,
      address_data: [
        {
          address: order_data.report_trc_address || settings.report_trc_address,
          address_currency:
            order_data.report_trc_address_currency ||
            settings.report_trc_address_currency
        },
        {
          address: order_data.report_erc_address || settings.report_erc_address,
          address_currency:
            order_data.report_erc_address_currency ||
            settings.report_erc_address_currency
        }
      ]
    },
    ...data
  };
}

async function prepareFiatCryptoWithTariffDeltaReport(data) {
  let { order_data, settings } = await getOrderAndTranchesData(data.order_id);
  return {
    filename: `Order: Fiat-crypto with tariff delta - ${order_data.no ||
      new Date()}`,
    data: {
      order_amount: order_data.order_amount,
      from_currency: changeCurrencyToUsdtIfUstr(order_data.from_currency),
      client_rate: order_data.client_rate,
      our_rate: order_data.our_rate,
      decimal_client_rate: (100 - order_data.client_rate) / 100,
      client_amount: order_data.client_amount,
      client_amount_currency: changeCurrencyToUsdtIfUstr(
        order_data.client_amount_currency
      ),
      decimal_our_rate: (100 - order_data.our_rate) / 100,
      our_amount: order_data.our_rate_amount,
      our_amount_currency: changeCurrencyToUsdtIfUstr(
        order_data.our_rate_amount_currency
      ),
      our_netto_profit: order_data.our_netto_profit,
      our_netto_profit_currency: changeCurrencyToUsdtIfUstr(
        order_data.our_netto_profit_currency
      ),
      swap_fee: order_data.swap_fee,
      client_amount_before_charges: order_data.client_amount_before_charges,
      our_amount_before_charges: order_data.our_rate_amount_before_charges,
      swap_fee_currency: order_data.swap_fee_currency,
      address_data: [
        {
          address: order_data.report_trc_address || settings.report_trc_address,
          address_currency:
            order_data.report_trc_address_currency ||
            settings.report_trc_address_currency
        },
        {
          address: order_data.report_erc_address || settings.report_erc_address,
          address_currency:
            order_data.report_erc_address_currency ||
            settings.report_erc_address_currency
        }
      ]
    },
    ...data
  };
}

async function prepareFiatCryptoWithExchangeRateDeltaReport(data) {
  let { order_data, settings } = await getOrderAndTranchesData(data.order_id);
  return {
    filename: `Order: Fiat-crypto with exchange rate delta - ${order_data.no ||
      new Date()}`,
    data: {
      order_amount: order_data.order_amount,
      from_currency: changeCurrencyToUsdtIfUstr(order_data.from_currency),
      our_exchange_rate: order_data.our_exchange_rate,
      our_exchange_rate_amount: order_data.our_exchange_rate_amount,
      our_exchange_rate_amount_currency: changeCurrencyToUsdtIfUstr(
        order_data.our_exchange_rate_amount_currency
      ),
      client_exchange_rate: order_data.client_exchange_rate,
      client_amount: order_data.client_amount,
      client_amount_currency: changeCurrencyToUsdtIfUstr(
        order_data.client_amount_currency
      ),
      our_netto_profit: order_data.our_netto_profit,
      our_netto_profit_currency: changeCurrencyToUsdtIfUstr(
        order_data.our_netto_profit_currency
      ),
      swap_fee: order_data.swap_fee,
      swap_fee_currency: changeCurrencyToUsdtIfUstr(
        order_data.swap_fee_currency
      ),
      client_amount_before_charges: order_data.client_amount_before_charges,
      our_exchange_rate_amount_before_charges:
        order_data.our_exchange_rate_amount_before_charges,
      address_data: [
        {
          address: order_data.report_trc_address || settings.report_trc_address,
          address_currency:
            order_data.report_trc_address_currency ||
            settings.report_trc_address_currency
        },
        {
          address: order_data.report_erc_address || settings.report_erc_address,
          address_currency:
            order_data.report_erc_address_currency ||
            settings.report_erc_address_currency
        }
      ]
    },
    ...data
  };
}

async function prepareStartFinalAdminReport(data) {
  let { order_data, settings } = await getOrderAndTranchesData(data.order_id);

  let subtype = order_data._order_subtype;
  if (
    order_data._recalculation &&
    ["to_usdt_start", "from_usdt_final"].includes(subtype) &&
    ["from_usdt_start", "to_usdt_final"].includes(order_data._recalculation)
  )
    subtype = `${subtype}_${order_data._recalculation}`;
  return {
    filename: `Order: Start/Final (Admin) - ${order_data.no || new Date()}`,
    data: {
      short_id: order_data.short_id,
      amount: order_data.order_amount,
      subtype,
      cross_platform: order_data.cross_rate,
      cross_our: order_data.cross_rate,
      rate_pl: order_data.client_rate,
      rate_our: order_data.our_rate,
      delivery_cost_fiat: order_data.delivery_fee,
      delivery_cost_fiat_currency: changeCurrencyToUsdtIfUstr(
        order_data.delivery_fee_currency
      ),

      amount_from_client: order_data.amount_from_client,
      amount_to_client: order_data.amount_to_client,
      amount_from_platform: order_data.amount_from_platform,
      amount_to_platform: order_data.amount_to_platform,
      profit: order_data.our_profit,

      cross_platform_to_usdt: order_data.cross_rate, //to_usdt это обычный to_platform
      cross_our_to_usdt: order_data.cross_rate,
      rate_pl_to_usdt: order_data.client_rate,
      rate_our_to_usdt: order_data.our_rate,
      delivery_cost_fiat_to_usdt: order_data.delivery_fee,

      cross_platform_from_usdt: order_data.recalc_cross_rate, //from_usdt это recalc_amount
      cross_our_from_usdt: order_data.recalc_cross_rate,
      rate_pl_from_usdt: order_data.recalc_client_rate,
      rate_our_from_usdt: order_data.recalc_our_rate,
      delivery_cost_fiat_from_usdt: order_data.recalc_delivery_fee,

      recalc_amount_from_client: order_data.recalc_amount_from_client,
      recalc_amount_to_platform: order_data.recalc_amount_to_platform,
      recalc_from_platform: order_data.recalc_amount_from_platform,
      recalc_amount_to_client: order_data.recalc_amount_to_client,
      recalc_profit: order_data.recalc_our_profit,

      amount_from_client_currency: changeCurrencyToUsdtIfUstr(
        order_data.amount_from_client_currency
      ),
      amount_to_platform_currency: changeCurrencyToUsdtIfUstr(
        order_data.amount_to_platform_currency
      ),
      amount_to_client_currency: changeCurrencyToUsdtIfUstr(
        order_data.amount_to_client_currency
      ),
      amount_from_platform_currency: changeCurrencyToUsdtIfUstr(
        order_data.amount_from_platform_currency
      ),
      profit_currency: changeCurrencyToUsdtIfUstr(
        order_data.our_profit_currency
      ),

      recalc_amount_from_client_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_amount_from_client_currency
      ),
      recalc_amount_to_platform_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_amount_to_platform_currency
      ),
      recalc_from_platform_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_amount_from_platform_currency
      ),
      recalc_amount_to_client_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_amount_to_client_currency
      ),
      recalc_profit_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_our_profit_currency
      ),

      amount_currency: changeCurrencyToUsdtIfUstr(order_data.from_currency),
      netto_profit: order_data.our_netto_profit,
      netto_profit_currency: changeCurrencyToUsdtIfUstr(
        order_data.our_netto_profit_currency
      ),
      recalc_to_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_to_currency
      )
    },
    ...data
  };
}

async function prepareStartFinalClientReport(data) {
  let { order_data, settings } = await getOrderAndTranchesData(data.order_id);

  let subtype = order_data._order_subtype;
  if (
    order_data._recalculation &&
    ["to_usdt_start", "from_usdt_final"].includes(subtype) &&
    ["from_usdt_start", "to_usdt_final"].includes(order_data._recalculation)
  )
    subtype = `${subtype}_${order_data._recalculation}`;
  return {
    filename: `Order: Start/Final (Client) - ${order_data.no || new Date()}`,
    data: {
      short_id: order_data.short_id,
      amount: order_data.order_amount,
      subtype,
      cross_platform: order_data.cross_rate,
      cross_our: order_data.cross_rate,
      rate_pl: order_data.client_rate,
      rate_our: order_data.our_rate,
      delivery_cost_fiat: order_data.delivery_fee,
      delivery_cost_fiat_currency: changeCurrencyToUsdtIfUstr(
        order_data.delivery_fee_currency
      ),

      amount_from_client: order_data.amount_from_client,
      amount_to_client: order_data.amount_to_client,
      amount_from_platform: order_data.amount_from_platform,
      amount_to_platform: order_data.amount_to_platform,
      profit: order_data.our_profit,

      cross_platform_to_usdt: order_data.cross_rate, //to_usdt это обычный to_platform
      cross_our_to_usdt: order_data.cross_rate,
      rate_pl_to_usdt: order_data.client_rate,
      rate_our_to_usdt: order_data.our_rate,
      delivery_cost_fiat_to_usdt: order_data.delivery_fee,
      delivery_cost_fiat_to_usdt_currency: changeCurrencyToUsdtIfUstr(
        order_data.delivery_fee_currency
      ),

      cross_platform_from_usdt: order_data.recalc_cross_rate, //from_usdt это recalc_amount
      cross_our_from_usdt: order_data.recalc_cross_rate,
      rate_pl_from_usdt: order_data.recalc_client_rate,
      rate_our_from_usdt: order_data.recalc_our_rate,
      delivery_cost_fiat_from_usdt: order_data.recalc_delivery_fee,
      delivery_cost_fiat_from_usdt_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_delivery_fee_currency
      ),

      recalc_amount_from_client: order_data.recalc_amount_from_client,
      recalc_amount_to_platform: order_data.recalc_amount_to_platform,
      recalc_from_platform: order_data.recalc_amount_from_platform,
      recalc_amount_to_client: order_data.recalc_amount_to_client,
      recalc_profit: order_data.recalc_our_profit,

      amount_from_client_currency: changeCurrencyToUsdtIfUstr(
        order_data.amount_from_client_currency
      ),
      amount_to_platform_currency: changeCurrencyToUsdtIfUstr(
        order_data.amount_to_platform_currency
      ),
      amount_to_client_currency: changeCurrencyToUsdtIfUstr(
        order_data.amount_to_client_currency
      ),
      amount_from_platform_currency: changeCurrencyToUsdtIfUstr(
        order_data.amount_from_platform_currency
      ),
      profit_currency: changeCurrencyToUsdtIfUstr(
        order_data.our_profit_currency
      ),

      recalc_amount_from_client_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_amount_from_client_currency
      ),
      recalc_amount_to_platform_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_amount_to_platform_currency
      ),
      recalc_from_platform_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_amount_from_platform_currency
      ),
      recalc_amount_to_client_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_amount_to_client_currency
      ),
      recalc_profit_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_our_profit_currency
      ),

      amount_currency: changeCurrencyToUsdtIfUstr(order_data.from_currency),
      recalc_to_currency: changeCurrencyToUsdtIfUstr(
        order_data.recalc_to_currency
      )
    },
    ...data
  };
}

export default {
  prepareCardsWithWithdrawalFiatReport,
  prepareCardsWithWithdrawalReport,
  prepareCryptoFiatWithRateReport,
  prepareCryptoFiatWithExchangeRateDeltaReport,
  prepareFiatCryptoWithTariffDeltaReport,
  prepareFiatCryptoWithExchangeRateDeltaReport,
  prepareStartFinalAdminReport,
  prepareStartFinalClientReport
};
