Ext.define("Crm.modules.finance.view.ReportSettingsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Reports settings"),
  iconCls: "x-fa fa-list",

  //filterable: true,
  //filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "name"
      }
    ];
  }
});
