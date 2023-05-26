Ext.define("Crm.modules.accounts.model.ClientAccountsWithGasModel", {
  extend: "Crm.modules.accounts.model.AccountsWithGasModel",

  /* scope:server */
  updateGridData() {
    this.changeModelData(
      "Crm.modules.accounts.model.ClientAccountsWithGasModel",
      "ins",
      {}
    );
    return;
  },

  getData(params, cb) {
    const find_arr = [];
    let owner_id = null;

    this.find = {
      $and: []
    };

    if (params._filters || params.filters) {
      const filters = params.filters || params._filters;
      if (filters[0].property == "id") {
        return this.callParent(arguments);
      }
      for (const f of filters) {
        if (f._property == "owner_id" || f.property == "owner_id") {
          owner_id = f._value || f.value;
        }
      }
    }

    if (owner_id) {
      find_arr.push({
        owner_id
      });
    }

    if (!find_arr.length) {
      return cb({ total: 0, list: [] });
    }

    this.callParent(arguments);
  }
});
