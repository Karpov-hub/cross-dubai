Ext.define("Crm.modules.orders.view.TransfersGridController", {
  extend: "Crm.modules.transfers.view.TransfersGridController",

  setControls() {
    this.view.on({
      deletePermanent: (grid, data) => {
        this.deletePermanent(data);
      }
    });

    this.callParent();
  },

  deletePermanent(data) {
    this.model.runOnServer(
      "deletePermanent",
      {
        data,
        realm: this.view.config.scope.realmField.lastValue,
        user: this.view.config.scope.currentData.merchant,
        method: "removeTransfer"
      },
      (res) => {
        if (res && res.success) return this.reloadData();
        else if (res && res.error)
          return D.a("Error", "Removing is not allowed");
      }
    );
  }
});
