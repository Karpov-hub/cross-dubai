Ext.define("Crm.modules.orders.model.FilesModel", {
  extend: "Crm.modules.files.model.FilesModel",

  /* scope:server */
  getData(params, cb) {
    let order_id = this.getOrder(params);

    if (order_id) {
      this.find = {
        $and: [
          {
            owner_id: order_id
          }
        ]
      };
    } else return cb({ total: 0, list: [] });
    this.callParent(arguments);
  },

  /* scope:server */

  getOrder(params) {
    if (params._filters) {
      for (let f of params._filters) {
        if (f._property == "owner_id") return f._value;
      }
    }
  }
});
