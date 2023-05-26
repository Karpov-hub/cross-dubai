Ext.define("Crm.modules.orders.model.PaymentButtonFunctions", {
  extend: "Crm.modules.orders.model.WCNOrderModel",

  mixins: ["Crm.modules.orders.model.TransfersFunctions"],

  /* scope:client */
  getAdditionalDataForApproveWin(data) {
    return new Promise((resolve) => {
      this.runOnServer("getAdditionalDataForApproveWin", data, resolve);
    });
  },

  /* scope:server */
  async $getAdditionalDataForApproveWin(data, cb) {
    let result = {};
    if (typeof data.plan_id == "object") data.plan_id = data.plan_id.id;
    if (data.plan_id) {
      let plan_data = await this.src.db
        .collection("accounts_plans")
        .findOne({ id: data.plan_id }, { id: 1, name: 1 });
      result.plan_id = {
        id: plan_data.id,
        name: plan_data.name
      };
    }
    if (typeof data.merchant_id == "object")
      data.merchant_id = data.merchant_id.id;
    if (data.merchant_id) {
      let merchant_data = await this.src.db
        .collection("merchants")
        .findOne({ id: data.merchant_id }, { id: 1, name: 1 });
      result.merchant_id = {
        id: merchant_data.id,
        name: merchant_data.name
      };
    }
    if (typeof data.tariff_id == "object") data.tariff_id = data.tariff_id.id;
    if (data.tariff_id) {
      let tariff_data = await this.src.db
        .collection("tariffplans")
        .findOne({ id: data.tariff_id }, { id: 1, name: 1 });
      result.tariff = {
        id: tariff_data.id,
        name: tariff_data.name
      };
    }
    return cb(result);
  },

  /* scope:client */
  getTransferByPlanStatus(data) {
    return new Promise((resolve) => {
      this.runOnServer("getTransferByPlanStatus", data, resolve);
    });
  },

  /* scope:server */
  async $getTransferByPlanStatus(data, cb) {
    if (!data.transfer_id) return cb({ success: false, status: "not_exist" });
    let plan_transfer = await this.src.db
      .collection("transfers_plans")
      .findOne({ id: data.transfer_id });
    if (plan_transfer) {
      let transfers = await this.src.db
        .collection("transfers")
        .findAll({ plan_transfer_id: plan_transfer.id }, { id: 1, data: 1 });

      let transfers_ids = transfers.map((el) => el.id);

      let to_address = "";
      for (let transfer of transfers)
        if (
          transfer.data &&
          transfer.data.netData &&
          transfer.data.netData.net &&
          transfer.data.netData.net.toAddress
        )
          to_address = transfer.data.netData.net.toAddress;
      if (!to_address)
        return cb({ success: true, status: "stuck", data: plan_transfer });

      let ids_where_placeholder = "";
      for (let i = 0; i < transfers_ids.length; i++) {
        ids_where_placeholder += `$${i + 1}`;
        if (transfers_ids[i + 1]) ids_where_placeholder += ",";
      }
      let crypto_tx_data = await this.src.db.query(
        `
      select c.id from cryptotx c 
      where c.id = (
      select t.data ->> 'txId' from transfers t
      where t.data ->> 'requestId' in (${ids_where_placeholder})
      and t.data ->> 'address' = $${transfers_ids.length + 1})`,
        [...transfers_ids, to_address]
      );
      if (!crypto_tx_data.length || !crypto_tx_data[0].id)
        return cb({ success: true, status: "stuck", data: plan_transfer });
      plan_transfer.hash_id = crypto_tx_data[0].id;
      return cb({ success: true, status: "sent", data: plan_transfer });
    }
    let not_sent_plan_transfer = await this.src.db
      .collection("not_sent_plan_transfers")
      .findOne({ id: data.transfer_id });
    if (not_sent_plan_transfer)
      return cb({
        success: true,
        status: "not_sent",
        data: not_sent_plan_transfer
      });
    return cb({ success: false, status: "not_exist" });
  }
});
