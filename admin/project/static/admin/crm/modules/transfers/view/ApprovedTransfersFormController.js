Ext.define("Crm.modules.transfers.view.ApprovedTransfersFormController", {
  extend: "Crm.modules.transfers.view.NotApprovedTransfersFormController",

  setValues(data) {
    data.approver_name = data.approver
      ? data.approver.name || data.approver.login
      : null;
    this.callParent(arguments);
  }
});
