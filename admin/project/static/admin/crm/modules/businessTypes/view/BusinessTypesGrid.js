Ext.define("Crm.modules.businessTypes.view.BusinessTypesGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Business Types"),
  iconCls: "x-fa fa-list",

  filterable: true,
  filterbar: true,

  fields: ["id", "type", "realm", "ctime"],

  buildColumns: function() {
    return [
      {
        text: D.t("Creation Date"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "ctime"
      },
      {
        text: D.t("Type name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "type"
      }
    ];
  }
});
