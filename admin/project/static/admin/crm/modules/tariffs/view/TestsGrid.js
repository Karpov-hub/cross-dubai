Ext.define("Crm.modules.tariffs.view.TestsGrid", {
  extend: "Core.grid.GridContainer",

  controllerCls: "Crm.modules.tariffs.view.TestsGridController",

  detailsInDialogWindow: true,

  buildColumns() {
    let renderer = (v, m, r) => {
      m.tdCls = `test-status-${r.data.status}`;
      return v;
    };
    return [
      {
        dataIndex: "id",
        hidden: true
      },
      {
        dataIndex: "name",
        text: D.t("Name"),
        flex: 1,
        renderer
      },
      {
        dataIndex: "status",
        text: D.t("Status"),
        flex: 1,
        renderer(v, m, r) {
          renderer(v, m, r);
          return D.t(["New", "Success", "Failed"][v]);
        }
      },
      {
        text: D.t("Run test"),
        sortable: false,
        filter: false,
        xtype: "actioncolumn",
        items: [
          {
            iconCls: "x-fa fa-check",
            tooltip: D.t("Run"),
            handler: (grid, rowIndex) => {
              this.fireEvent("run_test", grid, rowIndex);
            }
          }
        ]
      }
    ];
  },
  buildTbar: function() {
    var items = [
      {
        text: "Add test",
        tooltip: this.buttonAddTooltip,
        iconCls: "x-fa fa-plus",
        scale: "medium",
        action: "add"
      },
      {
        text: "Run tests",
        tooltip: "Run",
        iconCls: "x-fa fa-check",
        scale: "medium",
        action: "run_all_tests"
      }
    ];

    items.push("-", {
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-sync",
      action: "refresh"
    });

    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  }
});
