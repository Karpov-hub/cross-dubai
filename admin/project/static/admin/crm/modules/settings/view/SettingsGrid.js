Ext.define("Crm.modules.settings.view.SettingsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Settings"),
  iconCls: "x-fa fa-list",

  filterable: true,
  filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Key"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "key"
      },
      {
        text: D.t("Value"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "value"
      }
    ];
  }
});
