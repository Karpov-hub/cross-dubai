Ext.define("Crm.modules.chainOfWallets.view.WalletsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Chains of wallets"),
  detailsInDialogWindow: true,

  filterable: true,
  filterbar: true,

  gridCfg: {
    viewConfig: {
      getRowClass: (record) => {
        if (record.data.status) return "disabled";
      }
    }
  },

  buildColumns: function() {
    return [
      {
        text: D.t("Wallets in a chain"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "wallets"
      },
      {
        text: D.t("Merchant"),
        flex: 1,
        sortable: true,
        dataIndex: "merchant_id",
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          valueField: "id",
          displayField: "name",
          store: Ext.create("Core.data.ComboStore", {
            dataModel: Ext.create("Crm.modules.merchants.model.MerchantsModel"),
            fieldSet: ["id", "name"],
            scope: this
          })
        },
        renderer(v) {
          return v.name;
        }
      },
      {
        text: D.t("Wallet sender"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "wallet_sender"
      },
      {
        text: D.t("Wallet receiver"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "wallet_receiver"
      },
      {
        xtype: "datecolumn",
        text: D.t("First payment date"),
        flex: 1,
        sortable: true,
        filter: true,
        format: "d.m.Y H:i:s",
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "first_payment_date"
      },
      {
        text: D.t("Lifespan (days)"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "lifespan"
      },
      {
        text: D.t("Deactivated"),
        flex: 1,
        sortable: true,
        dataIndex: "status",
        filter: {
          xtype: "combo",
          valueField: "key",
          displayField: "val",
          store: {
            fields: ["key", "val"],
            data: [
              { key: 0, val: D.t("No") },
              { key: 1, val: D.t("Yes") }
            ]
          }
        },
        renderer(v) {
          return D.t(["No", "Yes"][v]);
        }
      }
    ];
  },

  buildPlugins() {
    let plugins = this.callParent();
    plugins.push({
      ptype: "rowwidget",
      onWidgetAttach: function(plugin, view, record) {
        view
          .down("grid")
          .getStore()
          .loadData(record.data.wallets);
      },
      widget: {
        xtype: "container",
        layout: {
          type: "vbox",
          pack: "start",
          align: "stretch"
        },
        items: [
          {
            flex: 1,
            xtype: "grid",
            store: {
              fields: ["wallet"],
              data: []
            },
            bind: {},
            columns: [
              {
                text: "Wallets in a chain",
                dataIndex: "wallet",
                flex: 1,
                renderer(v, m, r) {
                  return r.data;
                }
              }
            ]
          }
        ]
      }
    });
    return plugins;
  },

  buildTbar() {
    let items = this.callParent();
    items.splice(0, 2);
    return items;
  },

  buildButtonsColumns: function() {
    var me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 30,
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-trash-alt",
            tooltip: this.buttonDeleteTooltip,
            isDisabled: function() {
              return !me.permis.del;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("delete", grid, rowIndex);
            }
          }
        ]
      }
    ];
  }
});
