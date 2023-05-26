Ext.define("Core.data.StoreTransfers", {
  extend: "Core.data.Store",
  groupField: "plan_transfer_id",
  remoteFilter: true,
  remoteSort: true,
  statefulFilters: true
});

Ext.define("Crm.modules.transfers.view.TransfersByPlanGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Transfers by plan"),
  iconCls: "x-fa fa-money-bill-alt",
  detailsInDialogWindow: true,

  requires: [
    "Ext.grid.column.Date",
    "Ext.grid.column.Number",
    "Ext.grid.plugin.RowWidget",
    "Ext.grid.feature.Grouping"
  ],

  height: 300,

  controllerCls: "Crm.modules.transfers.view.TransfersByPlanGridController",

  filterbar: true,

  fields: [
    "id",
    "ctime",
    "event_name",
    "realmname",
    "held",
    "canceled",
    "notes",
    "amount",
    "username",
    "legalname",
    "user_type",
    "notes",
    "description",
    "data",
    "ref_id",
    "transactions",
    "string_status",
    "data",
    "currency",
    "combo_event",
    "plan_transfer_id",
    "plan_name",
    "hash",
    "exchange_price",
    "exchange_quantity"
  ],

  gridCfg: {
    viewConfig: {
      getRowClass: (record) => {
        if (record.data.show_to_client === false) return "show-to-client";
        if (record.data.held && !record.data.canceled) return "pending";
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
        text: D.t("Plan transfer ID"),
        width: 160,
        sortable: true,
        dataIndex: "plan_transfer_id",
        filter: true,
        hidden: true
      },
      {
        text: D.t("Description"),
        width: 120,
        sortable: true,
        dataIndex: "description",
        filter: true
      },
      {
        text: D.t("Client"),
        flex: 1,
        sortable: true,
        dataIndex: "legalname",
        filter: this.buildGroupCombo()
      },
      {
        text: D.t("Merchant"),
        flex: 1,
        sortable: true,
        dataIndex: "organisation_name",
        filter: this.buildMerchantCombo()
      },
      {
        text: D.t("Amount"),
        align: "right",
        width: 120,
        sortable: true,
        dataIndex: "amount",
        filter: true
      },
      {
        text: D.t("Currency"),
        width: 120,
        sortable: true,
        dataIndex: "currency",
        filter: this.buildCurrencyCombo()
      },
      {
        text: D.t("Held"),
        hidden: true,
        width: 80,
        sortable: true,
        dataIndex: "held",
        renderer: (v) => {
          return v ? "Held" : "No";
        },
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          editable: false,
          store: [
            [true, "Held"],
            [false, "No"]
          ],
          operator: "eq"
        }
      },
      {
        text: D.t("Canceled"),
        hidden: true,
        width: 80,
        sortable: true,
        dataIndex: "canceled",
        renderer: (v) => {
          return v ? "Canceled" : "No";
        },
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          editable: false,
          store: [
            [true, "Canceled"],
            [false, "No"]
          ],
          operator: "eq"
        }
      },
      {
        text: D.t("Status"),
        width: 120,
        sortable: true,
        dataIndex: "string_status",
        filter: this.buildStatusFilter()
      },
      {
        text: D.t("Hash"),
        flex: 2,
        sortable: true,
        dataIndex: "hash",
        filter: true
      },
      {
        text: D.t("Sent amount"),
        flex: 2,
        sortable: true,
        dataIndex: "sent_amount",
        filter: true
      },
      {
        text: D.t("Exchange price"),
        width: 150,
        sortable: true,
        dataIndex: "exchange_price",
        filter: true
      },
      {
        text: D.t("Exchange quantity"),
        width: 150,
        sortable: true,
        dataIndex: "exchange_quantity",
        filter: true
      }
    ];
  },
  buildStatusFilter() {
    return {
      name: "status",
      xtype: "combo",
      editable: false,
      queryMode: "local",
      displayField: "status",
      valueField: "status",
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["status"],
        data: [["TRANSFERRED"], ["PENDING"], ["CANCELED"]].sort()
      })
    };
  },

  buildCurrencyCombo() {
    return {
      name: "currency",
      xtype: "combo",
      editable: false,
      queryMode: "local",
      displayField: "abbr",
      valueField: "abbr",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.currency.model.CurrencyModel"),
        fieldSet: ["abbr"],
        scope: this,
        sorters: [{ property: "abbr", direction: "asc" }]
      })
    };
  },

  buildMerchantCombo() {
    return {
      xtype: "combo",
      valueField: "name",
      displayField: "name",
      name: "merchant_combo",
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.merchants.model.MerchantsModel"),
        fieldSet: "id,name",
        scope: this,
        sorters: [{ property: "name", direction: "asc" }]
      })
    };
  },

  buildPlugins() {
    let plugins = this.callParent();
    plugins.push({
      ptype: "rowwidget",
      onWidgetAttach: function(plugin, view, record) {
        view
          .down("grid")
          .getStore()
          .loadData(record.data.transactions);
        view.down("panel").setData(record.data);
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
            xtype: "panel",
            cls: "transfer-details",
            //padding: 10,
            tpl: new Ext.XTemplate(
              "<div class='transfer-details'><div>",
              "<p><b>Ref.ID:</b> {ref_id}</p>",
              "<tpl if='ctime'><p><b>Date:</b> {ctime:date('d.m.Y H:i')}</p></tpl>",
              "<tpl if='realmname'><p><b>Realm:</b> {realmname}</p></tpl>",
              "<tpl if='legalname'><p><b>Client:</b> {legalname}</p></tpl>",
              "<tpl if='amount'><p><b>Amount:</b> {amount} {currency}</p></tpl>",
              "<tpl if='held'><p><b>Held:</b> Yes</p></tpl>",
              "<tpl if='canceled'><p><b>Canceled:</b> Yes</p></tpl>",
              "<tpl if='!held'><p><b>Held:</b> No</p></tpl>",
              "<tpl if='!canceled'><p><b>Canceled:</b> No</p></tpl>",
              "<tpl><p><b>Description:</b> {description}</p></tpl>",
              "<tpl if='notes'><p><b>Notes:</b> {notes}</p></tpl>",
              "<tpl if='data.bank'><p><b>Bank name:</b> {data.bank.shortname}</p></tpl>",
              "<tpl if='data.deposit_date'><p><b>Deposit date:</b> {data.deposit_date}</p></tpl>",
              "<tpl if='data.netData'><div><b>Network Data:</b><br><pre>{data.netData}</pre></div></tpl>",
              `<tpl if='data.pdf_invoice'><a href="${__CONFIG__.downloadFileLink}/{data.pdf_invoice}">Download Invoice</a></tpl>`
            )
          },
          {
            flex: 1,
            xtype: "grid",
            title: "Children transactions",
            store: {
              fields: [
                "acc_src",
                "acc_dst",
                "id",
                "amount",
                "exchange_amount",
                "currency_src",
                "currency_dst",
                "plan",
                "description_src",
                "tariff"
              ],
              data: []
            },
            bind: {},
            columns: [
              {
                text: "Source Account",
                dataIndex: "acc_src",
                flex: 1
              },
              {
                text: "Destination Account",
                dataIndex: "acc_dst",
                flex: 1
              },
              {
                text: "Reason for transaction",
                dataIndex: "description_src",
                flex: 1
              },
              {
                align: "right",
                width: 120,
                text: "Amount",
                dataIndex: "amount"
              },
              {
                text: "Currency",
                dataIndex: "currency_src",
                width: 70
              },
              {
                align: "right",
                width: 120,
                text: "Exchanged amount",
                dataIndex: "exchange_amount"
              },
              {
                text: "Currency",
                dataIndex: "currency_dst",
                width: 70
              },
              {
                xtype: "actioncolumn",
                width: 24,
                menuDisabled: true,
                items: [
                  {
                    iconCls: "x-fa fa-edit",
                    tooltip: this.buttonEditTooltip,
                    handler: (a, b, c, d, e, record) => {
                      this.fireEvent("edittransaction", record.data);
                    }
                  }
                ]
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

    items.splice(0, 1);
    return items;
  },

  buildTbar() {
    let items = this.callParent();
    items.splice(0, 1, {
      iconCls: "x-fa fa-download",
      text: D.t("Export"),
      action: "exportTransfers"
    });
    return items;
  },

  buildGroupCombo() {
    return {
      xtype: "combo",
      valueField: "legalname",
      displayField: "legalname",
      name: "merchant_combo",
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.accountHolders.model.UsersModel"),
        fieldSet: "id,legalname",
        scope: this,
        sorters: [{ property: "legalname", direction: "asc" }]
      })
    };
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
          }
        ]
      }
    ];
  },

  createStore: function() {
    return Ext.create("Core.data.StoreTransfers", this.getStoreConfig());
  },

  buildItems() {
    const cfg = this.callParent(arguments);
    // cfg.features = [
    //   {
    //     ftype: "grouping",
    //     startCollapsed: true,
    //     groupHeaderTpl: `{[Ext.Date.format(new Date(values.rows[0].data.ctime), 'd.m.Y H:i') + ', <b>'+values.rows[0].data.plan_name+'</b>']} ({rows.length} transfer{[values.rows.length > 1 ? "s" : ""]})`
    //   }
    // ];
    return cfg;
  }
});
