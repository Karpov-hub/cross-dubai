Ext.define("Crm.modules.banks.view.DirectoryBanksGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Banks"),
  iconCls: "x-fa fa-list",

  filterable: true,
  filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Name"),
        flex: 2,
        sortable: true,
        dataIndex: "bank_name",
        filter: true
      },
      {
        text: D.t("Rows to skip"),
        flex: 1,
        sortable: true,
        dataIndex: "skip_rows",
        filter: true
      },
      {
        text: D.t("Parse code"),
        flex: 1,
        sortable: true,
        dataIndex: "parse_code",
        filter: true
      },
      {
        text: D.t("Fee %"),
        flex: 1,
        sortable: true,
        dataIndex: "fee_percent",
        filter: true
      }
    ];
  }
});
