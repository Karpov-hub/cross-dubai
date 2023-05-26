Ext.define("Admin.view.main.MasterModel", {
  extend: "Ext.app.ViewModel",

  constructor: function() {
    this.callParent(arguments);
    setInterval(() => {
      this.loadBlockchains();
    }, 300000);
  },

  async loadBlockchains() {
    if (!this.currencyModel)
      this.currencyModel = Ext.create(
        "Crm.modules.accounts.model.AccountsModel"
      );
    const arr = await this.currencyModel.callApi(
      "ccoin-service",
      "getSKBalance",
      {}
    );
    this.set("blockchains", arr);
    return arr;
  }
});
