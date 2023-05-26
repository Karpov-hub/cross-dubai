Ext.define("Crm.modules.transactions.model.TransactionsModel", {
  extend: "Crm.classes.DataModel",

  collection: "vw_trancactions",
  idField: "id",
  strongRequest: true,
  //removeAction: "remove",

  mixins: ["Crm.modules.currency.model.CurrencyFunc"],

  fields: [
    {
      name: "id",
      type: "ObjectID",
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
      editable: false,
      visible: true
    },
    {
      name: "transfer_id",
      type: "ObjectID",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "tariff_id",
      type: "ObjectID",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "plan_id",
      type: "ObjectID",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "held",
      type: "boolean",
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
      name: "exchange_amount",
      type: "float",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "acc_src",
      type: "string",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "acc_dst",
      type: "string",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "tariff",
      type: "string",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "plan",
      type: "string",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "ref_id",
      type: "string",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "canceled",
      type: "boolean",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "description_src",
      type: "string",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "description_dst",
      type: "string",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "currency_src",
      type: "string",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "currency_dst",
      type: "string",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "src_acc_name",
      type: "string",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "dst_acc_name",
      type: "string",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "merchant_name",
      type: "string",
      filterable: false,
      editable: false,
      visible: true
    }
  ],

  getFindAcc(params) {
    if (params._filters) {
      for (let f of params._filters) {
        if (f._property == "acc_find") return f._value;
      }
    }
    return;
  },

  async afterGetData(data, callback) {
    let currencyList = await this.getCurrencyList();
    for (let item of data) {
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
    }
    return callback(data);
  }
});
