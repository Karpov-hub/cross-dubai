Ext.define("Crm.modules.transfers.model.LogsModel", {
  extend: "Crm.classes.DataModel",

  collection: "transfer_logs",
  idField: "id",
  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "transfer_id",
      type: "ObjectID",
      filterable: true,
      visible: true
    },
    {
      name: "code",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "message",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "data",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "request",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "ctime",
      type: "data",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  sendHandleCallback(data) {
    return new Promise((res) => {
      this.runOnServer("sendHandleCallback", data, res);
    });
  },

  /* scope:server */
  async $sendHandleCallback(data, cb) {
    const transfer = await this.src.db
      .collection("transfers")
      .findOne({ id: data.transfer_id });

    const monitoringAddress = await this.getMonitoringAddress(
      transfer.data.merchant,
      data.cb1.currency
    );

    if (!monitoringAddress)
      return cb({ result: "Monitoring address is not found" });

    const cb1_Data = {
      txId: data.cb1.txId,
      requestId: data.transfer_id,
      currencyId: data.cb1.currency,
      amount: data.cb1.amount,
      transfer_id: transfer.id,
      address: monitoringAddress,
      tag: "",
      confirmations: 1,
      txStatus: "COMPLETED",
      sign: "",
      networkFee: data.cb1.fee,
      networkFeeCurrencyId: data.cb1.feeCurrency
    };

    const cb2_Data = {
      txId: data.cb2.txId,
      requestId: data.transfer_id,
      currencyId: data.cb2.currency,
      amount: data.cb2.amount,
      transfer_id: transfer.id,
      address: transfer.data.wallet,
      tag: "",
      confirmations: 1,
      txStatus: "COMPLETED",
      sign: "",
      networkFee: data.cb2.fee,
      networkFeeCurrencyId: data.cb2.feeCurrency
      //info: "MasterToExternal"
    };

    let res1 = await this.callApi({
      service: "ccoin-service",
      method: "completeTransfer",
      data: cb1_Data
    });

    await this.src.db.query(
      `UPDATE transfers SET status=3 WHERE id='${transfer.id}'`
    );

    let res2 = await this.callApi({
      service: "ccoin-service",
      method: "completeTransfer",
      realm: transfer.realm_id,
      user: transfer.user_id,
      data: cb2_Data
    });

    cb({ result: "success", res1, res2 });
  },

  /* scope:server */
  async getMonitoringAddress(merchant_id, currency) {
    const res = await this.db.query(
      `SELECT c.address FROM merchant_accounts ma, account_crypto c, accounts a WHERE ma.id_merchant='${merchant_id}' and ma.id_account = a.id and c.acc_no=a.acc_no and a.currency='${currency}'`
    );
    return res ? res[0].address : null;
  }
});
