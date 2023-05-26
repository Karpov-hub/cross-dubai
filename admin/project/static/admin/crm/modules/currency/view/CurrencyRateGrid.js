Ext.define("Crm.modules.currency.view.CurrencyRateGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Currency rates"),
  iconCls: "x-fa fa-dollar-sign",

  filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Title"),
        flex: 1,
        sortable: true,
        dataIndex: "name"
      },
      {
        text: D.t("Date"),
        width: 100,
        sortable: true,
        dataIndex: "ctime"
      },
      {
        text: D.t("Active"),
        width: 80,
        sortable: true,
        dataIndex: "active"
      }
    ];
  }
});
