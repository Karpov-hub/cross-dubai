Ext.define("Admin.view.main.AlertModel", {
  extend: "Ext.app.ViewModel",

  constructor: function() {
    this.callParent(arguments);
    setInterval(() => {
      this.checkAlert();
    }, 50000);
  },

  async checkAlert(params) {
    if (!this.currencyModel)
      this.currencyModel = Ext.create(
        "Crm.modules.accounts.model.AccountsModel"
      );
    const data = await this.currencyModel.callApi(
      "ccoin-service",
      "masterWalletBalance",
      { getClbk: true, hide_label: params ? params.hide_label : false }
    );

    return data;
  }
});
