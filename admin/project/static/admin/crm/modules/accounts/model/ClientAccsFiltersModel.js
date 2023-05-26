Ext.define("Crm.modules.accounts.model.ClientAccsFiltersModel", {
  extend: "Crm.modules.accounts.model.AccountsModel",

  /* scope:server */
  getData(params, cb) {
    let owner = null;
    if (params._filters || params.filters) {
      let filters = params.filters || params._filters;
      for (let f of filters) {
        if (f._property == "owner" || f.property == "owner")
          owner = f._value || f.value;
      }
    }
    if (owner) {
      this.find = {
        $and: [
          {
            owner
          }
        ]
      };
    } else return cb({ total: 0, list: [] });

    this.callParent(arguments);
  }
});
