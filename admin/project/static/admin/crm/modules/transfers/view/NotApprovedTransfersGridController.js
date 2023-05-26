Ext.define("Crm.modules.transfers.view.NotApprovedTransfersGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=createInnerTransferForm]": {
        click: () => {
          this.createInnerTransferForm();
        }
      }
    });
    this.callParent(arguments);
  },

  createInnerTransferForm() {
    Ext.create("Crm.modules.independentTransfers.view.InnerTransferForm");
  },

  gotoRecordHash(data) {
    let class_name;

    if (!data.approver)
      class_name = "Crm.modules.transfers.view.NotApprovedTransfersForm";

    if (data.is_draft) class_name = "Crm.modules.accountsPlan.view.PaymentWin";

    if (class_name)
      Ext.create(class_name, {
        noHash: true,
        recordId: data[this.view.model.idField],
        gridCfg: this.view.config,
        data
      });
  }
});
