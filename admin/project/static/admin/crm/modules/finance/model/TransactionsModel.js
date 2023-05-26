Ext.define("Crm.modules.finance.model.TransactionsModel", {
  extend: "Crm.modules.transactions.model.TransactionsModel",

  mixins: ["Crm.modules.finance.model.Operations"], // scope:server

  /* scope:server */
  async beforeRead(params, find, cb) {
    this.qParams = params;
    this.find = this.buildTxWhere(params);
    cb(find);
  }
});
