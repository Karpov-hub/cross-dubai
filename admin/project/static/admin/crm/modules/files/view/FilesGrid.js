Ext.define("Crm.modules.files.view.FilesGrid", {
  extend: "Core.grid.GridContainer",
  controllerCls: "Crm.modules.files.view.FilesGridController",
  filterbar: true,
  buildColumns: function() {
    return [
      {
        dataIndex: "id",
        hidden: true
      },
      {
        dataIndex: "owner_id",
        hidden: true
      },
      {
        dataIndex: "code",
        hidden: true
      },
      {
        dataIndex: "invoice_id",
        hidden: true
      },
      {
        dataIndex: "cancelled",
        hidden: true
      },
      {
        text: D.t("File's Name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "name"
      },
      {
        text: D.t("Create Date"),
        flex: 1,
        sortable: true,
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "ctime",
        xtype: "datecolumn"
      }
    ];
  },

  buildButtonsColumns: function() {
    let me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 54,
        items: [
          {
            iconCls: "x-fa fa-download",
            name: "donwloadAction",
            tooltip: D.t("Download File"),
            handler: function(grid, rowIndex) {
              me.fireEvent("downloadFile", grid, rowIndex);
            }
          },
          {
            iconCls: "x-fa fa-trash-alt",
            name: "remove",
            tooltip: D.t("Remove File"),
            isDisabled: function(grid, rowIndex) {
              return !me.permis.del;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("delete", grid, rowIndex);
            }
          }
        ]
      }
    ];
  },

  buildTbar: function() {
    let items = this.callParent();
    let fileTbar = {
      text: D.t("Download files"),
      iconCls: "x-fa fa-download",
      action: "download-files"
    };

    items.splice(items.length - 1, 0, fileTbar, "-");
    return items;
  }
});
