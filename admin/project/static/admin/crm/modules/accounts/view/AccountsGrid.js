Ext.define("Crm.modules.accounts.view.AccountsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Accounts"),
  iconCls: "x-fa fa-credit-card",

  filterable: true,
  filterbar: true,

  controllerCls: "Crm.modules.accounts.view.AccountsGridController",

  buildColumns: function() {
    return [
      {
        text: D.t("Account"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "acc_no"
      },
      {
        text: D.t("Account name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "acc_name"
      },
      {
        text: D.t("Balance"),
        flex: 1,
        sortable: true,
        filter: {
          xtype: "numberfield"
        },
        dataIndex: "balance"
      },
      {
        text: D.t("Overdraft"),
        width: 80,
        sortable: true,
        filter: {
          xtype: "numberfield"
        },
        dataIndex: "overdraft"
      },
      {
        text: D.t("Currency"),
        width: 100,
        sortable: true,
        filter: this.buildCurrencyCombo(),
        dataIndex: "currency"
      },
      {
        text: D.t("Client"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "legalname",
        filter: this.buildGroupCombo()
      },
      {
        text: D.t("Merchant"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "merchant_name",
        filter: this.buildMerchantCombo()
      },
      {
        text: D.t("Status"),
        width: 110,
        sortable: true,
        filter: {
          xtype: "combo",
          valueField: "key",
          displayField: "val",
          store: {
            fields: ["key", "val"],
            data: [
              { key: 0, val: D.t("New") },
              { key: 1, val: D.t("Activated") },
              { key: 2, val: D.t("Blocked") },
              { key: 3, val: D.t("Closed") }
            ]
          }
        },
        dataIndex: "status",
        renderer: (v, m, r) => {
          return D.t(
            { 0: "New", 1: "Activated", 2: "Blocked", 3: "Closed" }[v]
          );
        }
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

  buildTbar() {
    let items = this.callParent(arguments);
    items.splice(
      0,
      2,
      {
        iconCls: "x-fa fa-download",
        text: D.t("Export transactions"),
        action: "accountsExportTransactions"
      },
      "-"
    );
    return items;
  }
});
