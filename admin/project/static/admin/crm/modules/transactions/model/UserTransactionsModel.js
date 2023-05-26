Ext.define("Crm.modules.transactions.model.UserTransactionsModel", {
  extend: "Crm.modules.transactions.model.TransactionsModel",

  /* scope:server */
  async buildWhere(params, callback) {
    const user_id = this.getFilterByName(params, "user_id");
    const transfer_id = this.getFilterByName(params, "transfer_id");

    if (user_id) {
      let res = await this.src.db
        .collection("accounts")
        .findAll({ owner: user_id.value }, { acc_no: 1 });
      if (res && res.length) {
        this.myAccounts = res.map(item => item.acc_no);
        this.find = {
          $or: [
            { acc_src: { $in: this.myAccounts } },
            { acc_dst: { $in: this.myAccounts } }
          ]
        };
      }
    } else if (transfer_id) {
      this.find = { transfer_id: transfer_id.value };
    }
    if (!this.find) this.find = { id: null };

    this.db.buildWhere(params, this, callback);
  },

  /* scope:server */
  afterGetData(data, cb) {
    this.callParent(arguments)
    if (!this.myAccounts || !data) return cb(data);
    data.forEach(item => {
      if (this.myAccounts.includes(item.acc_src)) {
        item.description = item.description_src;
        item.currency = item.currency_src;
        item.amount *= -1; // outgoing transactions
      } else {
        item.description = item.description_dst;
        item.currency = item.currency_dst;
      }
    });

    cb(data);
  }
});
