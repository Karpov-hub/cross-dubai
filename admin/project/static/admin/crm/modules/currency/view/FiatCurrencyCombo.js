Ext.define("Crm.modules.currency.view.FiatCurrencyCombo", {
  extend: "Ext.form.field.ComboBox",

  fieldLabel: D.t("Currency"),
  valueField: "abbr",
  displayField: "abbr",

  queryMode: "local",

  editable: false,

  initComponent() {
    this.store = Ext.create("Core.data.ComboStore", {
      dataModel: Ext.create("Crm.modules.currency.model.FiatCurrencyModel"),
      fieldSet: ["abbr", "name"],
      scope: this
    });
    this.callParent(arguments);
  }
});
