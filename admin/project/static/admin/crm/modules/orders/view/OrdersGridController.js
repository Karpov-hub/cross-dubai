Ext.define("Crm.modules.orders.view.OrdersGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=provide_deferred]": {
        click: () => {
          this.provideDeferred();
        }
      }
    });
    this.callParent();
  },

  deleteRecord_do(store, rec) {
    D.c("Removing", "Delete the order?", [], async () => {
      await this.removeOrder(rec.data);
      store.remove(rec);
    });
  },

  async removeOrder(order) {
    this.model.runOnServer(
      "getMerchantRealm",
      { id: order.merchant },
      async (res) => {
        let realm = res.realm;
        await this.model.callApi(
          "account-service",
          "removeOrder",
          { id: order.id },
          realm,
          order.merchant
        );
        await this.model.refreshData({
          modelName: this.model.$className
        });
      }
    );
  },
  provideDeferred() {
    Ext.create("Crm.modules.orders.view.DeferredWindow");
  }
});
