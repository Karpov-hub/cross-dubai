Ext.define("Crm.modules.orders.view.CustomAdvertisingFormController", {
  extend: "Crm.modules.orders.view.AdvertisingFormController",

  alias:"controller.CustomAdvertisingFormController",
  
  setControls() {
    this.callParent(arguments);
    this.control({
      "[name=order_date_from]": {
        change: (el, v) => {
          this.view.down("[name=order_date_to]").setMinValue(v);
        }
      }
    });
    this.view
      .down("[name=order_date_to]")
      .setMinValue(this.view.down("[name=order_date_from]").getValue());
  },

  async loadAllStoresData(data) {
    return {
      api_data: await this.loadGeneralStatsGridStore(data),
      withdrawal_list: await this.loadTranactionsGridStore(data)
    };
  },

  async loadTranactionsGridStore(data) {
    let withdrawal_list = await this.model.loadTranactionsGridStore({
      merchant_id: data.merchant_id,
      date_from: data.date_from,
      date_to: data.date_to,
      type: "withdrawal"
    });
    return withdrawal_list;
  },

  async loadGeneralStatsGridStore(data) {
    let api_data = await this.model.loadGeneralStatsGridStore({
      campaignID: data.campaignID,
      fromDate: data.date_from,
      toDate: data.date_to
    });
    return api_data;
  }
});
