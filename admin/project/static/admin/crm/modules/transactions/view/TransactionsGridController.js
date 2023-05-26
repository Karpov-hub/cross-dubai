Ext.define("Crm.modules.transactions.view.TransactionsGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=dependent_payment]": {
        click: (el) => {
          this.doDependentPayment();
        }
      },
      "[action=accountsExportTransactions]": {
        click: () => {
          this.exportTx();
        }
      }
    });
    this.view.on("accept", (grid, data) => {
      this.accept(data);
    });
    this.transferModel = Ext.create(
      "Crm.modules.transfers.model.TransfersModel"
    );
    this.callParent();
  },

  exportTx(data = {}) {
    Ext.create("Crm.modules.transactions.view.ExportTransactionsForm", {
      scope: this.view
    });
  },

  doDependentPayment() {
    let data = this.view.ownerCt.ownerCt.down("[action=datapanel]").getData();
    let payment_window = Ext.create("Crm.modules.accountsPlan.view.PaymentWin");
    payment_window.show();
    payment_window.controller.setValues({
      merchant_id: data.merchant_id,
      plan_transfer_id: data.data.pipeline
    });
  },

  accept(data) {
    this.transferModel.write(
      {
        id: data.transfer_id,
        transfer_type: "accept"
      },
      () => {
        this.reloadData();
      }
    );
  },

  gotoRecordHash() {}
});
