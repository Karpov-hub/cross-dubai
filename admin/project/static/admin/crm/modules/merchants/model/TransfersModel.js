Ext.define("Crm.modules.merchants.model.TransfersModel", {
  extend: "Crm.modules.transfers.model.TransfersModel",

  /* scope:server */
  getData(params, cb) {
    let merchant_id = this.getMerchant(params);
    if (merchant_id) {
      this.find = {
        $and: [
          {
            merchant_id: merchant_id
          }
        ]
      };
    } else return cb({ total: 0, list: [] });
    this.callParent(arguments);
  }
});
