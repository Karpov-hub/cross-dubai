import db from "@lib/db";
import Queue from "@lib/queue";
import moment from "moment";

const Op = db.Sequelize.Op;

async function getOrderById(id) {
  if (!id) throw "ORDERIDEXCEPTED";

  return await db.order.findOne({
    where: {
      id: id
    },
    raw: true
  });
}

async function getContractById(id) {
  if (!id) throw "CONTRACTIDEXCEPTED";

  return await db.contract.findOne({
    where: {
      id: id
    },
    raw: true
  });
}

async function getMerchantById(id) {
  if (!id) throw "MERCHANTIDEXCEPTED";

  let merchant = await db.merchant.findOne({
    where: {
      id: id
    },
    raw: true
  });

  if (merchant && !merchant.client_number) {
    return db.sequelize.transaction(async (t) => {
      const mcns = await db.sequelize.query(
        "SELECT nextval('merchant_client_number_seq')",
        {
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );
      let client_number = String(mcns[0].nextval);
      await db.merchant.update(
        {
          client_number
        },
        {
          where: { id },
          transaction: t
        }
      );
      return merchant;
    });
  }

  return merchant;
}

async function getCountryByAbbr(abbr) {
  if (!abbr) throw "COUNTRYABBREXCEPTED";

  return await db.countries.findOne({
    where: {
      abbr2: abbr,
      lang: "English"
    },
    attributes: ["name"],
    raw: true
  });
}

async function getUserById(user_id) {
  if (!user_id) throw "USERIDEXCEPTED";

  return await db.user.findOne({
    where: {
      id: user_id
    },
    raw: true
  });
}

async function getAllUsers() {
  return await db.user.findAll({ raw: true });
}

async function getOrders() {
  return await db.order.findAll({
    raw: true
  });
}

async function getTransferById(id) {
  if (!id) throw "TRANSFERIDEXCEPTED";

  return await db.transfer.findOne({
    where: {
      id: id
    },
    raw: true
  });
}

async function getTransferHash(transfer_id) {
  if (!transfer_id) throw "TRANSFERIDEXCEPTED";

  return await db.cryptotx.findOne({
    where: {
      transfer_id: transfer_id
    },
    order: [["ctime", "DESC"]],
    raw: true
  });
}

async function getRealmDepartment(id) {
  if (!id) throw "REALMDEPARTMENTIDEXCEPTED";

  return await db.realmdepartment.findOne({
    where: {
      id: id
    },
    raw: true
  });
}

function getDateConditions(date_from, date_to) {
  const out = {};
  if (date_from) out[Op.gte] = new Date(date_from);
  if (date_to)
    out[Op.lte] = new Date(new Date(date_to).getTime() + 24 * 3600000);
  return out;
}

async function getTransfers(data) {
  let listCurrencyDecimal = await Queue.newJob("merchant-service", {
    method: "getListCurrencyDecimal",
    data: {}
  });
  let filterWhereObj = {
    data: {}
  };

  if (data.date_from && data.date_to)
    filterWhereObj.ctime = getDateConditions(data.date_from, data.date_to);

  // select all transfers not by plan for this report
  if (data.all) {
    filterWhereObj = {
      data: {},
      event_name: {
        [Op.in]: [
          "account-service:deposit",
          "account-service:withdrawalCustomExchangeRate"
        ]
      }
    };
  }

  if (data.user_id) {
    filterWhereObj.user_id = data.user_id;
  }
  if (data.merchant_id) {
    filterWhereObj.data.merchant = data.merchant_id;
  }
  if (data.ref_id) {
    filterWhereObj.ref_id = data.ref_id;
  }

  if (data.type) {
    filterWhereObj.event_name = data.type.includes("withdrawal")
      ? {
          [Op.in]: [
            "account-service:doPipe",
            "account-service:withdrawalCustomExchangeRate"
          ]
        }
      : "account-service:deposit";
  } else
    filterWhereObj.event_name = {
      [Op.in]: [
        "account-service:deposit",
        "account-service:withdrawalCustomExchangeRate"
      ]
    };

  let res = await db.transfer.findAndCountAll({
    where: filterWhereObj,
    order: [["ctime", "DESC"]]
  });

  for (let r of res.rows) {
    let res = await db.cryptotx.findAll({
      where: {
        transfer_id: r.dataValues.id
      },
      limit: 1,
      order: [["ctime", "DESC"]],
      raw: true
    });
    const monitoring = await db.transfer_log.findAll({
      where: {
        transfer_id: r.dataValues.id,
        message: "Send via Wallets."
      },
      limit: 1,
      order: [["ctime", "DESC"]],
      raw: true
    });
    if (res && res.length) {
      r.dataValues.cryptotx = res[0].id;
      r.dataValues.final_address = res[0].address;
    }
    if (monitoring && monitoring.length) {
      r.dataValues.monitoring_address = JSON.parse(
        monitoring[0].data
      ).toAddress;
    }

    r.dataValues.amount = parseFloat(r.dataValues.amount).toFixed(
      listCurrencyDecimal.result[r.dataValues.data.currency]
    );
    r.dataValues.description = r.dataValues.description;
    if (r.dataValues.held && r.dataValues.canceled) r.dataValues.status = 1;
    if (!r.dataValues.held && r.dataValues.canceled) r.dataValues.status = 2;
    if (r.dataValues.held && !r.dataValues.canceled) r.dataValues.status = 3;
    if (!r.dataValues.held && !r.dataValues.canceled) r.dataValues.status = 4;
  }

  res.rows = await prepareTransfersByPlan(res.rows);

  return res.rows && res.count
    ? { list: res.rows, count: res.count }
    : { list: [], count: 0 };
}

async function prepareTransfersByPlan(transfers) {
  let result_transfers = [];
  let plan_transfers_raw = {};
  for (let transfer of transfers) {
    if (transfer.data.pipeline) {
      if (!plan_transfers_raw[transfer.data.pipeline])
        plan_transfers_raw[transfer.data.pipeline] = [];
      plan_transfers_raw[transfer.data.pipeline].push(transfer);
    } else result_transfers.push(transfer);
  }

  result_transfers = result_transfers.concat(
    await buildTransfersByPlan(plan_transfers_raw)
  );
  return result_transfers;
}

async function buildTransfersByPlan(plan_transfers_raw) {
  let result_arr = [],
    transfer_object = { data: {} };
  let transfers_plans = await db.transfers_plan.findAll({
    where: {
      id: Object.keys(plan_transfers_raw)
    },
    attributes: ["id", "plan_id"],
    raw: true
  });
  let ids_transfers_plans = transfers_plans.map((el) => el.plan_id);
  let plans_arr = await db.accounts_plan.findAll({
    where: { id: ids_transfers_plans },
    attributes: ["id", "items"],
    raw: true
  });
  for (let key of Object.keys(plan_transfers_raw)) {
    let tf_plan = transfers_plans.find((el) => {
      return el.id == key;
    });
    let plan = plans_arr.find((el) => {
      return el.id == tf_plan.plan_id;
    });
    let first_transfer = plan_transfers_raw[key].find((el) => {
      return el.description == plan.items._arr[0].descript;
    });
    let last_transfer = plan_transfers_raw[key].find((el) => {
      return (
        el.description == plan.items._arr[plan.items._arr.length - 1].descript
      );
    });
    if (!first_transfer)
      first_transfer = await getFirstTransferByPlan(plan_transfers_raw[key]);
    transfer_object.ctime = first_transfer.ctime;
    transfer_object.data.amount = first_transfer.data.amount;
    transfer_object.data.currency = first_transfer.data.plan.from.currency;
    transfer_object.data.result_amount = last_transfer.data.amount;
    transfer_object.data.to_currency = last_transfer.data.plan.to.currency;
    transfer_object.monitoring_address =
      last_transfer.data.netData.net.fromAddress;
    transfer_object.by_plan = true;
    result_arr.push(transfer_object);
  }
  return result_arr;
}

async function getFirstTransferByPlan(transfers_arr) {
  let sorted_transfers = transfers_arr.sort((a, b) => {
    if (new Date(a.ctime).getTime() < new Date(b.ctime).getTime()) return -1;
    if (new Date(a.ctime).getTime() < new Date(b.ctime).getTime()) return 1;
    return 0;
  });
  return sorted_transfers[0];
}

async function getMonitoringAddress(user_id, merchant_id) {
  let monitoring = await db.sequelize.query(
    `select a.id, a.currency, ma.id_merchant, ac.address from accounts a
    left join merchant_accounts ma on (a.id=ma.id_account and ma.id_merchant=:merchant_id)
    left join account_crypto ac on a.acc_no = ac.acc_no where a.owner=:user_id
    and ac.address is not null and ma.id_merchant is not null`,
    {
      replacements: { user_id, merchant_id },
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  let addresses = [];
  const keys = {};
  if (monitoring && monitoring.length) {
    for (const wallet of monitoring) {
      if (!keys[wallet.currency]) keys[wallet.currency] = wallet.address;
      addresses.push(wallet.address);
    }
    return {
      ...keys,
      addresses: addresses.join(", ")
    };
  }

  throw "THEREISNOMONITORING";
}

async function getWithdrawalTransfersByOrderId(id) {
  if (!id) throw "TRANSFERIDEXCEPTED";

  let res = await db.transfer.findAll({
    where: {
      ref_id: id,
      event_name: {
        [Op.in]: [
          "account-service:doPipe",
          "account-service:withdrawalCustomExchangeRate"
        ]
      }
    },
    raw: true
  });

  const records = {};
  const nil_exchanges = [];
  res.forEach((item) => {
    if (item.data.plan && item.description == "Exchange")
      nil_exchanges.push(item);
    if (item.data.plan && item.description == "SK to Monitoring") {
      if (!records[item.data.netData.net.currencyId] && item.data.amount)
        records[item.data.netData.net.currencyId] = [];
      if (item.data.amount)
        records[item.data.netData.net.currencyId].push(item.data.amount);
    } else if (!item.data.plan) {
      if (!records[item.data.to_currency] && item.data.finAmount)
        records[item.data.to_currency] = [];
      if (item.data.finAmount)
        records[item.data.to_currency].push(item.data.finAmount);
    }
  });

  let out = [];
  for (const key of Object.keys(records)) {
    let rate = await getAvRateByCurrency(key, res, nil_exchanges);
    out.push({
      currency: key,
      tx_amounts: records[key],
      av_rate: key == "BTC" ? 1 / rate : rate
    });
  }
  return out;
}

async function getAvRateByCurrency(currency, res, nil_exchanges) {
  let av_rate = 0;
  let counter = 0;
  for (const tx of res) {
    if (tx.data.to_currency == currency) {
      av_rate += parseFloat(tx.data.custom_exchange_rate);
      counter++;
    }
  }

  for (const tx of nil_exchanges) {
    if (
      tx.data &&
      tx.data.plan &&
      tx.data.plan.to &&
      tx.data.plan.to.currency == currency
    ) {
      if (tx.data.netData && tx.data.netData.exchange) {
        av_rate += parseFloat(tx.data.netData.exchange.executed_price);
        counter++;
      }
    }
  }

  return counter > 1 ? av_rate / counter : av_rate;
}

async function getContractorById(id) {
  if (!id) throw "CONTRACTORIDEXCEPTED";
  return await db.contractor.findOne({
    where: { id },
    raw: true
  });
}

async function getContractorDailyInvoiceNum(id) {
  const sequence = await db.sequelize.query(
    `SELECT nextval('invoice_contractor_seq')`,
    {
      type: db.sequelize.QueryTypes.SELECT
    }
  );

  return String(sequence[0].nextval).padStart(3, "0");
}

async function _checkForExistReport(order_id) {
  const proforma_invoice = await db.order_invoice.findOne({
    where: {
      order_id: order_id
    },
    raw: true
  });
  if (proforma_invoice) return { success: true, code: proforma_invoice.code };
  return { success: true, code: null };
}

async function getIBANById(id) {
  if (!id) throw "IBANIDEXCEPTED";
  return await db.iban.findOne({
    where: { id },
    raw: true
  });
}

async function getBankById(id) {
  if (!id) throw "BANKIDEXCEPTED";
  return await db.bank.findOne({
    where: { id },
    raw: true
  });
}

async function getOneTimeProformaInvoiceNumber(id, currency) {
  let inc;
  if (currency == "EUR") inc = { ot_proforma_invoice_eur: +1 };
  else if (currency == "USD") inc = { ot_proforma_invoice_usd: +1 };
  else throw "NOCURRENCY";

  const [res] = await db.realmdepartment.increment(inc, {
    where: { id },
    returning: true,
    plain: true,
    raw: true
  });

  if (currency == "EUR") return res[0].ot_proforma_invoice_eur;
  if (currency == "USD") return res[0].ot_proforma_invoice_usd;
}

function getMockupTransfers() {
  return {
    list: [
      {
        id: "9303336c-a055-4996-9896-59dbec64db36",
        realm_id: "ef07097c-ff3c-497a-a576-5b3299beed8f",
        user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
        invoice_number: null,
        ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        event_name: "account-service:withdrawalCustomExchangeRate",
        held: false,
        canceled: false,
        description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        notes: null,
        data: {
          _id: "",
          acc_no: "41037336444599169210",
          amount: "287259.09",
          ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          tariff: "2c112408-b407-47b5-b1c7-91dea3d109c1",
          wallet: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
          options: {},
          user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
          acc_tech: "30000002",
          currency: "EUR",
          merchant: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          finAmount: 333872.65370477276,
          use_stock: "on",
          variables: [
            {
              id: "extModel3463-5",
              key: "PP_COST",
              value: "0.1",
              descript: "Стоимость платежного поручения, EUR"
            },
            {
              id: "extModel3463-3",
              key: "PARTNER_FEES",
              value: "0.55",
              descript: "Комиссия партнерам, %"
            },
            {
              id: "extModel3463-2",
              key: "SYS_FEES",
              value: "1.35",
              descript: "Комиссия системы, %"
            },
            {
              id: "extModel3463-1",
              key: "PARTNERS_ACCOUNT",
              value: "103146971098636106686",
              descript: "Счет для комиссий партнерам"
            }
          ],
          description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          merchant_id: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          to_currency: "USDT",
          result_amount: "333868,72",
          organisation_name: "JUDAY COMPANY LLC",
          custom_exchange_rate: 1.1781754774556121
        },
        amount: "287259.09",
        status: 4,
        deferred: false,
        ctime: "2021-07-22T09:29:22.136Z",
        mtime: "2021-07-22T09:56:51.505Z",
        maker: null,
        signobject: null,
        removed: 0,
        cryptotx:
          "0x234d3789bc382e84cadbfed6e5b9ce649937881f13b4cec6d816bb0a30b1503e",
        final_address: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
        monitoring_address: "0x00003b672064cce3699d13e53ccba5a8bbb53ffa"
      },
      {
        id: "f3fed28d-6e26-489a-b737-0556f2432e9d",
        realm_id: "ef07097c-ff3c-497a-a576-5b3299beed8f",
        user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
        invoice_number: null,
        ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        event_name: "account-service:withdrawalCustomExchangeRate",
        held: false,
        canceled: false,
        description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        notes: null,
        data: {
          _id: "",
          acc_no: "41037336444599169210",
          amount: "672638.71",
          ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          tariff: "2c112408-b407-47b5-b1c7-91dea3d109c1",
          wallet: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
          options: {},
          user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
          acc_tech: "30000002",
          currency: "EUR",
          merchant: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          finAmount: 780831.112148598,
          use_stock: "on",
          variables: [
            {
              id: "extModel3463-5",
              key: "PP_COST",
              value: "0.1",
              descript: "Стоимость платежного поручения, EUR"
            },
            {
              id: "extModel3463-3",
              key: "PARTNER_FEES",
              value: "0.55",
              descript: "Комиссия партнерам, %"
            },
            {
              id: "extModel3463-2",
              key: "SYS_FEES",
              value: "1.35",
              descript: "Комиссия системы, %"
            },
            {
              id: "extModel3463-1",
              key: "PARTNERS_ACCOUNT",
              value: "103146971098636106686",
              descript: "Счет для комиссий партнерам"
            }
          ],
          description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          merchant_id: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          to_currency: "USDT",
          result_amount: "780932,2",
          organisation_name: "JUDAY COMPANY LLC",
          custom_exchange_rate: 1.1767336228098046
        },
        amount: "672638.71",
        status: 4,
        deferred: false,
        ctime: "2021-07-20T17:08:00.303Z",
        mtime: "2021-07-20T17:47:51.387Z",
        maker: null,
        signobject: null,
        removed: 0,
        cryptotx:
          "0xdff97112d32cea0cb6bf568b52addc65c5cd28339af48cffecdb2f8e5db75418",
        final_address: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
        monitoring_address: "0x00003b672064cce3699d13e53ccba5a8bbb53ffa"
      },
      {
        id: "af687e53-45cf-4710-a884-478961b98468",
        realm_id: "ef07097c-ff3c-497a-a576-5b3299beed8f",
        user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
        invoice_number: null,
        ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        event_name: "account-service:withdrawalCustomExchangeRate",
        held: false,
        canceled: false,
        description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        notes: null,
        data: {
          _id: "",
          acc_no: "41037336444599169210",
          amount: "198989.44",
          ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          tariff: "2c112408-b407-47b5-b1c7-91dea3d109c1",
          wallet: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
          options: {},
          user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
          acc_tech: "30000002",
          currency: "EUR",
          merchant: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          finAmount: 232325.0873542813,
          use_stock: "on",
          variables: [
            {
              id: "extModel3463-5",
              key: "PP_COST",
              value: "0.1",
              descript: "Стоимость платежного поручения, EUR"
            },
            {
              id: "extModel3463-3",
              key: "PARTNER_FEES",
              value: "0.6",
              descript: "Комиссия партнерам, %"
            },
            {
              id: "extModel3463-2",
              key: "SYS_FEES",
              value: "1.35",
              descript: "Комиссия системы, %"
            },
            {
              id: "extModel3463-1",
              key: "PARTNERS_ACCOUNT",
              value: "103146971098636106686",
              descript: "Счет для комиссий партнерам"
            }
          ],
          description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          merchant_id: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          to_currency: "USDT",
          result_amount: "232333,34",
          organisation_name: "JUDAY COMPANY LLC",
          custom_exchange_rate: 1.1835019823658204
        },
        amount: "198989.44",
        status: 4,
        deferred: false,
        ctime: "2021-07-13T09:11:39.273Z",
        mtime: "2021-07-13T09:46:06.337Z",
        maker: null,
        signobject: null,
        removed: 0,
        cryptotx:
          "0xf7b24dba928ed569c9b7199909331bf20627f0d7b58fa77e4e831d7659222fdb",
        final_address: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
        monitoring_address: "0x00003b672064cce3699d13e53ccba5a8bbb53ffa"
      },
      {
        id: "e3c17fb7-c0de-4887-bb68-57e7efaeb844",
        realm_id: "ef07097c-ff3c-497a-a576-5b3299beed8f",
        user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
        invoice_number: null,
        ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        event_name: "account-service:withdrawalCustomExchangeRate",
        held: false,
        canceled: false,
        description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        notes: null,
        data: {
          _id: "",
          acc_no: "41037336444599169210",
          amount: "195752.97",
          ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          tariff: "2c112408-b407-47b5-b1c7-91dea3d109c1",
          wallet: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
          options: {},
          user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
          acc_tech: "30000002",
          currency: "EUR",
          merchant: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          finAmount: 228744.05357015945,
          use_stock: "on",
          variables: [
            {
              id: "extModel3463-5",
              key: "PP_COST",
              value: "0.1",
              descript: "Стоимость платежного поручения, EUR"
            },
            {
              id: "extModel3463-3",
              key: "PARTNER_FEES",
              value: "0.6",
              descript: "Комиссия партнерам, %"
            },
            {
              id: "extModel3463-2",
              key: "SYS_FEES",
              value: "1.35",
              descript: "Комиссия системы, %"
            },
            {
              id: "extModel3463-1",
              key: "PARTNERS_ACCOUNT",
              value: "103146971098636106686",
              descript: "Счет для комиссий партнерам"
            }
          ],
          description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          merchant_id: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          to_currency: "USDT",
          result_amount: "228730,51",
          organisation_name: "JUDAY COMPANY LLC",
          custom_exchange_rate: 1.1845253606879724
        },
        amount: "195752.97",
        status: 4,
        deferred: false,
        ctime: "2021-07-12T12:43:30.903Z",
        mtime: "2021-07-12T13:16:06.306Z",
        maker: null,
        signobject: null,
        removed: 0,
        cryptotx:
          "0x857e794288821f44afde0fc415fd984c207ea8bf00de362e595ecf6188db04ae",
        final_address: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
        monitoring_address: "0x00003b672064cce3699d13e53ccba5a8bbb53ffa"
      },
      {
        id: "074008d3-32ae-496f-b487-56fbb374a65e",
        realm_id: "ef07097c-ff3c-497a-a576-5b3299beed8f",
        user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
        invoice_number: null,
        ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        event_name: "account-service:withdrawalCustomExchangeRate",
        held: false,
        canceled: false,
        description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        notes: null,
        data: {
          _id: "",
          acc_no: "41037336444599169210",
          amount: "302767.62",
          ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          tariff: "2c112408-b407-47b5-b1c7-91dea3d109c1",
          wallet: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
          options: {},
          user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
          acc_tech: "30000002",
          currency: "EUR",
          merchant: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          finAmount: 353367.3952131939,
          use_stock: "on",
          variables: [
            {
              id: "extModel3463-5",
              key: "PP_COST",
              value: "0.1",
              descript: "Стоимость платежного поручения, EUR"
            },
            {
              id: "extModel3463-3",
              key: "PARTNER_FEES",
              value: "0.6",
              descript: "Комиссия партнерам, %"
            },
            {
              id: "extModel3463-2",
              key: "SYS_FEES",
              value: "1.35",
              descript: "Комиссия системы, %"
            },
            {
              id: "extModel3463-1",
              key: "PARTNERS_ACCOUNT",
              value: "103146971098636106686",
              descript: "Счет для комиссий партнерам"
            }
          ],
          description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          merchant_id: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          to_currency: "USDT",
          result_amount: "353430,12",
          deferred_transfer: true,
          organisation_name: "JUDAY COMPANY LLC",
          custom_exchange_rate: 1.183095925417633
        },
        amount: "302767.62",
        status: 4,
        deferred: true,
        ctime: "2021-07-08T15:21:56.458Z",
        mtime: "2021-07-08T16:07:06.293Z",
        maker: null,
        signobject: null,
        removed: 0,
        cryptotx:
          "0xbc8c81450c3073a00cd160c201bc1eed913ad280ee1a755a276088b89d2a20ff",
        final_address: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
        monitoring_address: "0x00003b672064cce3699d13e53ccba5a8bbb53ffa"
      },
      {
        id: "fceddbab-71c3-4a8d-90f1-eb544433d929",
        realm_id: "ef07097c-ff3c-497a-a576-5b3299beed8f",
        user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
        invoice_number: null,
        ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        event_name: "account-service:withdrawalCustomExchangeRate",
        held: false,
        canceled: false,
        description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        notes: null,
        data: {
          _id: "",
          acc_no: "41037336444599169210",
          amount: "28186.17",
          ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          tariff: "2c112408-b407-47b5-b1c7-91dea3d109c1",
          wallet: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
          options: {},
          user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
          acc_tech: "30000002",
          currency: "EUR",
          merchant: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          finAmount: 32743.693183158386,
          use_stock: "on",
          variables: [
            {
              id: "extModel3463-5",
              key: "PP_COST",
              value: "0.1",
              descript: "Стоимость платежного поручения, EUR"
            },
            {
              id: "extModel3463-3",
              key: "PARTNER_FEES",
              value: "0.75",
              descript: "Комиссия партнерам, %"
            },
            {
              id: "extModel3463-2",
              key: "SYS_FEES",
              value: "1.5",
              descript: "Комиссия системы, %"
            },
            {
              id: "extModel3463-1",
              key: "PARTNERS_ACCOUNT",
              value: "103146971098636106686",
              descript: "Счет для комиссий партнерам"
            }
          ],
          description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          merchant_id: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          to_currency: "USDT",
          result_amount: "32746,4",
          deferred_transfer: true,
          organisation_name: "JUDAY COMPANY LLC",
          custom_exchange_rate: 1.1793843613633683
        },
        amount: "28186.17",
        status: 4,
        deferred: true,
        ctime: "2021-07-07T13:41:05.866Z",
        mtime: "2021-07-07T14:40:06.326Z",
        maker: null,
        signobject: null,
        removed: 0,
        cryptotx:
          "0x2a1d2b9a9f042e177aaf5830a591f4af8e366c6bbe0d466fb703df1ff3ff027a",
        final_address: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
        monitoring_address: "0x00003b672064cce3699d13e53ccba5a8bbb53ffa"
      },
      {
        id: "588a74bc-9c3b-47dd-809b-b1cc46bc4902",
        realm_id: "ef07097c-ff3c-497a-a576-5b3299beed8f",
        user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
        invoice_number: null,
        ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        event_name: "account-service:withdrawalCustomExchangeRate",
        held: false,
        canceled: false,
        description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        notes: null,
        data: {
          _id: "",
          acc_no: "41037336444599169210",
          amount: "50000",
          ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          tariff: "2c112408-b407-47b5-b1c7-91dea3d109c1",
          wallet: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
          options: {},
          user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
          acc_tech: "30000002",
          currency: "EUR",
          merchant: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          finAmount: 58528.92366050261,
          use_stock: "on",
          variables: [
            {
              id: "extModel3463-6",
              key: "BLOCKCHAIN_FEES",
              value: "6",
              descript: "Комиссия блокчейна, USDT"
            },
            {
              id: "extModel3463-5",
              key: "PP_COST",
              value: "0.1",
              descript: "Стоимость платежного поручения, EUR"
            },
            {
              id: "extModel3463-3",
              key: "PARTNER_FEES",
              value: "0.58",
              descript: "Комиссия партнерам, %"
            },
            {
              id: "extModel3463-2",
              key: "SYS_FEES",
              value: "1.25",
              descript: "Комиссия системы, %"
            },
            {
              id: "extModel3463-1",
              key: "PARTNERS_ACCOUNT",
              value: "103146971098636106686",
              descript: "Счет для комиссий партнерам"
            }
          ],
          description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          merchant_id: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          to_currency: "USDT",
          result_amount: "58528,92",
          organisation_name: "JUDAY COMPANY LLC",
          custom_exchange_rate: 1.1853959222380275
        },
        amount: "50000.00",
        status: 4,
        deferred: false,
        ctime: "2021-07-05T18:56:09.865Z",
        mtime: "2021-07-05T19:46:06.441Z",
        maker: null,
        signobject: null,
        removed: 0,
        cryptotx:
          "0xb0d1936494e22ea242916fec8a9ada7274f12309d8836b56e8111435eaaef8b0",
        final_address: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
        monitoring_address: "0x00003b672064cce3699d13e53ccba5a8bbb53ffa"
      },
      {
        id: "a476cf86-e2f7-4522-8f74-7b8d4d6ee72b",
        realm_id: "ef07097c-ff3c-497a-a576-5b3299beed8f",
        user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
        invoice_number: null,
        ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        event_name: "account-service:withdrawalCustomExchangeRate",
        held: false,
        canceled: false,
        description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        notes: null,
        data: {
          _id: "",
          acc_no: "41037336444599169210",
          amount: "54882.25",
          ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          tariff: "2c112408-b407-47b5-b1c7-91dea3d109c1",
          wallet: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
          options: {},
          user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
          acc_tech: "30000002",
          currency: "EUR",
          merchant: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          finAmount: 64239.41146314867,
          use_stock: "on",
          variables: [
            {
              id: "extModel3463-6",
              key: "BLOCKCHAIN_FEES",
              value: "6",
              descript: "Комиссия блокчейна, USDT"
            },
            {
              id: "extModel3463-5",
              key: "PP_COST",
              value: "0.1",
              descript: "Стоимость платежного поручения, EUR"
            },
            {
              id: "extModel3463-3",
              key: "PARTNER_FEES",
              value: "0.58",
              descript: "Комиссия партнерам, %"
            },
            {
              id: "extModel3463-2",
              key: "SYS_FEES",
              value: "1.25",
              descript: "Комиссия системы, %"
            },
            {
              id: "extModel3463-1",
              key: "PARTNERS_ACCOUNT",
              value: "103146971098636106686",
              descript: "Счет для комиссий партнерам"
            }
          ],
          description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          merchant_id: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          to_currency: "USDT",
          result_amount: "64239,41",
          organisation_name: "JUDAY COMPANY LLC",
          custom_exchange_rate: 1.1853116184244838
        },
        amount: "54882.25",
        status: 4,
        deferred: false,
        ctime: "2021-07-05T18:44:21.718Z",
        mtime: "2021-07-05T19:31:06.330Z",
        maker: null,
        signobject: null,
        removed: 0,
        cryptotx:
          "0x71cc9e7260dab412888b3b29cca3f957ec225e1b0886d83e2231310eb44abb09",
        final_address: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
        monitoring_address: "0x00003b672064cce3699d13e53ccba5a8bbb53ffa"
      },
      {
        id: "f64142a0-94cf-440e-ba57-3db73bbe19f3",
        realm_id: "ef07097c-ff3c-497a-a576-5b3299beed8f",
        user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
        invoice_number: null,
        ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        event_name: "account-service:withdrawalCustomExchangeRate",
        held: false,
        canceled: false,
        description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        notes: null,
        data: {
          _id: "",
          acc_no: "41037336444599169210",
          amount: "70532.11",
          ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          tariff: "2c112408-b407-47b5-b1c7-91dea3d109c1",
          wallet: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
          options: {},
          user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
          acc_tech: "30000002",
          currency: "EUR",
          merchant: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          finAmount: 82531.08507222164,
          variables: [
            {
              id: "extModel3463-6",
              key: "BLOCKCHAIN_FEES",
              value: "8",
              descript: "Комиссия блокчейна, USDT"
            },
            {
              id: "extModel3463-5",
              key: "PP_COST",
              value: "0.1",
              descript: "Стоимость платежного поручения, EUR"
            },
            {
              id: "extModel3463-3",
              key: "PARTNER_FEES",
              value: "0.58",
              descript: "Комиссия партнерам, %"
            },
            {
              id: "extModel3463-2",
              key: "SYS_FEES",
              value: "1.25",
              descript: "Комиссия системы, %"
            },
            {
              id: "extModel3463-1",
              key: "PARTNERS_ACCOUNT",
              value: "103146971098636106686",
              descript: "Счет для комиссий партнерам"
            }
          ],
          description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          merchant_id: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          to_currency: "USDT",
          result_amount: "82431,46",
          organisation_name: "JUDAY COMPANY LLC",
          custom_exchange_rate: "1.1849323996066026"
        },
        amount: "70532.11",
        status: 4,
        deferred: false,
        ctime: "2021-07-01T17:00:53.297Z",
        mtime: "2021-07-01T17:23:14.964Z",
        maker: null,
        signobject: null,
        removed: 0,
        cryptotx:
          "0x7a33ca7e31c68837a22537076cf2f054634337c1d26bf3d7247891f4119d6358",
        final_address: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
        monitoring_address: "0x00003b672064cce3699d13e53ccba5a8bbb53ffa"
      },
      {
        id: "f4f63854-c0c2-4266-b88c-cc288f1a135d",
        realm_id: "ef07097c-ff3c-497a-a576-5b3299beed8f",
        user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
        invoice_number: null,
        ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        event_name: "account-service:withdrawalCustomExchangeRate",
        held: false,
        canceled: false,
        description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        notes: null,
        data: {
          _id: "",
          acc_no: "41037336444599169210",
          amount: "25581.03",
          ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          tariff: "2c112408-b407-47b5-b1c7-91dea3d109c1",
          wallet: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
          options: {},
          user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
          acc_tech: "30000002",
          currency: "EUR",
          merchant: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          finAmount: 30146.868660047257,
          use_stock: "on",
          variables: [
            {
              id: "extModel3463-6",
              key: "BLOCKCHAIN_FEES",
              value: "4",
              descript: "Комиссия блокчейна, USDT"
            },
            {
              id: "extModel3463-5",
              key: "PP_COST",
              value: "0.1",
              descript: "Стоимость платежного поручения, EUR"
            },
            {
              id: "extModel3463-3",
              key: "PARTNER_FEES",
              value: "0.58",
              descript: "Комиссия партнерам, %"
            },
            {
              id: "extModel3463-2",
              key: "SYS_FEES",
              value: "1.25",
              descript: "Комиссия системы, %"
            },
            {
              id: "extModel3463-1",
              key: "PARTNERS_ACCOUNT",
              value: "103146971098636106686",
              descript: "Счет для комиссий партнерам"
            }
          ],
          description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          merchant_id: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          to_currency: "USDT",
          result_amount: "30147,95",
          organisation_name: "JUDAY COMPANY LLC",
          custom_exchange_rate: 1.193402868940497
        },
        amount: "25581.03",
        status: 4,
        deferred: false,
        ctime: "2021-06-25T10:15:36.123Z",
        mtime: "2021-06-25T10:50:14.914Z",
        maker: null,
        signobject: null,
        removed: 0,
        cryptotx:
          "0x35d767255107a4f1f776b76697b54c95fdcedb1bf4e39b0c03cbcd2dec50892f",
        final_address: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
        monitoring_address: "0x00003b672064cce3699d13e53ccba5a8bbb53ffa"
      },
      {
        id: "35a5201c-4466-4883-81b2-412a46b73044",
        realm_id: "ef07097c-ff3c-497a-a576-5b3299beed8f",
        user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
        invoice_number: null,
        ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        event_name: "account-service:withdrawalCustomExchangeRate",
        held: false,
        canceled: false,
        description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
        notes: null,
        data: {
          _id: "",
          acc_no: "41037336444599169210",
          amount: "83534.13",
          ref_id: "1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          tariff: "2c112408-b407-47b5-b1c7-91dea3d109c1",
          wallet: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
          options: {},
          user_id: "ac901c28-adb6-4403-b5bb-3c9461470052",
          acc_tech: "30000002",
          currency: "EUR",
          merchant: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          finAmount: 98422.60460912518,
          use_stock: "on",
          variables: [
            {
              id: "extModel3463-6",
              key: "BLOCKCHAIN_FEES",
              value: "4",
              descript: "Комиссия блокчейна, USDT"
            },
            {
              id: "extModel3463-5",
              key: "PP_COST",
              value: "0.1",
              descript: "Стоимость платежного поручения, EUR"
            },
            {
              id: "extModel3463-3",
              key: "PARTNER_FEES",
              value: "0.58",
              descript: "Комиссия партнерам, %"
            },
            {
              id: "extModel3463-2",
              key: "SYS_FEES",
              value: "1.25",
              descript: "Комиссия системы, %"
            },
            {
              id: "extModel3463-1",
              key: "PARTNERS_ACCOUNT",
              value: "103146971098636106686",
              descript: "Счет для комиссий партнерам"
            }
          ],
          description: "Order #1c3813a3-4083-47ad-8ef2-e711f3c6f22f",
          merchant_id: "dc3325f1-3289-4bd9-a79d-6ceb0ed422d9",
          to_currency: "USDT",
          result_amount: "98420,26",
          organisation_name: "JUDAY COMPANY LLC",
          custom_exchange_rate: 1.1931465661241827
        },
        amount: "83534.13",
        status: 4,
        deferred: false,
        ctime: "2021-06-25T09:25:21.429Z",
        mtime: "2021-06-25T10:08:14.945Z",
        maker: null,
        signobject: null,
        removed: 0,
        cryptotx:
          "0xe14318168c26136a92e2800eb3ab10c5ae5fa187e2fc3ca2ed93e31264b851d8",
        final_address: "0x05e7c38307447fd51eb339d0177704c845cdafcc",
        monitoring_address: "0x00003b672064cce3699d13e53ccba5a8bbb53ffa"
      }
    ],
    count: 11
  };
}

/*
  @author Andrei Mikhin
  @date 10 Aug 2021
  @function getInvoiceNo
  @desc select next value of invoice sequence
*/
async function getInvoiceNo(currency) {
  let invoice_sequence = null;
  invoice_sequence = "deposit_invoice_" + String(currency).toLowerCase();
  const invoiceCounter = await db.sequelize.query(
    `SELECT nextval('${invoice_sequence}')`,
    {
      type: db.sequelize.QueryTypes.SELECT
    }
  );
  if (invoiceCounter) {
    let no_invoice = invoiceCounter[0].nextval;
    return no_invoice;
  }
  throw "ERRORSETINVOICENUM";
}

/*
  @author Andrei Mikhin
  @date 10 Aug 2021
  @function generateProformaInvoiceNumber
  @desc select next value of proforma invoice sequence
*/
async function generateProformaInvoiceNumber() {
  const proformaInvoiceNumber = await db.sequelize.query(
    `SELECT nextval('proforma_invoice_seq')`,
    {
      type: db.sequelize.QueryTypes.SELECT
    }
  );
  let proforma_invoice_no = proformaInvoiceNumber[0].nextval;
  return proforma_invoice_no;
}

/*
  @author Alexander Goryachev
  @date 04 Feb 2022
  @function getLatestRates
  @desc return latest rate by 2 currencies. Source - EUR
*/
async function getLatestRates(currency_to) {
  let currency = await db.currency_values.findOne({
    where: {
      abbr: "EUR"
    },
    raw: true
  });

  let res_currency = await db.currency_values.findOne({
    where: {
      abbr: currency_to
    },
    raw: true
  });

  let rate = currency.value * (1 / res_currency.value);

  // if (data.amount) exchange_rate = exchange_rate * data.amount;

  return rate;
}

/*
  @author Alexander Goryachev
  @date 08 Feb 2022
  @function getDefaultRealm
  @desc should return id of the realm where flag admin_realm: true
*/
async function getDefaultRealm() {
  let realm = await db.realm.findOne({
    where: {
      admin_realm: true
    },
    attributes: ["id"],
    raw: true
  });

  return realm.id;
}

/*
  @author Alexander Goryachev
  @date 09 Feb 2022
  @function getSavedInvoice
  @desc should return invoice for cancelling
*/
async function getSavedInvoice(file_id) {
  let file = await db.file.findOne({
    where: {
      id: file_id
    },
    attributes: ["invoice_id", "owner_id"],
    raw: true
  });
  let invoice;
  if (file)
    invoice = await db.invoice.findOne({
      where: {
        id: file.invoice_id
      },
      raw: true
    });

  return { order_id: file.owner_id, ...invoice };
}

/*
  @author Alexander Goryachev
  @date 17 Feb 2022
  @function getVatPercent
  @desc should return vat percent for germany invices. Default value 19
*/
async function getVatPercent() {
  let settings = await db.settings.findOne({
    where: {
      key: "vat_percent"
    },
    raw: true
  });

  if (settings && settings.value) return parseFloat(settings.value);

  return 19;
}

async function getClientDebts(user_id) {
  let out = {};

  const userBalances = await _getUserBalances(user_id);
  const depositsAmount = await _getAmountByHeldDeposits(user_id);
  const balances = userBalances.concat(depositsAmount);

  const { result } = await Queue.newJob("merchant-service", {
    method: "getListCurrencyDecimal",
    data: {}
  });
  const listCurrencyDecimal = result;

  balances.forEach((item) => {
    if (!out[item.currency]) out[item.currency] = 0;
    out[item.currency] += item.amount;
  });

  return Object.keys(out).map((key) => {
    return {
      currency: key,
      amount: out[key].toFixed(listCurrencyDecimal[key])
    };
  });
}

async function _getUserBalances(user_id) {
  const out = {};

  const accounts = await db.account.findAll({
    where: {
      owner: user_id,
      status: 1,
      balance: { [Op.not]: 0 }
    },
    attributes: ["balance", "currency"],
    order: [["currency", "ASC"]],
    raw: true
  });

  accounts.forEach((item) => {
    if (!out[item.currency]) out[item.currency] = 0;
    out[item.currency] += item.balance;
  });

  return Object.keys(out).map((key) => {
    return { currency: key, amount: out[key] };
  });
}

async function _getAmountByHeldDeposits(user_id) {
  const out = {};
  const transfers = await db.transfer.findAll({
    where: {
      user_id: user_id,
      held: true,
      canceled: false,
      event_name: "account-service:deposit"
    },
    raw: true
  });

  transfers.forEach((item) => {
    if (!out[item.data.currency]) out[item.data.currency] = 0;
    out[item.data.currency] += item.amount;
  });

  return Object.keys(out).map((key) => {
    return { currency: key, amount: out[key] };
  });
}

async function getHeldMerchantDeposits(user_id) {
  let out = [];

  let res = await db.transfer.findAll({
    where: {
      user_id: user_id,
      held: true,
      canceled: false,
      event_name: "account-service:deposit"
    },
    attributes: ["data", "ctime"],
    order: [["ctime", "ASC"]],
    raw: true
  });

  const { result } = await Queue.newJob("merchant-service", {
    method: "getListCurrencyDecimal",
    data: {}
  });
  const listCurrencyDecimal = result;

  res.forEach((item) => {
    out.push({
      type: "deposit",
      date: moment(
        item.data.deposit_date ? item.data.deposit_date : item.ctime
      ).format("DD.MM.YYYY"),
      merchant_name: item.data.organisation_name,
      amount: item.data.amount.toFixed(listCurrencyDecimal[item.data.currency]),
      currency: item.data.currency
    });
  });

  out = out.sort((a, b) => new Date(a.date) - new Date(b.date));

  return out;
}

async function getMerchantBalances(user_id) {
  const out = [];

  const accounts = await db.vw_client_accs.findAll({
    where: {
      owner: user_id,
      status: 1
    },
    attributes: ["id", "balance", "currency", "merchant_name"],
    order: [
      ["merchant_name", "ASC"],
      ["currency", "ASC"]
    ],
    raw: true
  });

  const { result } = await Queue.newJob("merchant-service", {
    method: "getListCurrencyDecimal",
    data: {}
  });
  const listCurrencyDecimal = result;

  const CurrenciesList = await db.currency.findAll({
    attributes: ["abbr", "crypto"],
    raw: true
  });

  const cl_out = {};
  CurrenciesList.forEach((item) => {
    if (!cl_out[item.abbr]) cl_out[item.abbr] = item.crypto;
  });

  accounts.forEach((item) => {
    if (
      (!cl_out[item.currency] && parseFloat(item.balance) > 0.01) ||
      (cl_out[item.currency] && parseFloat(item.balance) > 0.0001)
    ) {
      out.push({
        type: "account",
        date: null,
        merchant_name: item.merchant_name || "-",
        amount: parseFloat(item.balance).toFixed(
          listCurrencyDecimal[item.currency]
        ),
        currency: item.currency
      });
    }
  });

  return out;
}

async function getAccTxs(data) {
  let where = {
    [Op.or]: [{ acc_src: data.acc_no }, { acc_dst: data.acc_no }],
    ctime: getDateConditions(data.date_from, data.date_to)
  };

  if (data.all)
    where = { ctime: getDateConditions(data.date_from, data.date_to) };

  const transactions = await db.vw_trancaction.findAll({
    where,
    attributes: [
      "id",
      "ref_id",
      "ctime",
      "legalname",
      "merchant_name",
      "src_acc_name",
      "acc_src",
      "dst_acc_name",
      "acc_dst",
      "amount",
      "currency_src",
      "exchange_amount",
      "currency_dst",
      "held",
      "canceled",
      "description_src"
    ],
    raw: true,
    order: [["ctime", "ASC"]]
  });

  return transactions;
}

async function getTransfersByPlan(data) {
  let filterWhereObj = {
    data: {}
  };

  if (data.date_from && data.date_to)
    filterWhereObj.ctime = getDateConditions(data.date_from, data.date_to);

  if (data.all)
    filterWhereObj = {
      data: {}
    };

  if (data.user_id) {
    filterWhereObj.user_id = data.user_id;
  }
  if (data.merchant_id) {
    filterWhereObj.data.merchant = data.merchant_id;
  }

  let res = await db.vw_plan_transfer.findAndCountAll({
    where: filterWhereObj,
    order: [["ctime", "DESC"]],
    raw: true
  });

  return res.rows && res.count
    ? { list: res.rows, count: res.count }
    : { list: [], count: 0 };
}

async function getTransferBPTransactions(data) {
  let res = await db.transaction.findAll({
    where: {
      transfer_id: {
        [Op.in]: data.map((item) => item.id)
      }
    },
    raw: true
  });

  return { list: res };
}

export default {
  getOrderById,
  getContractById,
  getMerchantById,
  getCountryByAbbr,
  getUserById,
  getTransferById,
  getTransferHash,
  getRealmDepartment,
  getAllUsers,
  getOrders,
  getTransfers,
  getMonitoringAddress,
  getWithdrawalTransfersByOrderId,
  getContractorById,
  getContractorDailyInvoiceNum,
  _checkForExistReport,
  getIBANById,
  getBankById,
  getOneTimeProformaInvoiceNumber,
  getMockupTransfers,
  getInvoiceNo,
  generateProformaInvoiceNumber,
  getLatestRates,
  getDefaultRealm,
  getSavedInvoice,
  getVatPercent,
  getClientDebts,
  getHeldMerchantDeposits,
  getMerchantBalances,
  getAccTxs,
  getTransfersByPlan,
  getTransferBPTransactions
};
