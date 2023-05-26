Ext.define("Crm.modules.transfers.view.LogsGrid", {
  extend: "Core.grid.GridContainer",

  title: null,
  iconCls: null,

  filterbar: true,
  //filterable: true,

  height: 740,

  controllerCls: "Crm.modules.transfers.view.LogsGridController",

  requires: [
    "Ext.grid.column.Date",
    "Ext.grid.column.Number",
    "Ext.grid.plugin.RowWidget"
  ],

  fields: ["id", "ctime", "code", "message", "transfer_id", "data", "request"],

  gridCfg: {
    viewConfig: {
      enableTextSelection: true,
      getRowClass: (record) => {
        if (record.data.code == "ERROR") return "pending";
      }
    }
  },

  buildColumns: function() {
    return [
      {
        xtype: "datecolumn",
        text: D.t("Date"),
        width: 150,
        sortable: true,
        format: "d.m.Y H:i",
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "ctime"
      },
      {
        text: D.t("Code"),
        flex: 1,
        sortable: true,
        dataIndex: "code",
        filter: true
      },
      {
        text: D.t("Message"),
        flex: 2,
        sortable: true,
        dataIndex: "message"
      }
    ];
  },

  buildPlugins() {
    let plugins = this.callParent();
    plugins.push({
      ptype: "rowwidget",
      onWidgetAttach: function(plugin, view, record) {
        view.down("[action=sent]").setData(record.data);
        view.down("[action=received]").setData(record.data);
      },
      widget: {
        xtype: "container",
        layout: "hbox",
        items: [
          {
            title: D.t("Sent data"),
            xtype: "panel",
            flex: 1,
            action: "sent",
            cls: "transfer-details",
            padding: "0 5 0 0",
            tpl: new Ext.XTemplate(
              "<div class='transfer-details'><div>",
              "<pre>{[JSON.stringify(JSON.parse(values.request), null, 4)]}</pre>"
            )
          },
          {
            title: D.t("Received data"),
            flex: 1,
            action: "received",
            xtype: "panel",
            cls: "transfer-details",
            padding: "0 0 0 5",
            listeners: {
              boxready: function() {
                Ext.select(
                  ".x-autocontainer-innerCt"
                ).selectable(); /*To enable user selection of text*/
              }
            },
            tpl: new Ext.XTemplate(
              "<div class='transfer-details'><div>",
              "<pre>{[JSON.stringify(JSON.parse(values.data), null, 4)]}</pre>"
            )
          }
        ]
      }
    });
    return plugins;
  },

  buildTbar() {
    let items = this.callParent();
    items.splice(0, 2);
    items.push(
      "-",
      {
        text: "Handle confirmation",
        action: "handle-callback"
      },
      "-",
      {
        text: "Send crypto manually",
        action: "crypto-manually"
      },
      "-",
      {
        text: "Resend callback",
        action: "resend-callback"
      }
    );
    return items;
  },

  buildButtonsColumns() {
    return [
      {
        xtype: "actioncolumn",
        width: 34,
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-search",
            tooltip: D.t("Show transfer"),
            isDisabled: () => {
              return !this.permis.modify && !this.permis.read;
            },
            handler: (grid, rowIndex) => {
              this.fireEvent("edit", grid, rowIndex);
            }
          },
          {
            iconCls: "x-fa fa-check",
            tooltip: D.t("Accept"),
            isDisabled: (g, index) => {
              return !g.store.getAt(index).data.held;
            },
            handler: (g, index) => {
              this.fireEvent("accept", g, g.store.getAt(index).data);
            }
          }
        ]
      }
    ];
  }
});
