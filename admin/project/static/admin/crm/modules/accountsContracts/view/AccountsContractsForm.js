Ext.define("Crm.modules.accountsContracts.view.AccountsContractsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Account Contract"),

  formMargin: 5,

  width: 550,
  height: 300,
  syncSize: function() {},

  buildItems() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "owner_id",
        hidden: true
      },
      {
        name: "account_number",
        fieldLabel: D.t("Account Name")
      },
      Ext.create("Crm.modules.banks.view.ClientBanksCombo", {
        name: "bank",
        fieldLabel: D.t("Bank")
      }),
      Ext.create("Crm.modules.currency.view.FiatCurrencyCombo", {
        name: "currency",
        fieldLabel: D.t("Currency")
      }),
      {
        xtype: "fieldset",
        title: D.t("Bank correspondent"),
        layout: "anchor",
        defaults: {
          anchor: "100%",
          labelWidth: 150,
          xtype: "textfield"
        },
        items: [
          {
            name: "correspondent_account",
            fieldLabel: D.t("Correspondent Account")
          },
          Ext.create("Crm.modules.currency.view.FiatCurrencyCombo", {
            name: "correspondent_currency",
            fieldLabel: D.t("Currency")
          })
        ]
      }
    ];
  }
});
