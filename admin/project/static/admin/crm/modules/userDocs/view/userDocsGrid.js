Ext.define("Crm.modules.userDocs.view.userDocsGrid", {
  extend: "Core.grid.GridContainer",

  filterable: true,
  filterbar: true,
  detailsInDialogWindow: true,

  fields: ["id", "user_id", "name", "type", "status"],

  buildColumns: function() {
    return [
      {
        text: D.t("Name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "name"
      },
      {
        text: D.t("Type"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "type"
      },
      {
        text: D.t("Status"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "status",
        renderer: function(v, m, r) {
          return D.t(
            { 1: "Required", 2: "Loaded", 3: "Pending", 4: "Approved" }[v]
          );
        }
      }
    ];
  }
});
