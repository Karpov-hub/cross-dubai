Ext.define("Crm.modules.orders.view.FilesGrid", {
  extend: "Crm.modules.files.view.FilesGrid",
  controllerCls: "Crm.modules.orders.view.FilesGridController",
  filterbar: true,

  gridCfg: {
    selType: "checkboxmodel"
  },

  buildColumns: function() {
    let items = this.callParent();
    items.splice(items.length - 1, 0, {
      text: D.t("File's Type"),
      flex: 1,
      sortable: true,
      filter: this.buildTypesFilter(),
      dataIndex: "type"
    });

    return items;
  },

  buildButtonsColumns: function() {
    let me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 80,
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
              let rec = grid.getStore().getAt(rowIndex);
              if (
                rec.data.type === "Invoice" ||
                rec.data.type === "Cancellation Invoice"
              )
                return true;
              return !me.permis.del;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("delete", grid, rowIndex);
            }
          },
          {
            iconCls: "x-fa fa-retweet",
            tooltip: D.t("Cancel Invoice"),
            isDisabled: function(grid, rowIndex) {
              let rec = grid.getStore().getAt(rowIndex);
              if (
                rec.data.type === "Invoice" &&
                rec.data.invoice_id &&
                rec.data.cancelled == 0
              )
                return false;
              return true;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("cancelInvoice", grid, rowIndex);
            }
          }
        ]
      }
    ];
  },

  buildTypesFilter() {
    return {
      name: "typeFilter",
      xtype: "combo",
      editable: false,
      queryMode: "local",
      displayField: "type",
      valueField: "type",
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["type"],
        data: [
          ["Uploaded Invoice"],
          ["Invoice"],
          ["Insertion order"],
          ["Other"]
        ]
      })
    };
  }
});
