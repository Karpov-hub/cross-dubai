Ext.define("Admin.view.main.NFModel", {
  extend: "Ext.app.ViewModel",

  constructor: function() {
    this.callParent(arguments);
    setInterval(() => {
      this.loadBlockchains();
    }, 60000);
  },

  async loadBlockchains() {
    if (!this.currencyModel)
      this.currencyModel = Ext.create(
        "Crm.modules.accounts.model.AccountsModel"
      );
    const arr = await this.currencyModel.callApi(
      "ccoin-service",
      "getLatestFees",
      {}
    );
    const out = [];

    for (const v of arr) {
      out.push({
        abbr: v.abbr,
        fee: v.EUR,
        cryptoFee: v[v.abbr]
      });
    }

    this.set("blockchains", out);
    return out;
  }
});
