Ext.define("Crm.modules.reports.view.ReportsQueueGridController", {
  extend: "Crm.modules.files.view.FilesGridController",

  setControls() {
    this.control({
      "[action=get-report]": {
        click: () => {
          this.getReport({
            type: "statement",
            report_description: "Wallet Statement Report"
          });
        }
      },
      "[action=get-wallet-fee-report]": {
        click: () => {
          this.getReport({
            type: "fee",
            report_description: "Wallet Fee Report"
          });
        }
      }
    });

    this.view.on("repeatRequestReport", (grid, rowIdx, record) => {
      this.repeatRequestReport(grid, rowIdx, record);
    });

    this.callParent();
  },

  async repeatRequestReport(grid, rowIdx, record) {
    await this.model.updateReportStatus({
      report_id: record.data.id,
      status: 0
    });

    this.view.store.reload();
  },

  gotoRecordHash: function() {},

  async getReport(data) {
    Ext.create("Crm.modules.reports.view.GenerateReportWindow", {
      report_data: data,
      callback: async (data) => {
        this.reloadData();
      }
    });
  }
});
