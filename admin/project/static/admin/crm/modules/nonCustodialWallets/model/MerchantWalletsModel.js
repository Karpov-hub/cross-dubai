Ext.define("Crm.modules.nonCustodialWallets.model.MerchantWalletsModel", {
  extend: "Crm.modules.nonCustodialWallets.model.WalletsModel",

  /* scope:server */
  getData(params, cb) {
    let merchant_id = null;

    if (params._filters || params.filters) {
      const filters = params.filters || params._filters;

      for (const f of filters) {
        if (f._property == "merchant_id" || f.property == "merchant_id") {
          merchant_id = f._value || f.value;
        }
      }
    }

    if (merchant_id) {
      this.find = {
        $and: [
          {
            merchant_id
          }
        ]
      };
    } else {
      return cb({ total: 0, list: [] });
    }

    this.callParent(arguments);
  }
});
