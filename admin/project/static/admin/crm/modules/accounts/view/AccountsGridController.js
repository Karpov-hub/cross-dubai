Ext.define("Crm.modules.accounts.view.AccountsGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=accountsExportTransactions]": {
        click: () => {
          this.exportTx();
        }
      }
    });


    this.callParent(arguments);
  },

  exportTx(data = {}) {
    Ext.create("Crm.modules.accounts.view.ExportTransactionsForm", {});
  }
});
