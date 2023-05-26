Ext.define("Crm.modules.transfers.view.TransfersByPlanGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=exportTransfers]": {
        click: () => {
          this.exportTx();
        }
      }
    });

    this.view.on({
      accept: (grid, data) => {
        this.accept(data);
      }
    });

    // this.view.store.on("load", () => {
    //   if (!this.groupingFeature)
    //     this.groupingFeature = this.view
    //       .down("grid")
    //       .view.findFeature("grouping");
    //   this.groupingFeature.expandAll();
    // });

    this.callParent();
  },

  gotoRecordHash(data) {
    Ext.create("Crm.modules.transfers.view.PlanTransfersWin").setValues(data);
  },

  async accept(data) {
    await this.model.callApi(
      "account-service",
      "accept",
      {
        ref_id: data.ref_id,
        transfer_id: data.id,
        _admin_id: localStorage.getItem("uid")
      },
      data.realm_id,
      data.user_id
    );
    this.reloadData();
  },

  generateDetailsCls() {
    return "Crm.modules.transfers.view.TransfersForm";
  },

  exportTx() {
    Ext.create("Crm.modules.transfers.view.ExportTransfersForm", {
      scope: this.view,
      report_name: "transfersByPlanReport"
    });
  }
});
