Ext.define("Crm.modules.banks.view.BanksGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Banks"),
  iconCls: "x-fa fa-university",

  filterable: true,
  filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("name"),
        flex: 2,
        sortable: true,
        dataIndex: "name",
        filter: true
      },
      {
        text: D.t("Short Name"),
        flex: 1,
        sortable: true,
        dataIndex: "shortname",
        filter: true
      },
      {
        text: D.t("Country"),
        width: 120,
        sortable: true,
        dataIndex: "country",
        filter: true
      },
      {
        text: D.t("SWIFT"),
        width: 120,
        sortable: true,
        dataIndex: "swift",
        filter: true
      }
    ];
  }
});
