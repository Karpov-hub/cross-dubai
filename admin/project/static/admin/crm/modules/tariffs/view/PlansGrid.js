Ext.define("Crm.modules.tariffs.view.PlansGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Tariff plans"),
  iconCls: "x-fa fa-list-ul",

  buildColumns: function() {
    return [
      {
        text: D.t("Plan name"),
        flex: 1,
        sortable: true,
        dataIndex: "name"
      }
    ];
  }
});
