Ext.define("Crm.modules.merchants.view.MerchantsCombo", {
  extend: "Ext.form.field.ComboBox",

  valueField: "id",
  displayField: "name",

  queryMode: "local",

  editable: false,

  initComponent() {
    this.store = Ext.create("Core.data.ComboStore", {
      dataModel: Ext.create("Crm.modules.merchants.model.MerchantsModel"),
      fieldSet: ["id", this.displayField],
      scope: this
    });
    this.callParent(arguments);
  }
});
