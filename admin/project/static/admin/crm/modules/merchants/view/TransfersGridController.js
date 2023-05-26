Ext.define("Crm.modules.merchants.view.TransfersGridController", {
  extend: "Crm.modules.transfers.view.TransfersGridController",

  setControls() {
    this.control({
      "[action=reconciliation-act-1]": {
        click: () => {
          this.generateReconciliationAct(0);
        }
      },
      "[action=reconciliation-act-2]": {
        click: () => {
          this.generateReconciliationAct(1);
        }
      },
      "[action=merchantsExportTransfers]": {
        click: () => {
          this.exportTx({
            merchant_id: this.view.scope.currentData.id,
            report_name: "tradeHistoryCsv"
          });
        }
      },
      "[action=exportPlanTransfers]": {
        click: () => {
          this.exportTx({
            merchant_id: this.view.scope.currentData.id,
            report_name: "transfersByPlanReport"
          });
        }
      }
    });
    this.callParent();
  },

  async generateReconciliationAct(type) {
    const data = this.view.scope.currentData;
    data.type = type;
    Ext.create("Crm.modules.merchants.view.ReconciliationForm", {
      scope: this,
      merchantData: data
    });
  }
});
