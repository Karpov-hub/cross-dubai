Ext.define("Crm.modules.currency.view.CurrencyCombo", {
  extend: "Ext.form.field.ComboBox",

  fieldLabel: D.t("Currency"),
  valueField: "abbr",
  displayField: "abbr",

  queryMode: "local",

  editable: false,

  initComponent() {
    let dataModel;

    if (this.currency_type) {
      if (this.currency_type == "crypto")
        dataModel = Ext.create(
          "Crm.modules.currency.model.CryptoCurrencyModel"
        );
      if (this.currency_type == "fiat")
        dataModel = Ext.create("Crm.modules.currency.model.FiatCurrencyModel");
      if (this.currency_type == "part_crypto")
        dataModel = Ext.create(
          "Crm.modules.currency.model.PartCryptoCurrencyModel"
        );
    } else {
      dataModel = Ext.create("Crm.modules.currency.model.ActiveCurrencyModel");
    }

    this.store = Ext.create("Core.data.ComboStore", {
      dataModel,
      fieldSet: ["abbr", "name"],
      scope: this
    });
    this.callParent(arguments);
  }
});
