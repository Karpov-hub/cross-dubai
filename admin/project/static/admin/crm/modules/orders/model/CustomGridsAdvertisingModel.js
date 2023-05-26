Ext.define("Crm.modules.orders.model.CustomGridsAdvertisingModel", {
  extend: "Crm.classes.DataModel",
  collection: "withdrawal_transfers",
  idField: "id",

  /* scope:client */
  loadGeneralStatsGridStore(data) {
    return new Promise((resolve) => {
      this.runOnServer("loadGeneralStatsGridStore", data, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $loadGeneralStatsGridStore(data, cb) {
    let res = await this.callApi({
      service: "report-service",
      method: "getAdvertisingData",
      data
    }).catch((e) => {
      return cb({ success: false });
    });
    return cb(res.result.stats[0].data || []);
  },

  /* scope:client */
  loadTranactionsGridStore(data) {
    return new Promise((resolve) => {
      this.runOnServer("loadTranactionsGridStore", data, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $loadTranactionsGridStore(data, cb) {
    let res = await this.callApi({
      service: "report-service",
      method: "getTransfers",
      data
    }).catch((e) => {
      return cb({ success: false });
    });
    let arr = [];
    for (let row of res.result.list) {
      arr.push({
        ctime: row.ctime,
        amount: row.data.amount,
        currency: row.data.currency,
        result_amount: row.data.result_amount,
        result_currency: row.data.to_currency,
        monitoring_address: row.monitoring_address
      });
    }
    return cb(arr);
  }
});
