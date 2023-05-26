Ext.define("Crm.modules.banks.view.RealmDepartmentIBANForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("IBAN: {name}"),

  formMargin: 5,

  width: 550,
  height: 400,

  syncSize: function() {},

  model: "Crm.modules.banks.model.IBANModel",

  buildItems() {
    return [
      {
        name: "id",
        xtype: "textfield",
        hidden: true
      },
      {
        name: "owner",
        xtype: "textfield",
        hidden: true
      },
      {
        name: "iban",
        fieldLabel: D.t("IBAN/Account №"),
        xtype: "textfield"
      },
      Ext.create("Crm.modules.currency.view.CurrencyCombo", {
        name: "currency",
        currency_type: "fiat",
        fieldLabel: D.t("Currency")
      }),
      Ext.create("Crm.modules.banks.view.BanksCombo", {
        name: "bank_id",
        fieldLabel: D.t("Bank")
      }),
      {
        name: "verified_on_nil",
        xtype: "checkbox",
        fieldLabel: D.t("Withdrawal from Nil")
      },
      {
        name: "nil_account_description",
        fieldLabel: D.t("NIL account description"),
        xtype: "textfield"
      }
    ];
  },

  buildButtons: function() {
    return [
      {
        tooltip: D.t("Remove this record"),
        iconCls: "x-fa fa-trash-alt",
        action: "remove"
      },
      "->",
      {
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square",
        action: "save"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
