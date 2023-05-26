Ext.define("Crm.modules.accounts.model.MerchantAccountsWithGasModel", {
  extend: "Crm.modules.accounts.model.AccountsWithGasModel",

  /* scope:server */
  updateGridData() {
    this.changeModelData(
      "Crm.modules.accounts.model.MerchantAccountsWithGasModel",
      "ins",
      {}
    );
    return;
  },

  /* scope:server */
  getData(params, cb) {
    let merchant_id = null,
      wallet_type = null;
    if (params._filters || params.filters) {
      let filters = params.filters || params._filters;
      if (filters[0].property == "id") return this.callParent(arguments);
      for (let f of filters) {
        if (f._property == "merchant_id" || f.property == "merchant_id") {
          merchant_id = f._value || f.value;
        }
        if (f._property == "wallet_type" || f.property == "wallet_type") {
          wallet_type = f._value || f.value || 0;
        }
      }
    }
    let find_arr = [];
    if (merchant_id) {
      find_arr.push({
        merchant_id
      });
    }
    if (wallet_type) find_arr.push({ wallet_type });

    if (!find_arr.length) return cb({ total: 0, list: [] });
    this.find = {
      $and: []
    };

    this.callParent(arguments);
  }
});
