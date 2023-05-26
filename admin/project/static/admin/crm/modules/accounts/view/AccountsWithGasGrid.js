Ext.define("Crm.modules.accounts.view.AccountsWithGasGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Accounts & Addresses"),
  iconCls: "x-fa fa-credit-card",

  filterable: true,
  filterbar: true,

  detailsInDialogWindow: true,

  controllerCls: "Crm.modules.accounts.view.AccountsWithGasGridController",

  buildTbar() {
    return [
      {
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-sync",
        action: "refresh"
      }
    ];
  },

  buildColumns() {
    const renderer = (v, m, r) => {
      m.tdCls = `account-status-${r.data.status}`;
      return v;
    };
    const currencies_store = Ext.create("Core.data.ComboStore", {
      dataModel: "Crm.modules.currency.model.CurrencyModel",
      fieldSet: "abbr",
      scope: this
    });
    return [
      {
        text: D.t("Client"),
        flex: 1,
        sortable: true,
        filter: this.buildGroupCombo(),
        dataIndex: "owner_name"
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
        text: D.t("Account/Crypto address"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "address",
        listeners: {
          render: function(c) {
            new Ext.ToolTip({
              target: c.getEl(),
              html: "Search crypto address"
            });
          }
        },
        renderer(v, m, r) {
          renderer(v, m, r);
          return v ? v : r.data.acc_no;
        }
      },
      {
        text: D.t("Balance"),
        align: "right",
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "crypto_balance",
        renderer(v, m, r) {
          renderer(v, m, r);
          return r.data.address ? r.data.crypto_balance : r.data.balance;
        }
      },
      {
        text: D.t("Currency"),
        width: 80,
        sortable: true,
        filter: {
          xtype: "combo",
          displayField: "abbr",
          valueField: "abbr",
          store: currencies_store
        },
        dataIndex: "currency",
        renderer
      },
      {
        text: D.t("Gas balance"),
        align: "right",
        flex: 1,
        sortable: true,
        dataIndex: "gas_balance",
        renderer
      },
      {
        text: D.t("Gas currency"),
        sortable: true,
        filter: {
          xtype: "combo",
          displayField: "abbr",
          valueField: "abbr",
          store: {
            fields: ["abbr"],
            data: [{ abbr: "ETH" }, { abbr: "TRX" }]
          }
        },
        dataIndex: "gas_currency",
        width: 80,
        renderer
      },
      {
        text: D.t("Status"),
        sortable: true,
        dataIndex: "status",
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
        width: 80,
        renderer(v, m, r) {
          renderer(v, m, r);
          return D.t(["New", "Activated", "Blocked", "Closed"][v]);
        }
      },
      {
        text: D.t("Type"),
        sortable: true,
        dataIndex: "wallet_type",
        filter: {
          xtype: "combo",
          valueField: "key",
          displayField: "val",
          store: {
            fields: ["key", "val"],
            data: [
              { key: 0, val: D.t("User") },
              { key: 1, val: D.t("Monitor") }
            ]
          }
        },
        width: 80,
        renderer(v, m, r) {
          renderer(v, m, r);
          if (!v && typeof v != "number") return D.t("Unassigned");
          return D.t(["User", "Monitor"][v]);
        }
      }
    ];
  },

  buildButtonsColumns() {
    return [
      {
        xtype: "actioncolumn",
        width: 90,
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-sync",
            stopSelection: true,
            tooltip: D.t("Get wallet balance"),
            isDisabled: function(grid, rowIdx, colIdx, item, record) {
              return !!!record.data.address;
            },
            handler: (grid, rowIdx, colIdx, item, e, record) => {
              this.fireEvent("getWalletbalance", grid, rowIdx, record);
            }
          },
          {
            iconCls: "x-fa fa-edit",
            tooltip: D.t("Show details"),
            isDisabled: (grid, rowIdx, colIdx, item, record) => {
              return !!!record.data.address;
            },
            handler: (grid, rowIndex) => {
              this.fireEvent("edit", grid, rowIndex);
            }
          },
          {
            iconCls: "x-fa fa-share",
            name: "share-private-key",
            tooltip: D.t("Share PK"),
            isDisabled: function(grid, rowIdx, colIdx, item, record) {
              return !!!record.data.address;
            },
            handler: (grid, rowIndex) => {
              this.fireEvent("sharePrivateKey", grid, rowIndex);
            }
          }
        ]
      }
    ];
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
  }
});
