Ext.define("Crm.modules.nil.view.TXHistoryForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Withdrawal",
  iconCls: "x-fa fa-list",

  formMargin: 5,

  onActivate(){},
  onClose(){},
  
  width: 350,
  height: 200,

  syncSize: function() {},

  onActivate: function() {},
  onClose: function() {},

  controllerCls: "Crm.modules.nil.view.TXHistoryFormController",

  buildItems: function() {
    return [
      {
        fieldLabel: D.t("Amount"),
        xtype: "textfield",
        name: "amount"
      },
      Ext.create("Crm.modules.currency.view.CurrencyCombo", {
        name: "currency"
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
        action: "withdrawal"
      }
    ];
  }
});
