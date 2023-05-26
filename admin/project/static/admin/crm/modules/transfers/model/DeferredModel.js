Ext.define("Crm.modules.transfers.model.DeferredModel", {
  extend: "Crm.classes.DataModel",

  collection: "vw_deferred_transfers",
  idField: "id",
  strongRequest: true,
  //showTags: true,
  //removeAction: "remove",
  mixins: ["Crm.modules.currency.model.CurrencyFunc"],

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
      name: "event_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "canceled",
      type: "boolean",
      sort: 1,
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "held",
      sort: -1,
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
      name: "status",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  async afterGetData(data, cb) {
    let currencyList = await this.getCurrencyList();
    for (let item of data) {
      item.amount = await this.roundCurrency({
        currency: item.data.currency,
        balance: item.amount,
        currencyList
      });
      item.data.custom_exchange_rate = await this.roundCurrency({
        currency: item.data.to_currency,
        balance: item.data.custom_exchange_rate,
        currencyList
      });
      item.data.finAmount = await this.roundCurrency({
        currency: item.data.to_currency,
        balance: item.data.finAmount,
        currencyList
      });
      item.data.amount = await this.roundCurrency({
        currency: item.data.currency,
        balance: item.data.amount,
        currencyList
      });
      item.data.sentAmount = await this.roundCurrency({
        currency: item.data.currency,
        balance: item.data.finAmount / item.data.custom_exchange_rate,
        currencyList
      });
    }
    cb(data);
  }
});
