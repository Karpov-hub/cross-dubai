Ext.define("Crm.modules.nilLogs.view.nilLogsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("NIL Logs"),
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
        dataIndex: "ctime",
        renderer: (v) => {
          return Ext.Date.format(new Date(v), "d.m.Y H:i:s");
        }
      },
      {
        text: D.t("Request"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "request"
      },
      {
        text: D.t("Response"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "response"
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
