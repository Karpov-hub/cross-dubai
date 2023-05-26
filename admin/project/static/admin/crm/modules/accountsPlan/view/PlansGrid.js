Ext.define("Crm.modules.accountsPlan.view.PlansGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Accounts plans"),
  iconCls: "x-fa fa-university",

  filterable: true,
  filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Plan name"),
        flex: 2,
        sortable: true,
        dataIndex: "name",
        filter: true
      }
    ];
  }
});
