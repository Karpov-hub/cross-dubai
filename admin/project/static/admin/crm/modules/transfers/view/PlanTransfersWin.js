Ext.define("Crm.modules.transfers.view.PlanTransfersWin", {
  extend: "Core.form.FormWindow",

  titleTpl: "Transfers by plan",
  iconCls: "x-fa fa-money-bill-alt",

  formMargin: 0,

  onActivate() {},
  onClose() {},

  controllerCls: "Crm.modules.transfers.view.PlanTransfersWinController",
  model: Ext.create("Crm.modules.transfers.model.PlanTransfersModel"),

  initComponent() {
    this.infoTpl = Ext.create(
      "Crm.modules.transfers.view.templates.planWithdrawal"
    );
    this.callParent(arguments);
  },

  buildForm: function() {
    return {
      xtype: "form",
      layout: "border",
      items: [this.buildInfo(), this.buildTransfersGrid()]
    };
  },

  buildInfo() {
    this.DataPanel = Ext.create("Ext.panel.Panel");
    return {
      title: D.t("INFO"),
      xtype: "panel",
      region: "west",
      split: true,
      width: 400,
      items: [
        {
          xtype: "textfield",
          name: "plan_transfer_id",
          hidden: true
        },
        this.DataPanel
      ]
    };
  },

  buildTransfersGrid() {
    return {
      title: D.t("Transfers"),
      xtype: "panel",
      region: "center",
      items: Ext.create("Crm.modules.transfers.view.PlanTransfersGrid", {
        observe: [{ property: "plan_transfer_id", param: "plan_transfer_id" }],
        name: "transfers_grid",
        title: null,
        iconCls: null,
        scope: this
      })
    };
  },

  setValues(data) {
    setTimeout(() => {
      this.down("form")
        .getForm()
        .setValues(data);
    }, 1000);
  },

  buildButtons() {
    return [
      {
        text: D.t("Download report"),
        iconCls: "x-fa fa-print",
        action: "downloadReport"
      },
      "->",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  },

  applyEventTpl() {
    this.DataPanel.add({
      xtype: "panel",
      action: "datapanel",
      name: "transfer_info",
      cls: "details-panel printcontent",
      listeners: {
        boxready: function() {
          Ext.select(
            ".x-autocontainer-innerCt"
          ).selectable(); /*To enable user selection of text*/
        }
      },
      tpl: this.infoTpl.build()
    });
  }
});
