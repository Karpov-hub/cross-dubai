const config = require("@lib/config"); // scope:server

Ext.define("Crm.modules.orders.model.UpdateDataFuncModel", {
  /* scope:server */
  async $refreshData(data, cb) {
    this.changeModelData(data.modelName, "ins", {});
    return cb(true);
  },

  /* scope:server */
  async $deletePermanent(data, cb) {
    if (config.allowDeleteOrdersAndTransfers) {
      let res = await this.callApi({
        service: "account-service",
        method: data.method,
        data: {
          id: data.data.id
        },
        realm: data.realm,
        user: data.user
      });
      return cb(res);
    } else return cb({ error: "REMOVINGNOTALLOWED" });
  }
});
