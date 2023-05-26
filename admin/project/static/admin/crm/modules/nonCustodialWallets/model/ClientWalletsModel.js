Ext.define("Crm.modules.nonCustodialWallets.model.ClientWalletsModel", {
  extend: "Crm.modules.nonCustodialWallets.model.WalletsModel",

  /* scope:server */
  getData(params, cb) {
    let user_id = null;

    if (params._filters || params.filters) {
      const filters = params.filters || params._filters;

      for (const f of filters) {
        if (f._property == "user_id" || f.property == "user_id") {
          user_id = f._value || f.value;
        }
      }
    }

    if (user_id) {
      this.find = {
        $and: [
          {
            user_id
          }
        ]
      };
    } else {
      return cb({ total: 0, list: [] });
    }

    this.callParent(arguments);
  }
});
