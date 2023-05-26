Ext.define("Crm.modules.orders.model.TransfersFunctions", {

  /* scope:client */
  getLatestTransfer(data) {
    return new Promise((resolve) => {
      this.runOnServer("getLatestTransfer", data, resolve);
    });
  },

  /* scope:server */
  async $getLatestTransfer(data, cb) {
    let transfers = await this.src.db
      .collection("transfers")
      .findAll({ plan_transfer_id: data.id, held: true });
    if (!transfers.length) return cb({ status: "empty" });
    transfers.sort((tf1, tf2) => {
      if (tf1.ctime > tf2.ctime) return -1;
      if (tf1.ctime < tf2.ctime) return 1;
      return 0;
    });
    return cb(transfers[0]);
  }
});
