Ext.define("Crm.modules.merchants.view.RealmDepartmentGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Departments"),
  iconCls: "x-fa fa-list",

  detailsInDialogWindow: true,

  filterable: true,
  filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Name"),
        flex: 1,
        sortable: true,
        dataIndex: "name",
        filter: true
      },
      {
        text: D.t("Status"),
        width: 120,
        sortable: true,
        dataIndex: "status",
        filter: {
          xtype: "combo",
          valueField: "code",
          displayField: "name",
          store: {
            fields: ["code", "name"],
            data: [
              { code: "Active", name: D.t("Active") },
              { code: "Inactive", name: D.t("Inactive") }
            ]
          }
        }
      }
    ];
  }
});
