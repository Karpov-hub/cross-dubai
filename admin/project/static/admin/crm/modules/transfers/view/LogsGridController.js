Ext.define("Crm.modules.transfers.view.LogsGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=handle-callback]": {
        click: () => {
          this.sendHanleCallback();
        }
      },
      "[action=crypto-manually]": {
        click: () => {
          this.sendCryptoManually();
        }
      },
      "[action=resend-callback]": {
        click: () => {
          this.resendCallback();
        }
      }
    });
    this.callParent();
  },

  gotoRecordHash() {},

  async sendHanleCallback() {
    Ext.create("Crm.modules.transfers.view.HandleCallbackWindow", {
      callback: async (data) => {
        data.transfer_id = this.view.scope.down("[name=id]").getValue();
        await this.model.sendHandleCallback(data);
        this.reloadData();
      }
    });
  },

  async resendCallback() {
    Ext.create("Crm.modules.transfers.view.ResendCallbackWindow", {
      callback: async (data) => {
        this.reloadData();
      }
    });
  },

  async sendCryptoManually() {
    const address_from = await this.getMonitoringByMerchantCurrency(
      this.view.scope.currentData.merchant_id,
      this.view.scope.currentData.data.to_currency
    );
    const w = Ext.create("Crm.modules.crypto.view.SendForm", { scope: this });

    w.controller.setValues({
      txId: this.view.scope.currentData.id,
      address_from,
      address_to: this.view.scope.currentData.data.wallet,
      currency: this.view.scope.currentData.data.to_currency,
      amount: this.view.scope.currentData.data.result_amount
    });
  },

  async getMonitoringByMerchantCurrency(merchant, currency) {
    const { address } = await this.model.callApi(
      "ccoin-service",
      "getMonitoringAddressByMerchant",
      { merchant, currency }
    );
    return address;
  }
});
