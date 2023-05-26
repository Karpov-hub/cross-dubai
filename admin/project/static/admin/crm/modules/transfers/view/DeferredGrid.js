Ext.define("Crm.modules.transfers.view.DeferredGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Deferred transfers"),

  gridCfg: {
    selType: "checkboxmodel"
  },
  controllerCls: "Crm.modules.transfers.view.DeferredGridController",
  buildColumns: function() {
    this.eventsNames = {};
    this.eventStore = Ext.create("Ext.data.Store", {
      fields: ["key", "name"],
      data: []
    });
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
        text: D.t("Merchant"),
        flex: 2,
        sortable: true,
        dataIndex: "data",
        renderer: (v) => {
          return v.organisation_name || "";
        }
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
        dataIndex: "data",
        filter: false,
        renderer: (v) => {
          return v ? v.currency : "";
        }
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

  buildButtonsColumns() {
    return null;
  },

  buildTbar() {
    let items = this.callParent();
    items.splice(0, 2);

    items.push("->", {
      xtype: "label",
      name: "deferred_amount",
      text: ""
    });
    return items;
  }
});
