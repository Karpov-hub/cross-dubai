Ext.define("Crm.modules.accountHolders.model.TransfersModel", {
  extend: "Crm.modules.transfers.model.TransfersModel",

  /* scope:server */
  getData(params, cb) {
    let user_id = this.getUser(params);
    if (user_id) {
      this.find = {
        $and: [
          {
            user_id: user_id
          }
        ]
      };
    } else return cb({ total: 0, list: [] });
    this.callParent(arguments);
  }
});
