Ext.define("Admin.view.main.CheckerActions", {
  onDoubleClick(el, record) {
    return this.showApproveForm(record.data);
  },
  onActionColumnClick(grid, rowIndex) {
    return this.showApproveForm(grid.getStore().getAt(rowIndex).data);
  },
  showApproveForm(record) {
    let me = this;
    const NotApprovedTransfersModel = Ext.create(
      "Crm.modules.transfers.model.NotApprovedTransfersModel"
    );
    let approve_win = Ext.create(
      "Crm.modules.transfers.view.NotApprovedTransfersForm",
      {
        recordId: record.id,
        cb: async (response) => {
          await NotApprovedTransfersModel.updateTransferStatus(
            record,
            response
          );
          await me.getTransfersData(NotApprovedTransfersModel);
        }
      }
    );
    approve_win.show();
    approve_win.controller.setValues(record);
  }
});
