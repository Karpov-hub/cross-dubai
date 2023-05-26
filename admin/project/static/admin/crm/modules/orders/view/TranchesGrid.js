Ext.define("Crm.modules.orders.view.TranchesGrid", {
  extend: "Core.grid.GridContainer",

  controllerCls: "Crm.modules.orders.view.TranchesGridController",

  buildColumns() {
    return [
      {
        flex: 1,
        dataIndex: "no",
        text: D.t("No")
      },
      { dataIndex: "ref_id", hidden: true },
      {
        flex: 1,
        dataIndex: "data",
        text: D.t("Amount"),
        renderer(v) {
          return v ? v.amount_tranche : 0;
        }
      },
      {
        flex: 1,
        dataIndex: "data",
        text: D.t("From currency"),
        renderer(v) {
          return v ? v.amount_tranche_currency : "-";
        }
      },
      {
        flex: 1,
        dataIndex: "data",
        text: D.t("Working currency"),
        renderer(v) {
          return v ? v.to_currency_amount_tranche_currency : "-";
        }
      },
      {
        flex: 1,
        dataIndex: "ctime",
        text: D.t("Creating date"),
        xtype: "datecolumn",
        format: "d.m.Y H:i:s",
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        }
      }
    ];
  },
  buildButtonsColumns() {
    let me = this;
    let buttons_column = this.callParent(arguments);
    buttons_column[0].items.shift();
    buttons_column[0].items[0].isDisabled = function() {
      return (
        me.ownerCt.ownerCt.ownerCt.ownerCt.ownerCt.currentData.status !=
        me.ownerCt.ownerCt.ownerCt.ownerCt.ownerCt.controller.orders_statuses[0]
      );
    };
    return buttons_column;
  },

  buildTbar() {
    let items = this.callParent(arguments);
    return [
      { action: "add_new_tranche", text: D.t("New tranche"), disabled: true },
      items[2]
    ];
  }
});
