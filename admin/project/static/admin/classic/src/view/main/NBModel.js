Ext.define("Admin.view.main.NBModel", {
  extend: "Ext.app.ViewModel",

  constructor: function() {
    this.callParent(arguments);
    setInterval(() => {
      this.loadNilBalances();
    }, 300000);
  },

  async loadNilBalances() {
    if (!this.currencyModel)
      this.currencyModel = Ext.create(
        "Crm.modules.accounts.model.AccountsModel"
      );

    const out = [];
    const response = await this.currencyModel.callApi(
      "falcon-service",
      "getBalance",
      {}
    );

    for (const [abbr, balance] of Object.entries(response)) {
      out.push({ abbr, balance });
    }

    this.set("nil_balances", out);
    return out;
  }
});
