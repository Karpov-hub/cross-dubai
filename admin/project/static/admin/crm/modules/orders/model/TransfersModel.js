Ext.define("Crm.modules.orders.model.TransfersModel", {
  extend: "Crm.modules.transfers.model.TransfersModel",
  mixins: [
    "Crm.modules.orders.model.UpdateDataFuncModel" // scope:server
  ],

  
  /* scope:client */
  getData(params, cb) {
    this.runOnServer("getData", { params }, cb);
  },

  /* scope:server */
  async $getData(params, cb) {
    this.getData(params, (res) => {
      return cb(res);
    });
  },
  /* scope:server */
  getData(params, cb) {
    let order_id = this.getOrder(params);
    if (order_id) {
      this.find = {
        $and: [
          {
            ref_id: order_id
          }
        ]
      };
    } else return cb({ total: 0, list: [] });
    this.callParent(arguments);
  }
});
