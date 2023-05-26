Ext.define("Crm.modules.tariffs.view.TariffsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Extended settings"),
  iconCls: "x-fa fa-list",

  buildColumns: function() {
    return [
      {
        text: D.t("Tariff"),
        flex: 1,
        sortable: true,
        dataIndex: "name"
      }
    ];
  }
});
