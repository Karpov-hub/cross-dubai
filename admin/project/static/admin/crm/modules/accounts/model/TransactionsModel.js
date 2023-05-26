Ext.define("Crm.modules.accounts.model.TransactionsModel", {
  extend: "Crm.modules.transactions.model.TransactionsModel",

  /* scope:server */
  getData(params, cb) {
    let acc_no = this.getFindAcc(params);
    if (acc_no) {
      this.find = {
        $or: [
          {
            acc_src: acc_no
          },
          {
            acc_dst: acc_no
          }
        ]
      };
    } else return cb({ total: 0, list: [] });
    this.callParent(arguments);
  }
});
