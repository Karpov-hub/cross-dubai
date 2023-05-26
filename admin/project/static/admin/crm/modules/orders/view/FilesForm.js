Ext.define("Crm.modules.orders.view.FilesForm", {
  extend: "Crm.modules.files.view.FilesForm",
  controllerCls: "Crm.modules.files.view.FilesFormController",

  buildItems() {
    let items = this.callParent();
    items.push({
      xtype: "combo",
      name: "type",
      fieldLabel: D.t("Select File's Type"),
      flex: 3,
      valueField: "type",
      displayField: "type",
      allowBlank: false,
      store: {
        fields: ["type"],
        data: [["Uploaded Invoice"], ["Insertion Order"], ["Other"]]
      }
    });
    return items;
  }
});
