const node_xj = require("xls-to-json"); // scope:server
const fs = require("fs"); // scope:server

Ext.define("Crm.modules.transfers.model.TransfersModel", {
  extend: "Crm.classes.DataModel",

  mixins: [
    "Crm.modules.orders.model.UpdateDataFuncModel", // scope:server
    "Crm.modules.currency.model.CurrencyFunc"
  ],

  collection: "transfers",
  idField: "id",
  strongRequest: true,
  showTags: true,
  //removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "realm_id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "ref_id",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "username",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "legalname",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "user_type",
      type: "int",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "realmname",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "event_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "canceled",
      type: "boolean",
      // sort: 1,
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "held",
      // sort: -1,
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "description",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "notes",
      type: "string",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "amount",
      type: "float",
      filterable: false,
      editable: true,
      visible: true
    },

    {
      name: "canceled",
      type: "boolean",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "data",
      type: "object",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "merchant_id",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "string_status",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "status",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "order_id",
      type: "ObjectID",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "plan_transfer_id",
      type: "ObjectID",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "currency",
      type: "string",
      visible: true,
      filterable: true,
      editable: false
    },
    {
      name: "organisation_name",
      type: "string",
      visible: true,
      filterable: true,
      editable: false
    },
    {
      name: "logs_panel",
      type: "boolean",
      visible: false,
      editable: false
    },
    {
      name: "repeat",
      type: "boolean",
      visible: false,
      editable: false
    },
    {
      name: "accept",
      type: "boolean",
      visible: false,
      editable: false
    },
    {
      name: "show_to_client",
      type: "boolean",
      visible: true,
      editable: true
    },
    {
      name: "invisibility_exp_date",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "tf_by_plan_description",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  getData(data, cb) {
    this.collection = "vw_transfers";
    this.dbCollection = this.src.db.collection("vw_transfers");
    this.callParent(arguments);
  },

  //get transfers by order id
  getOrder(params) {
    if (params._filters) {
      for (let f of params._filters) {
        if (f._property == "ref_id") return f._value;
      }
    }
    return;
  },

  //get transfers by user id
  getUser(params) {
    if (params._filters) {
      for (let f of params._filters) {
        if (f._property == "user_id") return f._value;
      }
    }
    return;
  },

  // get transfers by merchant id
  getMerchant(params) {
    if (params._filters) {
      for (let f of params._filters) {
        if (f._property == "merchant_id") return f._value;
      }
    }
    return;
  },

  /* scope:client */
  async refreshData(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("refreshData", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:client */
  async showClient(data) {
    return new Promise((resolve) => {
      this.runOnServer("showClient", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $showClient(data, cb) {
    await this.src.db.collection("transfers").update(
      {
        id: data.id
      },
      {
        $set: {
          show_to_client: data.show_to_client
        }
      }
    );
    return cb({ success: true });
  },

  // /* scope:client */
  // async getCount(cb) {
  //   this.runOnServer("getCount", {}, cb);
  // },

  // /* scope:server */
  // async $getCount(data, cb) {
  //   const res = await this.src.db.query(
  //     "SELECT count(*) FROM transfers WHERE held=true and canceled=false"
  //   );
  //   cb({
  //     count: res[0].count
  //   });
  // },

  /* scope:server */
  async afterGetData(data, cb) {
    if (!data || !data.length) return cb(data);
    const res = await this.src.db.collection("transactions").findAll({
      transfer_id: { $in: data.map((item) => item.id) }
    });

    const tx = {};
    const eventsNames = {
      "account-service:withdrawalCustomExchangeRate":
        "Withdrawal money outside",
      "account-service:deposit": "Deposit money into the system",
      "ccoin-service:completeTransfer":
        "Callback function for complete payments",
      "ccoin-service:deposit": "Callback function for deposit payments",
      "account-service:realmtransfer": "Inner transfer",
      // "account-service:bankCharge": "Bank charges",
      "account-service:doPipe": "Payment by plan"
    };
    let currencyList = await this.getCurrencyList();
    res.forEach(async (item) => {
      if (!tx[item.transfer_id]) tx[item.transfer_id] = [];
      item.amount = await this.roundCurrency({
        currency: item.currency_src,
        balance: item.amount,
        currencyList
      });
      item.exchange_amount = await this.roundCurrency({
        currency: item.currency_dst,
        balance: item.exchange_amount,
        currencyList
      });
      tx[item.transfer_id].push(item);
    });
    let i = 0;
    let acc_no_arr = [];

    await this.addPlanName(data);

    for (let item of data) {
      item.combo_event = eventsNames[item.event_name];
      item.data.crypto = true;

      parseStringObject(item.data.netData);
      function parseStringObject(o) {
        for (const prop in o) {
          if (typeof o[prop] !== "object") {
            try {
              o[prop] = JSON.parse(o[prop]);
            } catch (error) {}
          } else {
            parseStringObject(o[prop]);
          }
        }
      }

      item.data.netData = JSON.stringify(item.data.netData, null, 4);

      if (
        ["ccoin-service:completeTransfer", "ccoin-service:deposit"].includes(
          item.event_name
        )
      ) {
        item.data.callbackData = JSON.stringify(item.data, null, 4);
      }

      let to_curr = currencyList.filter(
        (el) => el.abbr == item.data.to_currency
      );
      let from_curr = currencyList.filter(
        (el) => el.abbr == item.data.currency
      );
      if (to_curr.length && from_curr.length)
        if (!to_curr[0].crypto && !from_curr[0].crypto)
          item.data.crypto = to_curr[0].crypto;
      item.data.finAmount = await this.roundCurrency({
        currency: item.data.to_currency,
        balance: item.data.finAmount,
        currencyList
      });

      if (item.event_name != "account-service:realmtransfer")
        item.data.sentAmount = await this.roundCurrency({
          currency: item.data.currency,
          balance: item.data.finAmount / item.data.custom_exchange_rate,
          currencyList
        });

      item.data.custom_exchange_rate = await this.roundCurrency({
        currency: item.data.to_currency,
        balance: item.data.custom_exchange_rate,
        currencyList
      });
      item.data.amount = await this.roundCurrency({
        currency: item.data.currency,
        balance: item.data.amount,
        currencyList
      });
      item.data.feesAndDeductions = await this.roundCurrency({
        currency: item.data.currency,
        balance:
          item.data.amount -
          item.data.finAmount / item.data.custom_exchange_rate,
        currencyList
      });
      for (let currentTransferTx of tx[item.id]) {
        currentTransferTx.amount = await this.roundCurrency({
          currency: currentTransferTx.currency_src,
          balance: currentTransferTx.amount,
          currencyList
        });
        currentTransferTx.exchange_amount = await this.roundCurrency({
          currency: currentTransferTx.currency_dst,
          balance: currentTransferTx.exchange_amount,
          currencyList
        });
      }
      data[i].transactions = tx[item.id] || [];
      data[i].amount = await this.roundCurrency({
        currency: data[i].data.currency
          ? data[i].data.currency
          : data[i].data.src_currency,
        balance: data[i].amount,
        currencyList
      });
      if (item.data.acc_no) acc_no_arr.push(item.data.acc_no);
      i++;
    }
    let addresses;
    
    if (acc_no_arr && acc_no_arr.length)
      addresses = await this.src.db
        .collection("account_crypto")
        .findAll({ acc_no: { $in: acc_no_arr } });
    if (addresses)
      for (let item of data) {
        item.monitoring_address = addresses.find((el) => {
          return el.acc_no == item.data.acc_no;
        });
      }

    if (data.length == 1) {
      const r = await this.src.db.query(
        `select id from cryptotx where transfer_id='${data[0].id}' order by ctime desc limit 1`
      );
      if (r && r.length) {
        data[0].txId = r[0].id;
      }
    }

    cb(data);
  },

  /* scope:server */
  async onChange(params, cb) {
    this.changeModelData(Object.getPrototypeOf(this).$className, "ins", params);
    if (!!cb) cb({ success: true });
  },

  /* scope:server */
  async getAccount(acc_no) {
    return await this.src.db.collection("accounts").findOne(
      {
        acc_no
      },
      { currency: 1, owner: 1 }
    );
  },

  /* scope:client */
  async getAccountByOrg(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getAccountByOrg", data, (res) => {
        resolve(res);
      });
    });
  },
  /* scope:server */
  async $getAccountByOrg(data, cb) {
    let res = await this.src.db
      .collection("vw_org_accounts")
      .findAll({ org: data.org, currency: data.curr });
    if (res && res.length) return cb(res[0]);
    else return cb({});
  },

  /* scope:server */
  async $changeStatus(data) {
    return await this.src.db.collection("transfers").update(
      {
        id: data.id
      },
      {
        $set: {
          status: data.status
        }
      }
    );
  },

  /* scope:server */
  async $calculateResult(data, cb) {
    let res = await this.src.db.collection("currency_values").findAll({
      abbr: { $in: [data.from_curr, data.to_curr] }
    });
    let from_currObj = res.filter((row) => row.abbr == data.from_curr);
    let to_currObj = res.filter((row) => row.abbr == data.to_curr);
    return from_currObj[0].value && to_currObj[0].value
      ? cb({
          result_amount:
            (data.amount / from_currObj[0].value) * to_currObj[0].value
        })
      : cb({ result_amount: 0 });
  },

  /* scope:server */
  async $checkTechAcc(data, cb) {
    let tech_acc = await this.src.db
      .collection("vw_realmaccounts")
      .findOne({ currency: data.currency, owner: data.realm, type: 2 });
    data.val = data.val.replace(",", ".");
    return Number(data.val) > Number(tech_acc.balance) ? cb(false) : cb(true);
  },

  /* scope:client */
  async getLatestRate(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getLatestRate", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getLatestRate(data, cb) {
    let res = await this.callApi({
      service: "ccoin-service",
      method: "getExchangeRate",
      data: {
        currency_from: data.currency,
        currency_to: data.to_currency,
        amount: data.amount
      },
      realm: null
    });

    return cb(res);
  },

  /* scope:client */
  async getCurrency(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getCurrency", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getCurrency(data, cb) {
    let res = await this.src.db
      .collection("currency")
      .findOne({ abbr: data.abbr });

    return cb(res);
  },

  /* scope:client */
  async getTechAccount(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getTechAccount", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getTechAccount(data, cb) {
    let res = await this.src.db
      .collection("vw_withdraval_accounts")
      .findAll({ merchant: data.user, currency: data.currency });

    return cb(res);
  },

  /* scope:client */
  async getIban(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getIban", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getIban(data, cb) {
    let res = await this.src.db
      .collection("vw_org_ibans")
      .findAll({ org: data.merchant, currency: data.currency });

    return cb(res);
  },

  /* scope:client */
  async getWallet(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getWallet", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getWallet(data, cb) {
    let res = await this.src.db
      .collection("vw_org_wallets")
      .findAll({ org: data.merchant, curr_name: data.currency });

    return cb(res);
  },

  /* scope:client */
  async checkLimit(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("checkLimit", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $checkLimit(data, cb) {
    let rate = await this.src.db
      .collection("currency_values")
      .findOne({ abbr: data.currency });
    if (
      parseFloat(data.amount) * rate.value >
      parseFloat(this.config.tx_limit_in_usd)
    )
      return cb({
        result: true,
        tx_limit: parseFloat(this.config.tx_limit_in_usd)
      });
    return cb({
      result: false,
      tx_limit: parseFloat(this.config.tx_limit_in_usd)
    });
  },

  /* scope:client */
  async getSystemFeeByOrgIg(merchant_id, tariff) {
    return new Promise((resolve, reject) => {
      this.runOnServer(
        "getSystemFeeByOrgIg",
        { merchant_id, tariff },
        (res) => {
          resolve(res);
        }
      );
    });
  },

  /* scope:server */
  async $getSystemFeeByOrgIg(data, cb) {
    let fee = null;
    let tariff = data.tariff;
    let res = await this.src.db
      .collection("merchants")
      .findOne(
        { id: data.merchant_id },
        { user_id: 1, tariff: 1, variables: 1 }
      );
    if (res) {
      if (res.variables) {
        fee = this.getSysFeeVar(res.variables);
        if (fee !== null) return cb({ fee });
      }
      if (!tariff) tariff = res.tariff;
    }
    res = await this.src.db
      .collection("users")
      .findOne({ id: res.user_id }, { tariff: 1, variables: 1 });
    if (res) {
      if (res.variables) {
        fee = this.getSysFeeVar(res.variables);
        if (fee !== null) return cb({ fee });
      }
      if (!tariff) tariff = res.tariff;
    }
    if (tariff) {
      fee = await this.getSysFeesFromTariffPlan(tariff);
    }
    return cb({ fee });
  },

  /* scope:server */
  async getSysFeesFromTariffPlan(tariff) {
    let fee;
    let res = await this.src.db
      .collection("tariffplans")
      .findOne({ id: tariff }, { tariffs: 1, variables: 1 });
    if (res.variables) {
      fee = this.getSysFeeVar(res.variables);
      if (fee !== null) return fee;
    }

    res = await this.src.db
      .collection("tariffs")
      .findAll({ id: { $in: res.tariffs } }, { variables: 1 });

    for (let t of res) {
      fee = this.getSysFeeVar(t.variables);
      if (fee !== null) return fee;
    }

    return 0;
  },

  /* scope:server */
  getSysFeeVar(vars) {
    for (let v of vars) {
      if (v.key == "SYS_FEES") return parseFloat(v.value) / 100;
    }
    return null;
  },

  /* scope:client */
  importDataFromFile(data, cb) {
    this.runOnServer("importDataFromFile", data, (res) => {
      cb(res);
    });
  },

  /* scope:client */
  async getOrderById(order_id, tariff) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getOrderById", { order_id }, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getOrderById(data, cb) {
    const res = await this.src.db.query("select * from orders  where id = $1", [
      data.order_id.id
    ]);
    return res && res[0] ? cb(res[0]) : cb(null);
  },

  /* scope:server */
  async $importDataFromFile(data, cb) {
    const fn = `${this.config.uploadTmpDir}/${data.tmpName}`;

    let bank_conf = await this.src.db
      .collection("directory_banks")
      .findOne({ id: data.data.bank });

    let rows_to_skip = bank_conf.skip_rows;

    if (data.data.rows_to_skip) rows_to_skip = Number(data.data.rows_to_skip);

    const rows = await this.readFromXls(fn, rows_to_skip);
    fs.unlink(fn, function() {});

    for (const row of rows) {
      if (row.Betrag && row.Betrag.toString().charAt(0) != "-")
        row.Betrag = (
          (parseFloat(row.Betrag) * 100) /
          (100 - bank_conf.fee_percent)
        ).toFixed(2);

      if (row["Betrag ()"] && row["Betrag ()"].toString().charAt(0) != "-")
        row["Betrag ()"] = (
          (parseFloat(row["Betrag ()"]) * 100) /
          (100 - bank_conf.fee_percent)
        ).toFixed(2);
    }

    cb({
      rows,
      bank_conf,
      file_name: data.fileName,
      currency: data.data.currency
    });
  },

  /* scope:client */
  importDataFromGrid(data, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("importDataFromGrid", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $importDataFromGrid(data, cb) {
    const rows = data.rows;
    const bank_conf = data.bank_conf;
    const file_name = data.file_name;
    const currency = data.currency;

    const res = await this.prepareXlsReadResult(
      rows,
      currency,
      bank_conf,
      file_name
    );
    cb(res);
  },

  /* scope:server */
  readFromXls(input, rowsToSkip) {
    return new Promise((res, rej) => {
      node_xj(
        {
          input,
          //sheet: "sheetname", // specific sheetname
          rowsToSkip,
          allowEmptyKey: false
        },
        async (err, result) => {
          if (err) {
            rej(err);
          } else {
            res(result);
          }
        }
      );
    });
  },

  /* scope:server */
  async prepareDate(date) {
    const regex = /\//g;
    date = date.replace(regex, ".");
    let parts = date.split(".");

    if (parts.length < 3) return date;
    let date_to = new Date(
      parts[2].length > 2 ? Number(parts[2]) : "20" + Number(parts[2]),
      Number(parts[1]) - 1,
      Number(parts[0])
    );

    date_to = `${date_to.getFullYear()}/${date_to.getMonth() +
      1}/${date_to.getDate()}`;
    return date_to;
  },

  /* scope:server */
  async prepareXlsReadResult(rows, currency, bank_conf, file) {
    let out = {
      provided: 0,
      skipped: 0,
      noOrderRows: [],
      existsRows: [],
      deposit_errors: 0,
      depositErrorRows: []
    };
    let out_for_audit = [];

    for (let row of rows) {
      let order_data;
      let res = 0;
      if (
        (row.Betrag && row.Betrag.toString().charAt(0) != "-") ||
        (row["Betrag ()"] && row["Betrag ()"].toString().charAt(0) != "-")
      ) {
        res = await this.prepareOneRow(row, currency, bank_conf);
      }

      let preview = { ...row };

      let html_out = "<p>";
      for (const key of Object.keys(preview)) {
        html_out += `${key}: <b>${preview[key]}</b><br>`;
      }
      html_out += "</p>";

      if (res === 1 || res === 0) {
        out.skipped++;
        out.noOrderRows.push({ data: preview, html: html_out });
      } else if (res === 2) {
        out.skipped++;
        out.existsRows.push({ data: preview, html: html_out });
      } else if (res == 4) {
        out.deposit_errors++;
        out.depositErrorRows.push({ data: preview, html: html_out });
      } else out.provided++;

      order_data = await this.prepareOneRow(row, currency, bank_conf, true);

      let deposit_date = row.Buchungsdatum
        ? await this.prepareDate(row.Buchungsdatum)
        : row.Datum
        ? await this.prepareDate(row.Datum)
        : row.Buchungstag
        ? await this.prepareDate(row.Buchungstag)
        : new Date();

      let amount = null;
      if (bank_conf.bank_name == "Postbank") {
        let betrag = row.Betrag
          ? row.Betrag.toString()
          : row["Betrag ()"].toString();
        amount = parseFloat(betrag.replace(".", "").replace(",", "."));
      } else {
        let betrag = row.Betrag
          ? row.Betrag.toString()
          : row["Betrag ()"].toString();
        amount = parseFloat(betrag);
      }

      out_for_audit.push({
        id: this.src.db.createObjectId(),
        reason:
          res === 1
            ? "No order"
            : res === 2
            ? "Exists"
            : res == 4
            ? "Deposit error"
            : res == 0
            ? "Outgoing transfer"
            : "",
        amount: amount,
        deposit_to: res == 0 ? "-" : order_data.org_name,
        deposit_date,
        order_id: order_data.res ? order_data.res.id : null,
        organisation_id: order_data.res ? order_data.res.organisation : null,
        order_name: order_data.res
          ? `Number - ${order_data.res.order_num} | ${order_data.res.currency} -> ${order_data.res.res_currency}`
          : null,
        currency,
        bank: bank_conf.bank_name,
        ctime: new Date(),
        mtime: new Date(),
        removed: 0,
        file_name: file,
        status: res == 3 ? 1 : 0,
        outtx_name: res == 0 ? order_data.org_name : "-",
        type: res == 0 ? 0 : 1
      });
    }

    for (const bad_deposit of out_for_audit) {
      await this.src.db.collection("tmp_deposit_imports").insert(bad_deposit);
    }

    if (out.provided == 0 && out.skipped == 0 && out.deposit_errors == 0)
      out.no_deposits = true;

    return out;
  },

  /* scope:server */
  async prepareOneRow(row, currency, bank_conf, for_audit) {
    let order;
    switch (bank_conf.bank_name) {
      case "Maerki Baumann":
        order = await this.getMaerkiOrder(row, currency);
        break;
      case "Postbank":
        order = await this.getPostbankOrder(row, currency);
        break;
      case "Sparkasse":
        order = await this.getSparkasseOrder(row, currency);
        break;
      default:
        console.log("NO BANK BANKE:", bank_conf);
    }

    if (for_audit) return order;

    if (!order.res) return 1;
    if (await this.checkDepositInOrder(row, order.res.id)) return 2;
    const res = await this.sendDeposit(
      order.res,
      row,
      currency,
      order.deposit_date,
      bank_conf.bank_name
    );
    return res ? 3 : 4;
  },

  /* scope:server */
  async getMaerkiOrder(row, currency, for_audit) {
    if (row.Betrag && row.Betrag.toString().charAt(0) == "-")
      return { res: null, org_name: row.Buchungstext };

    let org_name = row.Buchungstext.substring(
      "Bankenclearing-Vergütung ".length
    );
    let custom_org_name = await this.src.db
      .collection("cstm_merchants_for_deposits")
      .findOne({
        custom_name: org_name
      });

    if (custom_org_name) {
      const res = await this.src.db.query(
        "select o.* from vw_orders o where o.status='1' and o.currency=$1 and o.organisation_name=$2",
        [currency, custom_org_name.merchant_name]
      );
      return {
        res: res && res[0] ? res[0] : null,
        org_name: custom_org_name.merchant_name,
        deposit_date: await this.prepareDate(row.Datum)
      };
    }

    if (currency == "EUR") {
      const res = await this.src.db.query(
        "select o.* from vw_orders o where o.status='1' and o.currency=$1 and o.organisation_name=$2",
        [currency, org_name]
      );

      return {
        res: res && res[0] ? res[0] : null,
        org_name,
        deposit_date: await this.prepareDate(row.Datum)
      };
    }

    if (currency == "USD") {
      account_num = row.Buchungstext.split("/");
      account_num = account_num[account_num.length - 1].trim();
      const org = await this.src.db.query(
        `select name from vw_merchants where contract_acc_no @> '{"${account_num}"}';`,
        []
      );

      if (org && org.length) {
        const res = await this.src.db.query(
          "select o.* from vw_orders o where o.status='1' and o.currency=$1 and o.organisation_name=$2",
          [currency, org[0].name]
        );
        return {
          res: res && res[0] ? res[0] : null,
          org_name: org[0].name,
          deposit_date: await this.prepareDate(row.Datum)
        };
      }
    }
    return { res: null, org_name: row.Buchungstext };
  },

  /* scope:server */
  async getPostbankOrder(row, currency, for_audit) {
    if (row["Betrag ()"] && row["Betrag ()"].toString().charAt(0) == "-")
      return { res: null, org_name: row.Auftraggeber };

    let custom_org_name = await this.src.db
      .collection("cstm_merchants_for_deposits")
      .findOne({
        custom_name: row.Auftraggeber
      });

    if (custom_org_name) {
      const res = await this.src.db.query(
        "select o.* from vw_orders o where o.status='1' and o.currency=$1 and o.organisation_name=$2",
        [currency, custom_org_name.merchant_name]
      );
      return {
        res: res && res[0] ? res[0] : null,
        org_name: custom_org_name.merchant_name,
        deposit_date: await this.prepareDate(row.Buchungsdatum)
      };
    }

    const res = await this.src.db.query(
      "select o.* from vw_orders o where o.status='1' and o.currency=$1 and o.organisation_name=$2",
      [currency, row.Auftraggeber]
    );
    return {
      res: res && res[0] ? res[0] : null,
      org_name: row.Auftraggeber,
      deposit_date: await this.prepareDate(row.Buchungsdatum)
    };
  },

  /* scope:server */
  async getSparkasseOrder(row, currency, for_audit) {
    if (row.Betrag && row.Betrag.toString().charAt(0) == "-")
      return { res: null, org_name: row["Beguenstigter/Zahlungspflichtiger"] };

    let custom_org_name = await this.src.db
      .collection("cstm_merchants_for_deposits")
      .findOne({
        custom_name: row["Beguenstigter/Zahlungspflichtiger"]
      });

    if (custom_org_name) {
      const res = await this.src.db.query(
        "select o.* from vw_orders o where o.status='1' and o.currency=$1 and o.organisation_name=$2",
        [currency, custom_org_name.merchant_name]
      );
      return {
        res: res && res[0] ? res[0] : null,
        org_name: custom_org_name.merchant_name,
        deposit_date: await this.prepareDate(row.Buchungstag)
      };
    }

    let org_name = row["Beguenstigter/Zahlungspflichtiger"].split("/");

    if (org_name && org_name.length) {
      org_name = org_name[org_name.length - 1].trim();
      const res = await this.src.db.query(
        "select o.* from vw_orders o where o.status='1' and o.currency=$1 and o.organisation_name=$2",
        [currency, org_name]
      );

      return {
        res: res && res[0] ? res[0] : null,
        org_name:
          res && res[0] ? org_name : row["Beguenstigter/Zahlungspflichtiger"],
        deposit_date: await this.prepareDate(row.Buchungstag)
      };
    }

    /*
    const org = await this.src.db.query(
      `select name from vw_merchants where contract_acc_no @> '{"${account_num}"}';`,
      []
    );

    if (org && org.length) {
      const res = await this.src.db.query(
        "select o.* from vw_orders o where o.status='1' and o.currency=$1 and o.organisation_name=$2",
        [currency, org[0].name]
      );
      return {
        res: res && res[0] ? res[0] : null,
        org_name: org[0].name,
        deposit_date: await this.prepareDate(row.Buchungstag)
      };
    }
*/

    return {
      res: null,
      org_name: row["Beguenstigter/Zahlungspflichtiger"]
    };
  },

  /* scope:server */
  async checkDepositInOrder(row, order_id) {
    const transfers = await this.src.db
      .collection("transfers")
      .findAll({ ref_id: order_id, event_name: "account-service:deposit" });

    let betrag = row.Betrag ? row.Betrag : row["Betrag ()"];

    for (let transfer of transfers) {
      if (parseFloat(transfer.data.amount) == parseFloat(betrag)) return true;
    }

    return false;
  },

  /* scope:server */
  async sendDeposit(order, row, currency, deposit_date, bank_name) {
    const realm = await this.getRealmByUser(order.merchant);

    if (!realm) return;

    const acc_no = await this.getAccountByMerchantCurrency(
      order.organisation,
      currency
    );

    if (!acc_no) return;

    let amount = null;
    if (bank_name == "Postbank") {
      let betrag = row.Betrag
        ? row.Betrag.toString()
        : row["Betrag ()"].toString();
      amount = parseFloat(betrag.replace(".", "").replace(",", "."));
    } else {
      let betrag = row.Betrag
        ? row.Betrag.toString()
        : row["Betrag ()"].toString();
      amount = parseFloat(betrag);
    }

    const data = {
      service: "account-service",
      method: "deposit",
      data: {
        ref_id: order.id,
        acc_no,
        amount: amount,
        currency,
        user_id: order.merchant,
        merchant_id: order.organisation,
        merchant: order.organisation,
        deposit_date: deposit_date
          ? new Date(new Date(deposit_date).setHours(12))
          : null,
        Datum: row.Datum,
        Valuta: row.Valuta,
        bank: bank_name,
        show_to_client: row.show_to_client,
        description: row.description,
        organisation_name: order.organisation_name
      },
      realm: realm,
      user: order.merchant
    };
    const res = await this.callApi(data);
    return res && res.result && res.result.id;
  },

  /* scope:server */
  async getRealmByUser(user_id) {
    const res = await this.src.db
      .collection("users")
      .findOne({ id: user_id }, { realm: 1 });
    return res ? res.realm : null;
  },

  /* scope:server */
  async getAccountByMerchantCurrency(merchant_id, currency) {
    const res = await this.src.db.query(
      "select a.acc_no from accounts a, merchant_accounts m where m.id_merchant=$1 and a.id=m.id_account and a.currency=$2",
      [merchant_id, currency]
    );
    return res && res[0] ? res[0].acc_no : null;
  },

  /* scope:client */
  async getDefaultRealm(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getDefaultRealm", {}, resolve);
    });
  },

  /* scope:server */
  async $getDefaultRealm(params, cb) {
    let res = await this.src.db.collection("realms").findOne({
      admin_realm: true
    });
    cb(res ? res.id : {});
  },

  /* scope:client */
  async moveTransfers(data, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("moveTransfers", data, resolve);
    });
  },

  /* scope:server */
  async $moveTransfers(data, cb) {
    if (data.to_order && data.transfers && data.transfers.length) {
      let sqlPlaceHolders = [];
      let sql = `update transfers set ref_id = '${data.to_order}' where id in (`;
      for (const transfer of data.transfers) {
        sqlPlaceHolders.push(transfer);
        sql += `$${sqlPlaceHolders.length}`;
        if (data.transfers.length > sqlPlaceHolders.length) {
          sql += ",";
        }
      }
      sql += ")";
      cb(await this.dbQuery(sql, sqlPlaceHolders));
    }

    cb({ success: false });
  },

  /* scope:server */
  dbQuery: function(sql, sqlPlaceHolders) {
    let me = this;
    return new Promise((res, rej) => {
      me.src.db.query(sql, sqlPlaceHolders, function(e, data) {
        if (e) {
          res({ error: "DB error" });
        }
        res(data);
      });
    });
  },

  /* scope:server */
  async addPlanName(data) {
    let plans_ids = {};
    data.forEach((item) => {
      if (item.plan_transfer_id) plans_ids[item.plan_transfer_id] = 1;
    });
    plans_ids = Object.keys(plans_ids);
    if (!plans_ids.length) return;
    const res = await this.src.db.query(
      "SELECT t.id, p.name FROM transfers_plans t, accounts_plans p WHERE p.id=t.plan_id and t.id in ('" +
        plans_ids.join("','") +
        "')"
    );
    const items = {};
    res.forEach((item) => {
      items[item.id] = item.name;
    });
    let others = [];
    let i = 0;
    while (data[i]) {
      if (data[i].plan_transfer_id && items[data[i].plan_transfer_id]) {
        data[i].plan_name = items[data[i].plan_transfer_id];
        i++;
      } else {
        const item = { ...data[i] };
        item.plan_name = "";
        item.plan_transfer_id = "1";
        others.push(item);
        data.splice(i, 1);
      }
    }
    for (let item of others) data.push(item);
  },

  /* scope:client */
  async getLatestPlanTransfer(data) {
    return new Promise((resolve) => {
      this.runOnServer("getLatestPlanTransfer", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getLatestPlanTransfer(data, cb) {
    const res = await this.src.db.collection("transfers").findOne({
      id: data.transfer_id,
      held: true,
      canceled: false
    });

    return cb(res);
  }
});
