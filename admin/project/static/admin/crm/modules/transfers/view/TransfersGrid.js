Ext.define("Core.data.StoreTransfers", {
  extend: "Core.data.Store",
  groupField: "plan_transfer_id",
  remoteFilter: true,
  remoteSort: true,
  statefulFilters: true
});

Ext.define("Crm.modules.transfers.view.TransfersGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Transfers"),
  iconCls: "x-fa fa-money-bill-alt",
  detailsInDialogWindow: true,

  requires: [
    "Ext.grid.column.Date",
    "Ext.grid.column.Number",
    "Ext.grid.plugin.RowWidget",
    "Ext.grid.feature.Grouping"
  ],
  height: 500,
  controllerCls: "Crm.modules.transfers.view.TransfersGridController",

  filterbar: true,
  //filterable: true,

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
    "currency",
    "combo_event",
    "plan_transfer_id",
    "plan_name"
  ],

  gridCfg: {
    viewConfig: {
      getRowClass: (record) => {
        if (record.data.show_to_client === false) {
          if (record.data.invisibility_exp_date)
            return "show-to-client-with-exp-date";
          return "show-to-client";
        }
        if (record.data.held && !record.data.canceled) return "pending";
      }
    }
  },

  buildColumns: function() {
    this.eventsNames = {
      "account-service:withdrawalCustomExchangeRate":
        "Withdrawal money outside",
      "account-service:deposit": "Deposit money into the system",
      "ccoin-service:completeTransfer":
        "Callback function for complete payments",
      "ccoin-service:deposit": "Callback function for deposit payments",
      "account-service:realmtransfer": "Inner transfer",
      // "account-service:bankCharge": "Bank charges",
      "account-service:doPipe": "Payment by plan"
    };
    this.eventStore = Ext.create("Ext.data.Store", {
      fields: ["key", "name"],
      data: [
        {
          key: "account-service:withdrawalCustomExchangeRate",
          name: "Withdrawal money outside"
        },
        {
          key: "account-service:deposit",
          name: "Deposit money into the system"
        },
        {
          key: "ccoin-service:completeTransfer",
          name: "Callback function for complete payments"
        },
        {
          key: "ccoin-service:deposit",
          name: "Callback function for deposit payments"
        },
        {
          key: "account-service:realmtransfer",
          name: "Inner transfer"
        },
        // {
        //   key: "account-service:bankCharge",
        //   name: "Bank charges"
        // },
        {
          key: "account-service:doPipe",
          name: "Payment by plan"
        }
      ],
      sorters: [{ property: "name", direction: "asc" }]
    });

    return [
      {
        dataIndex: "combo_event",
        hidden: true
      },
      {
        xtype: "datecolumn",
        text: D.t("Date 1"),
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
        text: D.t("Event"),
        flex: 1,
        sortable: true,
        dataIndex: "event_name",
        hidden: true,
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          editable: false,
          valueField: "key",
          displayField: "name",
          store: this.eventStore,
          operator: "eq"
        },
        renderer: (v, m, d) => {
          return this.eventsNames[v] ? this.eventsNames[v] : v;
        }
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
        flex: 2,
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
        filter: this.buildCurrencyCombo(),
        hidden: true
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
        text: D.t("Sent amount"),
        width: 120,
        sortable: true,
        dataIndex: "data",
        filter: false,
        renderer: (v) => {
          if (v && v.sentAmount) return `${v.sentAmount} ${v.currency}`;
          return "";
        }
      },
      {
        text: D.t("Purpose amount"),
        width: 120,
        sortable: true,
        dataIndex: "data",
        filter: false,
        renderer: (v) => {
          if (v && v.finAmount) return `${v.finAmount} ${v.to_currency}`;
          return "";
        }
      },
      {
        text: D.t("Exchange rate"),
        width: 120,
        sortable: true,
        dataIndex: "data",
        filter: false,
        renderer: (v) => {
          if (v && v.custom_exchange_rate) return `${v.custom_exchange_rate}`;
          return "";
        }
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
        data: [
          ["EXCHANGED"],
          ["ON MASTER"],
          ["ON MONITORING"],
          ["TRANSFERRED"],
          ["PENDING"],
          ["CANCELED"]
        ].sort()
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
          .down("[action=tx_grid]")
          .getStore()
          .loadData(record.data.transactions);
        view.down("panel").setData(record.data);

        if (record.data && record.data.data && record.data.data.callbackData) {
          view.down("[action=crypto_tx_grid]").setHidden(false);
          view
            .down("[action=crypto_tx_grid]")
            .getStore()
            .loadData([JSON.parse(record.data.data.callbackData)]);
        }
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
            tpl: new Ext.XTemplate(
              "<div><div>",
              "<p><b>Ref.ID:</b> {ref_id}</p>",
              "<tpl if='ctime'><p><b>Date:</b> {ctime:date('d.m.Y H:i')}</p></tpl>",
              "<tpl if='event_name'><p><b>Event:</b> {event_name}</p></tpl>",
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
            padding: "10 0 10 0",
            xtype: "grid",
            action: "crypto_tx_grid",
            title: "Crypto transactions",
            hidden: true,
            store: {
              fields: [
                "txId",
                "address",
                "txStatus",
                "amount",
                "currencyId",
                "fromAddress",
                "address",
                "amount_fee",
                "currency_fee"
              ],
              data: []
            },
            bind: {},
            columns: [
              {
                text: "Hash Id",
                dataIndex: "txId",
                flex: 1
              },
              {
                text: "From address",
                dataIndex: "fromAddress",
                flex: 1
              },
              {
                text: "To address",
                dataIndex: "address",
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
                dataIndex: "currencyId",
                width: 100
              },
              {
                text: "Status",
                dataIndex: "txStatus",
                width: 120
              }
            ]
          },
          {
            flex: 1,
            xtype: "grid",
            padding: "0 0 10 0",
            action: "tx_grid",
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
                width: 100
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
                width: 100
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
          },
          {
            iconCls: "x-fa fa-ban",
            tooltip: D.t("Cancel"),
            isDisabled: (g, index) => {
              return !g.store.getAt(index).data.held;
            },
            handler: (g, index) => {
              this.fireEvent("cancel", g, g.store.getAt(index).data);
            }
          },
          {
            iconCls: "x-fa fa-retweet",
            tooltip: D.t("Adjust transfer"),
            isDisabled: (g, index) => {
              if (
                g.store.getAt(index).data.event_name !=
                "account-service:deposit"
              )
                return !g.store.getAt(index).data.held;
            },
            handler: (g, index) => {
              this.fireEvent(
                "adjust_deposit_form",
                g,
                g.store.getAt(index).data
              );
            }
          },
          {
            iconCls: "x-fa fa-eye",
            tooltip: D.t("Show to client"),
            isDisabled: (g, index) => {
              return g.store.getAt(index).data.show_to_client;
            },
            handler: (g, index) => {
              this.fireEvent("show_deposit", g, g.store.getAt(index).data);
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
    cfg.features = [
      {
        ftype: "grouping",
        startCollapsed: true,
        groupHeaderTpl: `{[values.rows[0].data.event_name == 'account-service:doPipe'? Ext.Date.format(new Date(values.rows[0].data.ctime), 'd.m.Y H:i') + ', <b>'+values.rows[0].data.plan_name+'</b>' + (values.rows[0].data.tf_by_plan_description && values.rows[0].data.tf_by_plan_description.admin ? ', Description: ' +values.rows[0].data.tf_by_plan_description.admin:''):'<b>Others</b>']} ({rows.length} transfer{[values.rows.length > 1 ? "s" : ""]})`
      }
    ];
    return cfg;
  }
});
