Ext.define("Crm.modules.accounts.view.ClientAccountsWithGasGrid", {
  extend: "Crm.modules.accounts.view.AccountsWithGasGrid",

  controllerCls: "Crm.modules.accounts.view.AccountsWithGasGridController",

  buildTbar() {
    return [
      {
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-sync",
        action: "refresh"
      },
      "->",
      {
        tooltip: D.t("Debt report"),
        iconCls: "x-fa fa-download",
        action: "debt_report"
      },
      "-",
      {
        xtype: "label",
        text: D.t("DEBT:")
      },
      {
        xtype: "label",
        action: "total_balance",
        text: "0"
      },
      Ext.create("Crm.modules.currency.view.CurrencyCombo", {
        fieldLabel: null,
        action: "balance_currency",
        width: 80,
        value: "EUR",
        displayField: "abbr"
      })
    ];
  },

  buildColumns() {
    const columns = this.callParent(arguments);
    columns.splice(0, 1);
    return columns;
  }
});
