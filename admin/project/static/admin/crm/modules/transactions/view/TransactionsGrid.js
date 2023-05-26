Ext.define("Crm.modules.transactions.view.TransactionsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Transactions"),
  iconCls: "x-fa fa-random",

  requires: ["Ext.grid.column.Date", "Ext.grid.column.Number"],

  filterbar: true,
  filterable: true,

  controllerCls: "Crm.modules.transactions.view.TransactionsGridController",

  buildColumns: function() {
    this.fields = [
      "id",
      "ref_id",
      "legalname",
      "ctime",
      "acc_src",
      "acc_dst",
      "amount",
      "exchange_amount",
      "plan",
      "tariff",
      "canceled",
      "held",
      "description_src",
      "description_dst",
      "currency_src",
      "currency_dst",
      "src_acc_name",
      "dst_acc_name",
      "merchant_name"
    ];
    this.eventsNames = {};
    this.eventStore = Ext.create("Ext.data.Store", {
      fields: ["key", "name"],
      data: []
    });
    return [
      {
        text: D.t("Ref.ID"),
        flex: 1,
        sortable: true,
        dataIndex: "ref_id",
        filter: true
      },
      {
        xtype: "datecolumn",
        text: D.t("Date"),
        flex: 1,
        sortable: true,
        format: "d.m.Y H:i:s",
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "ctime"
      },
      {
        text: D.t("User"),
        width: 120,
        sortable: true,
        dataIndex: "legalname",
        filter: true
      },
      {
        text: D.t("Merchant"),
        width: 120,
        sortable: true,
        dataIndex: "merchant_name",
        filter: this.buildMerchantCombo()
      },
      {
        text: D.t("Src Acc Name"),
        flex: 1,
        sortable: true,
        dataIndex: "src_acc_name",
        filter: true
      },
      {
        text: D.t("Source Acc"),
        flex: 1,
        sortable: true,
        dataIndex: "acc_src",
        filter: true
      },
      {
        text: D.t("Dst Acc Name"),
        flex: 1,
        sortable: true,
        dataIndex: "dst_acc_name",
        filter: true
      },
      {
        text: D.t("Destination Acc"),
        flex: 1,
        sortable: true,
        dataIndex: "acc_dst",
        filter: true
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
        width: 70,
        sortable: true,
        dataIndex: "currency_src",
        filter: this.buildCurrencyCombo()
      },
      {
        text: D.t("Amount exchanged"),
        xtype: "numbercolumn",
        align: "right",
        width: 120,
        sortable: true,
        dataIndex: "exchange_amount",
        filter: true
      },
      {
        text: D.t("Currency"),
        width: 70,
        sortable: true,
        dataIndex: "currency_dst",
        filter: this.buildCurrencyCombo()
      },

      {
        text: D.t("Held"),
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
      }
    ];
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
        view.down("panel").setData(record.data);
      },
      widget: {
        xtype: "container",
        items: [{ xtype: "panel", tpl: this.detailsTpl() }]
      }
    });

    return plugins;
  },
  detailsTpl() {
    return new Ext.XTemplate(
      "<table width='100%'><tr valign=top>",
      "<td width='50%'><p><b>Ref.ID:</b> {ref_id}</p>",
      "<p><b>Date:</b> {ctime}</p>",
      "<p><b>Tariff Plan:</b> {plan}</p>",
      "<p><b>Tariff:</b> {tariff}</p>",
      "<p><b>Source Account:</b> {acc_src}</p>",
      "<p><b>Source Destination:</b> {acc_dst}</p></td><td>",
      "<p><b>Amount:</b> {amount}  {currency_src}</p>",
      "<tpl if='currency_src != currency_dst'>",
      "<p><b>Exchanged amount:</b> {exchange_amount} {currency_dst}</p>",
      "<p><b>Exchanged rate:</b> {[values.exchange_amount/values.amount]}</p>",
      "</tpl>",
      "<p><b>Held:</b> {held}</p>",
      "<p><b>Canceled:</b> {canceled}</p>",
      "<p><b>Reason for transaction:</b> {description_src}</p>",
      "</td></tr></table>"
    );
  },

  buildTbar() {
    let items = this.callParent();
    items.splice(
      0,
      2,
      {
        iconCls: "x-fa fa-download",
        text: D.t("Export"),
        action: "accountsExportTransactions"
      },
      "-"
    );

    return items;
  },

  buildButtonsColumns() {
    return [
      {
        xtype: "actioncolumn",
        width: 34,
        items: [
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
