Ext.define("Crm.modules.accountHolders.view.UsersCombo", {
  extend: "Ext.form.field.ComboBox",

  valueField: "id",
  displayField: "legalname",

  queryMode: "local",

  editable: false,

  initComponent() {
    this.store = Ext.create("Core.data.ComboStore", {
      dataModel: Ext.create("Crm.modules.accountHolders.model.UsersModel"),
      fieldSet: ["id", this.displayField],
      scope: this
    });
    this.callParent(arguments);
  }
});
