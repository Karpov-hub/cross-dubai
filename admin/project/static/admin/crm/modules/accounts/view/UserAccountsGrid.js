Ext.define("Crm.modules.accounts.view.UserAccountsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Accounts"),
  iconCls: "x-fa fa-credit-card",

  model: "Crm.modules.accounts.model.ClientAccsFiltersModel",
  detailsInDialogWindow: true,
  controllerCls: "Crm.modules.accounts.view.UserAccountsGridController",
  filterable: true,
  filterbar: true,

  fields: [
    "id",
    "acc_no",
    "overdraft",
    "balance",
    "currency",
    "status",
    "ctime",
    "owner",
    "merchant_name",
    "crypto_address"
  ],

  buildColumns() {
    const renderer = (v, m, r) => {
      m.tdCls = `account-status-${r.data.status}`;
      return v;
    };

    return [
      {
        text: D.t("Account"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "acc_no",
        renderer
      },
      {
        text: D.t("Crypto Address"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "crypto_address",
        renderer
      },
      {
        text: D.t("Merchant"),
        flex: 1,
        sortable: true,
        filter: this.buildMerchantCombo(),
        dataIndex: "merchant_name",
        renderer
      },
      {
        text: D.t("Balance"),
        width: 140,
        sortable: true,
        filter: true,
        dataIndex: "balance",
        renderer
      },
      {
        text: D.t("Overdraft"),
        width: 80,
        sortable: true,
        filter: true,
        dataIndex: "overdraft",
        renderer
      },
      {
        text: D.t("Currency"),
        width: 80,
        sortable: true,
        filter: this.buildCurrencyCombo(),
        dataIndex: "currency",
        renderer
      },
      {
        text: D.t("Date"),
        width: 140,
        sortable: true,
        dataIndex: "ctime",
        format: "d.m.Y H:i",
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        renderer: (v, m, r) => {
          renderer(v, m, r);
          return Ext.Date.format(new Date(v), "d.m.Y H:i:s");
        }
      },
      {
        text: D.t("Status"),
        width: 80,
        sortable: true,
        filter: {
          xtype: "combo",
          valueField: "key",
          displayField: "val",
          store: {
            fields: ["key", "val"],
            data: [
              { key: 1, val: D.t("Activated") },
              { key: 2, val: D.t("Blocked") },
              { key: 3, val: D.t("Closed") }
            ]
          }
        },
        dataIndex: "status",
        renderer: (v, m, r) => {
          renderer(v, m, r);
          return D.t(["New", "Activated", "Blocked", "Closed"][v]);
        }
      }
    ];
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
    return [
      {
        text: this.buttonAddText,
        tooltip: this.buttonAddTooltip,
        iconCls: "x-fa fa-plus",
        scale: "medium",
        action: "add"
      },
      "-",
      {
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-sync",
        action: "refresh"
      },
      "->",
      {
        tooltip: D.t("Debt report"),
        iconCls: "x-fa fa-download",
        action: "debt_report"
      },
      "-",
      {
        xtype: "label",
        text: D.t("DEBT:")
      },
      {
        xtype: "label",
        action: "total_balance",
        text: "0"
      },
      Ext.create("Crm.modules.currency.view.CurrencyCombo", {
        fieldLabel: null,
        action: "balance_currency",
        width: 80,
        value: "EUR",
        displayField: "abbr"
      })
    ];
  }
});
