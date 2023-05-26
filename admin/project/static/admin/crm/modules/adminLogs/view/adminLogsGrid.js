Ext.define("Crm.modules.adminLogs.view.adminLogsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Admin actions logs"),
  iconCls: "x-fa fa-list",

  filterable: true,
  filterbar: true,

  detailsInDialogWindow: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Creation date"),
        width: 150,
        sortable: true,
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "date",
        renderer: (v) => {
          return Ext.Date.format(new Date(v), "d.m.Y H:i:s");
        }
      },
      {
        text: D.t("Data"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "data"
      },
      {
        text: D.t("Result"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "result"
      }
    ];
  },

  buildTbar: function() {
    var items = [];
    items.push({
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-sync",
      action: "refresh"
    });

    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  },

  buildButtonsColumns: function() {
    var me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 34,
        items: [
          {
            iconCls: "x-fa fa-edit",
            tooltip: D.t("View log"),
            handler: function(grid, rowIndex) {
              me.fireEvent("edit", grid, rowIndex);
            }
          }
        ]
      }
    ];
  }
});
