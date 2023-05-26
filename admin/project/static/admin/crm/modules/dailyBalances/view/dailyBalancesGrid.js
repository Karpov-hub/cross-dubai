Ext.define("Crm.modules.dailyBalances.view.dailyBalancesGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Daily Balances"),
  iconCls: "x-fa fa-list",

  buildColumns: function() {
    return [
      { dataIndex: "id", hidden: true },
      {
        text: D.t("Date"),
        width: 150,
        sortable: true,
        dataIndex: "ctime",
        renderer: (v) => {
          return Ext.Date.format(new Date(v), "d.m.Y H:i:s");
        }
      },
      {
        text: D.t("SK Balances"),
        flex: 1,
        sortable: true,
        dataIndex: "sk_balances",
        renderer: (v) => {
          let out = "";
          for (const wallet of v.result) {
            out += `${wallet.abbr} - ${wallet.balance} `;
          }
          return out;
        }
      },
      {
        text: D.t("NIL Balances"),
        flex: 1,
        sortable: true,
        dataIndex: "nil_balances",
        renderer: (v) => {
          return Object.keys(v.result).map((key) => {
            return ` ${key} ${v.result[key]}`;
          });
        }
      },
      {
        text: D.t("Deposits on hold"),
        flex: 1,
        sortable: true,
        dataIndex: "deposits_on_hold",
        renderer: (v) => {
          return v.result.length;
        }
      },
      {
        text: D.t("Ready to payout"),
        flex: 1,
        sortable: true,
        dataIndex: "ready_to_payout",
        renderer: (v) => {
          return v.result.length;
        }
      }
    ];
  },

  buildTbar: function() {
    var items = [];
    items.push({
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-sync",
      action: "refresh"
    });

    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  },

  buildButtonsColumns: function() {
    var me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 34,
        items: [
          {
            iconCls: "x-fa fa-edit",
            tooltip: D.t("View"),
            handler: function(grid, rowIndex) {
              me.fireEvent("edit", grid, rowIndex);
            }
          }
        ]
      }
    ];
  }
});
