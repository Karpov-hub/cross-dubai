Ext.define("Crm.modules.reports.view.ReportsGrid", {
  extend: "Core.grid.GridContainer",

  controllerCls: "Crm.modules.reports.view.ReportsGridController",
  filterbar: true,

  title: D.t("Reports"),
  iconCls: "x-fa fa-folder",

  gridCfg: {
    selType: "checkboxmodel"
  },

  buildColumns: function() {
    return [
      {
        dataIndex: "id",
        hidden: true
      },
      {
        dataIndex: "code",
        hidden: true
      },
      {
        dataIndex: "type",
        hidden: true
      },
      {
        text: D.t("Create Date"),
        width: 150,
        sortable: true,
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "ctime",
        xtype: "datecolumn"
      },
      {
        text: D.t("File's Name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "name"
      }
    ];
  },

  buildButtonsColumns: function() {
    let me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 34,
        items: [
          {
            iconCls: "x-fa fa-download",
            name: "donwloadAction",
            tooltip: D.t("Download File"),
            handler: function(grid, rowIndex) {
              me.fireEvent("downloadFile", grid, rowIndex);
            }
          }
          // {
          //   iconCls: "x-fa fa-trash-alt",
          //   name: "remove",
          //   tooltip: D.t("Remove File"),
          //   isDisabled: function(grid, rowIndex) {
          //     return !me.permis.del;
          //   },
          //   handler: function(grid, rowIndex) {
          //     me.fireEvent("delete", grid, rowIndex);
          //   }
          // }
        ]
      }
    ];
  },

  buildTbar: function() {
    this.items = [];

    this.items.push(
      {
        text: D.t("Download files"),
        iconCls: "x-fa fa-download",
        action: "download-files"
      },
      "-",
      {
        text: D.t("Create report for current month"),
        iconCls: "x-fa fa-gears",
        action: "create-report"
      },
      "-",
      {
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-sync",
        action: "refresh"
      }
    );

    return this.items;
  }
});
