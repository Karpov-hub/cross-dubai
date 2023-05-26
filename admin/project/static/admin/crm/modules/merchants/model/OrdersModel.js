Ext.define("Crm.modules.merchants.model.OrdersModel", {
  extend: "Crm.modules.orders.model.OrdersModel",

  /* scope:server */
  getData(params, cb) {
    let merchant_id = null;
    if (params._filters) {
      for (let f of params._filters) {
        if (f._property == "organisation") merchant_id= f._value;
      }
    }
    if (merchant_id) {
      this.find = {
        $and: [
          {
            organisation: merchant_id
          }
        ]
      };
    } else return cb({ total: 0, list: [] });
    this.callParent(arguments);
  }
});
