Ext.define("Crm.modules.depositImports.view.depositImportsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Deposit Imports"),
  iconCls: "x-fa fa-list",

  filterable: true,
  filterbar: true,

  controllerCls: "Crm.modules.depositImports.view.depositImportsGridController",

  gridCfg: {
    selType: "checkboxmodel"
  },

  buildColumns: function() {
    return [
      {
        hidden: true,
        dataIndex: "deposit_date"
      },
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
        text: D.t("File"),
        width: 200,
        sortable: true,
        filter: true,
        dataIndex: "file_name"
      },
      {
        text: D.t("Bank"),
        flex: 1,
        sortable: true,
        dataIndex: "bank",
        filter: this.buildBanksCombo()
      },
      {
        text: D.t("Status"),
        flex: 1,
        sortable: true,
        filter: {
          xtype: "combo",
          valueField: "key",
          displayField: "val",
          store: {
            fields: ["key", "val"],
            data: [
              { key: 0, val: D.t("Unresolved") },
              { key: 1, val: D.t("Resolved") }
            ]
          }
        },
        dataIndex: "status",
        renderer: (v, m, r) => {
          return D.t({ 0: "Unresolved", 1: "Resolved" }[v]);
        }
      },
      {
        text: D.t("Reason"),
        width: 200,
        sortable: true,
        dataIndex: "reason",
        filter: this.buildReasonFilter()
      },
      {
        text: D.t("Amount"),
        width: 200,
        sortable: true,
        filter: true,
        dataIndex: "amount"
      },
      {
        text: D.t("Currency"),
        width: 150,
        sortable: true,
        dataIndex: "currency",
        filter: this.buildCurrencyCombo()
      },
      {
        text: D.t("Merchant"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "deposit_to",
        filter: this.buildMerchantCombo()
      },
      {
        text: D.t("Order"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "order_name"
      },
      {
        text: D.t("Transfer type"),
        flex: 1,
        sortable: true,
        filter: {
          xtype: "combo",
          valueField: "key",
          displayField: "val",
          store: {
            fields: ["key", "val"],
            data: [
              { key: 0, val: D.t("Outgoing") },
              { key: 1, val: D.t("Incoming") }
            ]
          }
        },
        dataIndex: "type",
        renderer: (v, m, r) => {
          return D.t({ 0: "Outgoing", 1: "Incoming" }[v]);
        }
      },
      {
        text: D.t("Receiver"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "outtx_name"
      }
    ];
  },

  buildBanksCombo() {
    return {
      xtype: "combo",
      valueField: "bank_name",
      displayField: "bank_name",
      name: "bank",
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.banks.model.DirectoryBanksModel"),
        fieldSet: "bank_name",
        scope: this,
        sorters: [{ property: "bank_name", direction: "asc" }]
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

  buildReasonFilter() {
    return {
      name: "reason_filter",
      xtype: "combo",
      editable: false,
      queryMode: "local",
      displayField: "reason",
      valueField: "reason",
      store: Ext.create("Ext.data.ArrayStore", {
        fields: ["reason"],
        data: [["Deposit error"], ["Exists"], ["No order"]].sort()
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

  buildTbar() {
    let items = this.callParent();
    let transferMenu = [
      {
        text: D.t("Load deposits from file"),
        iconCls: "x-fa fa-download",
        action: "deposits-load"
      },
      "-",
      {
        iconCls: "x-fa fa-download",
        text: D.t("Download report"),
        action: "download-report"
      },
      "-",
      {
        iconCls: "x-fa fa-check",
        text: D.t("Provide selected"),
        action: "provide-selected"
      },
      "-",
      {
        iconCls: "x-fa fa-trash-alt",
        text: D.t("Delete selected"),
        action: "delete-selected"
      },
      "-",
      {
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-sync",
        action: "refresh"
      }
    ];

    return transferMenu;
  }
});
