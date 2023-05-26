Ext.define("Crm.modules.accounts.view.MerchantAccountsWithGasGrid", {
  extend: "Crm.modules.accounts.view.AccountsWithGasGrid",

  controllerCls: "Crm.modules.accounts.view.AccountsWithGasGridController",
  model: "Crm.modules.accounts.model.MerchantAccountsWithGasModel",

  buildTbar() {
    if (parseInt(this.observeObject.wallet_type) !== 1) {
      return [
        {
          text: this.buttonAddText,
          tooltip: this.buttonAddTooltip,
          iconCls: "x-fa fa-plus",
          scale: "medium",
          action: "add"
        },
        "-",
        {
          tooltip: this.buttonReloadText,
          iconCls: "x-fa fa-sync",
          action: "refresh"
        },
        "->",
        {
          iconCls: "x-fa fa-money-bill-alt",
          text: D.t("Sum up USDT"),
          action: "sum_up"
        },
        "-",
        {
          xtype: "textfield",
          name: "total_balance",
          width: 70,
          readOnly: true,
          hidden: true
        },
        {
          action: "copy_balance",
          tooltip: D.t("Copy to clipboard"),
          iconCls: "x-fa fa-clipboard",
          width: 50,
          hidden: true
        }
      ];
    }

    return [
      {
        text: this.buttonAddText,
        tooltip: this.buttonAddTooltip,
        iconCls: "x-fa fa-plus",
        scale: "medium",
        action: "add"
      },
      "-",
      {
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-sync",
        action: "refresh"
      }
    ];
  },

  buildColumns() {
    const columns = this.callParent(arguments);
    columns.splice(0, 2);
    return columns;
  }
});
