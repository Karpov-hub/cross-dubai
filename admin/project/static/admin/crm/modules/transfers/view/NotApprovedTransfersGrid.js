Ext.define("Crm.modules.transfers.view.NotApprovedTransfersGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Approval of transfers"),
  iconCls: "x-fa fa-university",

  filterbar: true,
  detailsInDialogWindow: true,

  controllerCls:
    "Crm.modules.transfers.view.NotApprovedTransfersGridController",

  fields: [
    "id",
    "ctime",
    "merchant_id",
    "amount",
    "currency",
    "result_amount",
    "result_currency",
    "plan_id",
    "description",
    "tariff",
    "status",
    "approver",
    "ref_id",
    "is_draft",
    "last_rejection_reason",
    "variables"
  ],

  gridCfg: {
    viewConfig: {
      getRowClass: (record) => {
        if (record.data.is_draft) {
          if (record.data.last_rejection_reason) return "pending";
          return "disabled";
        }
      }
    }
  },

  buildColumns: function () {
    return [
      {
        text: D.t("Creation date"),
        flex: 1,
        sortable: true,
        hidden: Ext.platformTags.phone,
        dataIndex: "ctime",
        format: "d.m.Y H:i",
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        renderer: (v, m, r) => {
          return Ext.Date.format(new Date(v), "d.m.Y H:i:s");
        }
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
        text: D.t("Amount"),
        flex: 1,
        sortable: true,
        dataIndex: "amount",
        filter: true,
        renderer(v, m, r) {
          return `${r.data.amount || "--"} ${r.data.currency}`;
        }
      },
      {
        text: D.t("Receiving"),
        flex: 1,
        sortable: true,
        dataIndex: "result_amount",
        filter: true,
        hidden: true,
        renderer(v, m, r) {
          return `${r.data.result_amount || "--"} ${r.data.result_currency}`;
        }
      },
      {
        text: D.t("Plan"),
        flex: 1,
        sortable: true,
        hidden: true,
        dataIndex: "plan_id",
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          valueField: "id",
          displayField: "name",
          store: Ext.create("Core.data.ComboStore", {
            dataModel: Ext.create("Crm.modules.accountsPlan.model.PlansModel"),
            fieldSet: ["id", "name"],
            scope: this
          })
        },
        renderer(v) {
          return v.name;
        }
      },
      {
        text: D.t("Status"),
        flex: 1,
        sortable: true,
        dataIndex: "status",
        hidden: true,
        filter: {
          xtype: "combo",
          valueField: "key",
          displayField: "val",
          store: {
            fields: ["key", "val"],
            data: [
              { key: 0, val: D.t("Not approved") },
              { key: 1, val: D.t("Approved") }
            ]
          }
        },
        renderer(v) {
          return D.t(["Not approved", "Approved"][v]);
        }
      },
      {
        text: D.t("Approver"),
        flex: 1,
        sortable: true,
        hidden: true,
        dataIndex: "approver",
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          valueField: "_id",
          displayField: "name",
          store: Ext.create("Core.data.ComboStore", {
            dataModel: Ext.create("Crm.modules.users.model.UsersModel"),
            fieldSet: ["_id", "name"],
            scope: this
          })
        },
        renderer(v) {
          return v ? v.name : "--";
        }
      }
    ];
  },
  buildTbar() {
    let tBButtons = this.callParent(arguments);
    return [tBButtons[2]];
  },
  buildButtonsColumns() {
    let buttons = this.callParent(arguments);
    const disableButton = (grid, rowIndex, colIndex, items, record) => {
      return !!record.data.approver;
    };
    buttons[0].items[0].iconCls = "x-fa fa-money-bill-alt";
    buttons[0].items[0].isDisabled = disableButton;
    buttons[0].items[0].tooltip = D.t("Show summary");
    buttons[0].items[1].isDisabled = (
      grid,
      rowIndex,
      colIndex,
      items,
      record
    ) => {
      if (this.config && this.config.from_calc) return true;
      return disableButton(grid, rowIndex, colIndex, items, record);
    };
    return buttons;
  }
});
