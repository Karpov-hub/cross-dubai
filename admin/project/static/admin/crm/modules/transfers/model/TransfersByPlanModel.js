Ext.define("Crm.modules.transfers.model.TransfersByPlanModel", {
  extend: "Crm.classes.DataModel",

  mixins: [
    "Crm.modules.orders.model.UpdateDataFuncModel", // scope:server
    "Crm.modules.currency.model.CurrencyFunc"
  ],

  collection: "vw_plan_transfers",
  idField: "id",
  strongRequest: true,
  showTags: true,

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
      type: "bool",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "hash",
      type: "string",
      visible: true,
      filterable: true,
      editable: false
    },
    {
      name: "exchange_price",
      type: "string",
      visible: true,
      filterable: true,
      editable: false
    },
    {
      name: "exchange_quantity",
      type: "string",
      visible: true,
      filterable: true,
      editable: false
    }
  ],

  /* scope:client */
  async refreshData(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("refreshData", data, (res) => {
        resolve(res);
      });
    });
  },

  // /* scope:client */
  // async getCount(cb) {
  //   this.runOnServer("getCount", {}, cb);
  // },

  // /* scope:server */
  // async $getCount(data, cb) {
  //   const res = await this.src.db.query(
  //     "SELECT count(*) FROM vw_plan_transfers WHERE held=true and canceled=false"
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
    let currencyList = await this.getCurrencyList();

    for (const item of res) {
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
    }

    let i = 0;
    let acc_no_arr = [];
    await this.addPlanName(data);

    for (let item of data) {
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

      item.amount = await this.roundCurrency({
        currency: item.currency,
        balance: item.amount,
        currencyList
      });

      if (item.data.netData && item.data.netData.exchange) {
        item.exchange_quantity =
          item.data.netData.exchange.side == "sell"
            ? item.exchange_quantity * item.exchange_price
            : item.exchange_quantity;
      }

      for (let currentTransferTx of tx[item.id]) {
        if (currentTransferTx.txtype == "transfer") {
          item.sent_amount =
            currentTransferTx.amount + " " + currentTransferTx.currency_src;
        }
      }
      data[i].transactions = tx[item.id] || [];

      acc_no_arr.push(item.data.acc_no);
      i++;
    }

    cb(data);
  },

  /* scope:server */
  async onChange(params, cb) {
    this.changeModelData(Object.getPrototypeOf(this).$className, "ins", params);
    if (!!cb) cb({ success: true });
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
  }
});
