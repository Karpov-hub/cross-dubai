Ext.define("Crm.modules.nilRatesHistory.model.AverageDailyHistoryModel", {
  extend: "Crm.classes.DataModel",

  collection: "average_rate_history",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "currencies_pair",
      type: "string",
      sort: 1,
      filterable: true,
      visible: true
    },
    {
      name: "buy",
      sort: 1,
      type: "integer",
      filterable: true,
      visible: true
    },
    {
      name: "sell",
      sort: 1,
      type: "integer",
      filterable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  getCurrencyPairs() {
    return new Promise((resolve) => {
      this.runOnServer("getCurrencyPairs", {}, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $getCurrencyPairs(data, cb) {
    let res = await this.src.db.query(
      `
        select currencies_pair "name" from daily_rate_history
        union
        select currencies_pair "name" from average_rate_history`,
      []
    );
    if (!res.length) res = [{ name: "No rate found" }];
    return cb(res);
  }
});
