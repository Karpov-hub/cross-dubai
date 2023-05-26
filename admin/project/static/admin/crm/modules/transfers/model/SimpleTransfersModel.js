Ext.define("Crm.modules.transfers.model.SimpleTransfersModel", {
  extend: "Crm.classes.ClientFilteredModel",

  filterParam: [
    { entity: "merchant", field: "sender_id" },
    { entity: "merchant", field: "receiver_id" }
  ],

  collection: "vw_simple_transfers",
  idField: "id",
  strongRequest: true,

  mixins: [
    "Crm.modules.currency.model.CurrencyFunc",
    "Crm.modules.orders.model.TransfersFunctions"
  ],

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "plan_name",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "sender_address",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "sender_id",
      type: "ObjectID",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "sender",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "receiver_address",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "receiver_id",
      type: "ObjectID",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "receiver",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "amount",
      type: "float",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "currency",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "result_amount",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "result_currency",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "hash",
      type: "string",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "hash_url",
      type: "string",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "fee",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "fee_currency",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "status",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "status",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "started",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "finished",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ui_description",
      type: "string",
      filterable: true,
      editable: true,
      visible: false
    },
    {
      name: "admin_description",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "errors",
      type: "object",
      filterable: false,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  async getCount(cb) {
    this.runOnServer("getCount", {}, cb);
  },

  /* scope:server */
  async $getCount(data, cb) {
    const res = await this.src.db.query(
      "SELECT count(*) FROM vw_simple_transfers WHERE status = 'PENDING'"
    );
    cb({
      count: res[0].count
    });
  },

  /* scope:server */
  async afterGetData(data, cb) {
    let currency_list = await this.getCurrencyList();
    currency_list = this.prepareDecimals(currency_list);
    for (let item of data) {
      item.amount = this.fixDecimalLength(
        item.amount,
        item.currency,
        currency_list
      );
      item.result_amount = this.fixDecimalLength(
        item.result_amount,
        item.result_currency,
        currency_list
      );
      item.fee = this.fixDecimalLength(
        item.fee,
        item.fee_currency,
        currency_list
      );
    }
    return cb(data);
  },

  /* scope:server */
  fixDecimalLength(amount, currency, list) {
    return amount ? Number(amount).toFixed(list[currency]) : "";
  },

  /* scope:server */
  prepareDecimals(currency_list) {
    if (!currency_list || !currency_list.length) return {};
    let out = {};
    for (let item of currency_list)
      out[item.abbr] = item.decimal || item.decimal === 0 ? item.decimal : 2;
    return out;
  }
});
