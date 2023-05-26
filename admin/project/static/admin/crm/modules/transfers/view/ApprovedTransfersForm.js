Ext.define("Crm.modules.transfers.view.ApprovedTransfersForm", {
  extend: "Crm.modules.transfers.view.NotApprovedTransfersForm",

  controllerCls: "Crm.modules.transfers.view.ApprovedTransfersFormController",

  buildItems() {
    let fields = this.callParent(arguments);
    fields.items[0].items.splice(13, 3, {
      xtype: "textfield",
      name: "approver_name",
      fieldLabel: D.t("Approver")
    });
    return fields;
  },

  buildButtons() {
    let buttons = this.callParent(arguments);
    return [buttons[1], buttons[2]];
  }
});
