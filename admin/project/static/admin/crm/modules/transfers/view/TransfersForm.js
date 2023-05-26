Ext.define("Crm.modules.transfers.view.TransfersForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Transfer: {id} - {status}"),

  formMargin: 0,
  formLayout: "fit",

  controllerCls: "Crm.modules.transfers.view.TransfersFormController",

  templates: {
    default: Ext.create("Crm.modules.transfers.view.templates.default"),
    "account-service:deposit": Ext.create(
      "Crm.modules.transfers.view.templates.deposit"
    ),
    "account-service:withdrawal": Ext.create(
      "Crm.modules.transfers.view.templates.planWithdrawal"
    ),
    "account-service:withdrawalCustomExchangeRate": Ext.create(
      "Crm.modules.transfers.view.templates.withdrawalCustomExchangeRate"
    )
  },

  buildItems: function() {
    return {
      xtype: "tabpanel",
      layout: "fit",
      items: [this.buildGeneral(), this.buildDocuments(), this.buildLogsPanel()]
    };
  },

  buildGeneral() {
    var me = this;
    this.DataPanel = Ext.create("Ext.panel.Panel", {
      xtype: "panel",
      region: "center",
      items: [
        {
          xtype: "textfield",
          name: "id",
          hidden: true
        } /*,
        {
          fieldLabel: D.t("Status"),
          xtype: "combo",
          name: "status",
          margin: "5 0 0 30",
          store: {
            fields: ["status", "name"],
            data: [
              { status: 1, name: D.t("INITIATED") },
              { status: 2, name: D.t("PROCESSING") },
              { status: 3, name: D.t("TRANSFERRED") },
              { status: 4, name: D.t("REJECTED") },
              { status: 5, name: D.t("REFUND EXT") },
              { status: 6, name: D.t("REFUND") },
              { status: 7, name: D.t("CANCELED") }
            ]
          },
          listeners: {
            change: function(el) {
              me.fireEvent("changeStatus", me);
            }
          },
          valueField: "status",
          displayField: "name"
        }*/
      ]
    });

    return {
      title: D.t("Transfer data"),
      xtype: "panel",
      layout: "border",
      items: [this.DataPanel, this.buildTransactions()]
    };
  },

  buildTransactions() {
    return {
      xtype: "panel",
      region: "east",
      cls: "grayTitlePanel",
      width: "50%",
      layout: "fit",
      split: true,
      title: D.t("Transactions"),
      items: Ext.create("Crm.modules.transactions.view.UserTransactionsGrid", {
        filterbar: false,
        filterable: false,
        scope: this,
        observe: [{ property: "transfer_id", param: "id" }]
      })
    };
  },

  buildLogsPanel() {
    return {
      xtype: "panel",
      layout: "fit",
      title: D.t("Logs"),
      name: "logs_panel",
      items: Ext.create("Crm.modules.transfers.view.LogsGrid", {
        filterbar: false,
        filterable: false,
        scope: this,
        observe: [{ property: "transfer_id", param: "id" }]
      })
    };
  },

  buildDocuments() {
    return {
      title: D.t("Documents"),
      action: "documents",
      padding: 5,
      scrollable: true,
      tpl: `
        <tpl for="files">
          <div>
            <i class="x-fa fa-paperclip"></i>&nbsp;<a href="{data}">{name}</a> </br>
        </tpl>  
      `
    };
  },

  buildButtons() {
    return [
      {
        text: D.t("Accept"),
        iconCls: "x-fa fa-check",
        action: "accept",
        name: "accept"
      },
      "-",
      {
        text: D.t("Repeat"),
        iconCls: "x-fa fa-sync",
        action: "repeat",
        name: "repeat"
      },
      "-",
      {
        text: D.t("Cancel"),
        iconCls: "x-fa fa-ban",
        action: "reject"
      },
      "-",
      /*{
        text: D.t("Renonce"),
        iconCls: "x-fa fa-sync",
        action: "renonce"
      },"-",
      "-",
      {
        text: D.t("Refund"),
        iconCls: "x-fa fa-exchange-alt",
        action: "refund"
      },*/
      "->",
      {
        text: D.t("Download report"),
        iconCls: "x-fa fa-print",
        action: "downloadReport"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  },

  applyEventTpl(event) {
    this.tpl = this.templates[event] || this.templates.default;
    this.DataPanel.add({
      xtype: "panel",
      action: "datapanel",
      cls: "details-panel printcontent",
      listeners: {
        boxready: function() {
          Ext.select(
            ".x-autocontainer-innerCt"
          ).selectable(); /*To enable user selection of text*/
        }
      },
      tpl: this.tpl.build()
    });
  }
});
