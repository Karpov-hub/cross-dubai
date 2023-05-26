Ext.define("Crm.modules.merchants.view.ViewMerchantsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Merchants"),
  iconCls: "x-fa fa-users",

  detailsInDialogWindow: true,

  filterable: true,
  filterbar: true,

  controllerCls: "Crm.modules.merchants.view.ViewMerchantsGridController",

  buildColumns: function() {
    return [
      {
        text: D.t("Merchant"),
        flex: 2,
        sortable: true,
        dataIndex: "name",
        filter: this.buildMerchantCombo()
      },
      {
        text: D.t("Client"),
        flex: 2,
        sortable: true,
        dataIndex: "legalname",
        filter: this.buildGroupCombo()
      },
      {
        text: D.t("Bank"),
        flex: 2,
        sortable: true,
        dataIndex: "bank",
        filter: this.buildBanksCombo()
      },
      {
        text: D.t("Account Number"),
        flex: 2,
        sortable: true,
        dataIndex: "contract_acc_no",
        filter: this.buildAccountsCombo()
      },
      {
        text: D.t("Balance (USD)"),
        flex: 2,
        sortable: true,
        dataIndex: "busd",
        filter: {
          xtype: "numberfield"
        },
        renderer: function(v) {
          return v ? parseFloat(v).toFixed(2) : 0;
        }
      },
      {
        text: D.t("Balance (EUR)"),
        flex: 2,
        sortable: true,
        dataIndex: "beur",
        filter: {
          xtype: "numberfield"
        },
        renderer: function(v) {
          return v ? parseFloat(v).toFixed(2) : 0;
        }
      },
      {
        xtype: "datecolumn",
        format: "d.m.Y H:i:s",
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        text: D.t("Last Deposit"),
        flex: 2,
        sortable: true,
        dataIndex: "last_deposit"
      }
    ];
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

  buildGroupCombo() {
    return {
      xtype: "combo",
      valueField: "legalname",
      displayField: "legalname",
      name: "merchant_combo",
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.accountHolders.model.UsersModel"),
        fieldSet: "id,legalname",
        scope: this,
        sorters: [{ property: "legalname", direction: "asc" }]
      })
    };
  },

  buildAccountsCombo() {
    return {
      xtype: "combo",
      valueField: "account_number",
      displayField: "account_number",
      name: "accounts",
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create(
          "Crm.modules.accountsContracts.model.AccountsContractsModel"
        ),
        fieldSet: "account_number",
        scope: this,
        sorters: [{ property: "account_number", direction: "asc" }]
      })
    };
  },

  buildBanksCombo() {
    return {
      xtype: "combo",
      valueField: "bank",
      displayField: "bank",
      name: "banks",
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create(
          "Crm.modules.accountsContracts.model.AccountsContractsModel"
        ),
        fieldSet: "bank",
        scope: this,
        sorters: [{ property: "bank", direction: "asc" }]
      })
    };
  },
  buildTbar: function() {
    var items = [
      {
        text: this.buttonAddText,
        tooltip: this.buttonAddTooltip,
        iconCls: "x-fa fa-plus",
        scale: "medium",
        action: "add"
      }
    ];

    if (this.importButton) {
      items.push("-", {
        text: this.buttonImportText,
        iconCls: "x-fa fa-cloud-download",
        action: "import"
      });
    }
    if (this.exportButton) {
      items.push("-", {
        text: this.buttonExportText,
        iconCls: "x-fa fa-cloud-upload",
        action: "export"
      });
    }

    items.push("-", {
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-sync",
      action: "refresh"
    });

    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  },

  buildButtonsColumns: function() {
    var me = this;
    return [];
  }
});
