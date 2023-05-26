Ext.define("Crm.modules.accountsContracts.view.AccountsContractsGrid", {
  extend: "Core.grid.GridContainer",
  controllerCls:
    "Crm.modules.accountsContracts.view.AccountsContractsGridController",
  buildColumns: function() {
    return [
      {
        dataIndex: "id",
        hidden: true
      },
      {
        dataIndex: "owner_id",
        hidden: true
      },
      {
        text: D.t("Account"),
        flex: 2,
        sortable: true,
        filter: true,
        dataIndex: "account_number"
      },
      {
        text: D.t("Bank"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "bank"
      },
      {
        text: D.t("SWIFT"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "swift"
      },
      {
        text: D.t("Currency"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "currency"
      }
      // {
      //   text: D.t("Correspondent Bank's Account"),
      //   flex: 2,
      //   sortable: true,
      //   filter: true,
      //   dataIndex: "correspondent_account",
      // },
      // {
      //   text: D.t("Currency Bank's Correcpondent"),
      //   flex: 1,
      //   sortable: true,
      //   filter: true,
      //   dataIndex: "correspondent_currency",
      // },
    ];
  }
});
