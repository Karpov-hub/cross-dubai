Ext.define("Crm.modules.tariffs.view.TriggersGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Triggers"),
  iconCls: "x-fa fa-bell",

  fields: ["name", "method", "service"],

  buildColumns: function() {
    return [
      {
        text: D.t("Trigger"),
        flex: 1,
        sortable: true,
        dataIndex: "name",
        renderer(v, m, r) {
          return v || r.data.service + ":" + r.data.method;
        }
      }
    ];
  }
});
