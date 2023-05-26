Ext.define("Crm.modules.logs.view.LogsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Logs"),
  iconCls: "x-fa fa-newspaper-o",

  filterable: true,
  filterbar: true,

  detailsInDialogWindow: true,

  controllerCls: "Crm.modules.logs.view.LogsGridController",

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
        renderer: v => {
          return Ext.Date.format(new Date(v), "d.m.Y H:i:s");
        }
      },
      {
        text: D.t("Service"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "service"
      },
      {
        text: D.t("Method"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "method"
      }
    ];
  },

  buildTbar: function() {
    var items = [];
    items.push(
      "-",
      {
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-sync",
        action: "refresh"
      },
      "-",
      {
        action: "disableLogs"
      }
    );

    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  },

  buildButtonsColumns: function() {
    var me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 54,
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
