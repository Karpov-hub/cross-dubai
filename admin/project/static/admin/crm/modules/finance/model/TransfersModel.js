Ext.define("Crm.modules.finance.model.TransfersModel", {
  extend: "Crm.modules.transfers.model.TransfersModel",

  readAll: function(callback, params) {
    params.sets = this.settings;
    this.runOnServer("read", params, callback);
  }
});
