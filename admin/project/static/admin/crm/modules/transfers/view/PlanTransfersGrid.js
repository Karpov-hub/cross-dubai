Ext.define("Crm.modules.transfers.view.PlanTransfersGrid", {
  extend: "Crm.modules.transfers.view.TransfersGrid",

  controllerCls: "Crm.modules.transfers.view.PlanTransfersGridController",

  filterbar: false,
  filterable: false,

  model: Ext.create("Crm.modules.transfers.model.TransfersModel"),

  buildTbar() {
    let items = this.callParent();

    let disable_tbar_buttons = false;
    if (this.scope && this.scope.config && this.scope.config.from_calc)
      disable_tbar_buttons = true;

    items.splice(
      0,
      6,
      {
        iconCls: "x-fa fa-ban",
        text: D.t("Cancel payment"),
        action: "cancel_payment",
        hidden: true,
        disabled: disable_tbar_buttons
      },
      {
        iconCls: "x-fa fa-check",
        text: D.t("Resume payment"),
        action: "resume_payment",
        hidden: true,
        disabled: disable_tbar_buttons
      },
      "-"
    );
    return items;
  },

  fields: [
    "id",
    "plan_transfer_id",
    "ctime",
    "amount",
    "description",
    "data",
    "show_to_client",
    "held",
    "canceled",
    "string_status"
  ],

  buildColumns: function() {
    let me = this;
    return [
      {
        xtype: "datecolumn",
        text: D.t("Date"),
        width: 150,
        sortable: true,
        format: "d.m.Y H:i",

        dataIndex: "ctime"
      },

      {
        text: D.t("Amount"),
        align: "right",
        width: 120,
        sortable: true,
        dataIndex: "amount",
        renderer: (v, m, r) => {
          return `${v} ${r.data.data.plan.from.currency}`;
        }
      },
      {
        text: D.t("Description"),
        sortable: true,
        flex: 1,
        dataIndex: "description"
      },
      {
        text: D.t("Crypto address"),
        sortable: true,
        flex: 1,
        dataIndex: "data",
        renderer: (v) => {
          return `${v.plan.to.extra || ""}`;
        }
      },
      {
        text: D.t("Show to Client"),
        xtype: "checkcolumn",
        width: 80,
        sortable: true,
        dataIndex: "show_to_client",
        action: "show_client",
        listeners: {
          checkchange(el, rowIdx, checked, record) {
            me.model.showClient({
              id: record.data.id,
              show_to_client: checked
            });
          }
        }
      },
      {
        text: D.t("Held"),

        width: 80,
        sortable: true,
        dataIndex: "held",
        renderer: (v, m, r) => {
          return v ? "Held" : "No";
        }
      },
      {
        text: D.t("Canceled"),
        width: 80,
        sortable: true,
        dataIndex: "canceled",
        renderer: (v) => {
          return v ? "Canceled" : "No";
        }
      },
      {
        text: D.t("Status"),
        width: 120,
        sortable: true,
        dataIndex: "string_status"
      }
    ];
  },

  buildButtonsColumns() {}
});
