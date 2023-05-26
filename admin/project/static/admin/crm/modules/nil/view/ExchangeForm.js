Ext.define("Crm.modules.nil.view.ExchangeForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Exchange",
  iconCls: "x-fa fa-list",

  formMargin: 5,

  width: 350,
  height: 200,

  syncSize: function() {},

  onActivate: function() {},
  onClose: function() {},

  controllerCls: "Crm.modules.nil.view.ExchangeFormController",

  buildItems: function() {
    return [
      {
        fieldLabel: D.t("Amount"),
        xtype: "textfield",
        name: "amount"
      },
      Ext.create("Crm.modules.currency.view.CurrencyCombo", {
        name: "currency"
      }),
      ,
      Ext.create("Crm.modules.currency.view.CurrencyCombo", {
        fieldLabel: D.t("To Currency"),
        name: "to_currency"
      })
    ];
  },
  buildButtons: function() {
    return [
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" },
      "-",
      {
        text: D.t("Submit"),
        iconCls: "x-fa fa-check-square",
        action: "exchange"
      }
    ];
  }
});
