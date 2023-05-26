Ext.define("Crm.modules.viewset.view.ViewsetGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("DB views"),
  iconCls: "x-fa fa-eye",

  buildColumns: function() {
    return [
      {
        text: D.t("Title"),
        flex: 1,
        sortable: true,
        dataIndex: "name"
      }
    ];
  }
});
