Ext.define("Crm.modules.accounts.view.RealmAccountsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Accounts"),
  iconCls: "x-fa fa-credit-card",

  filterable: true,
  filterbar: true,

  detailsInDialogWindow: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Account"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "acc_name"
      },
      {
        text: D.t("Account"),
        width: 120,
        sortable: true,
        filter: true,
        dataIndex: "acc_no"
      },
      {
        text: D.t("Balance"),
        xtype: "numbercolumn",
        align: "right",
        width: 120,
        sortable: true,
        filter: true,
        dataIndex: "balance"
      },
      {
        text: D.t("Currency"),
        width: 80,
        sortable: true,
        filter: true,
        dataIndex: "currency"
      },
      {
        text: D.t("Type"),
        width: 120,
        sortable: true,
        filter: true,
        dataIndex: "type",
        renderer: v => {
          return D.t({ 1: "depost", 2: "withdrawal", 3: "fees" }[v]);
        }
      },
      {
        text: D.t("Country"),
        sortable: true,
        filter: true,
        dataIndex: "country",
        width: 80
      }
    ];
  }
});
