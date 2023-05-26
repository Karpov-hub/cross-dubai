Ext.define("Crm.modules.nilRatesHistory.view.AverageDailyHistoryGrid", {
  extend: "Core.grid.GridContainer",

  filterbar: true,

  controllerCls:
    "Crm.modules.nilRatesHistory.view.AverageDailyHistoryGridController",

  buildColumns: function() {
    return [
      {
        text: D.t("Date"),
        width: 150,
        sortable: true,
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "ctime",
        renderer: (v) => {
          return Ext.Date.format(new Date(v), "d.m.Y");
        }
      },
      {
        text: D.t("Sell"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "sell"
      },
      {
        text: D.t("Buy"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "buy"
      }
    ];
  },

  buildTbar: function() {
    let buttons = this.callParent(arguments);
    return [buttons[2], "->", this.buildCurrencyPairCombo()];
  },

  buildCurrencyPairCombo() {
    return {
      xtype: "combo",
      name: "currency_pair_filter",
      store: {
        fields: ["name"],
        data: []
      },
      valueField: "name",
      displayField: "name"
    };
  },

  buildButtonsColumns() {
    return;
  }
});
