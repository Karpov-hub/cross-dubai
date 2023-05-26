Ext.define("Crm.modules.allAddresses.view.AllAddressesGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("All addresses"),
  detailsInDialogWindow: true,

  filterable: true,
  filterbar: true,

  controllerCls: "Crm.modules.allAddresses.view.AllAddressesGridController",

  buildColumns: function() {
    const modules = [
      {
        code: "account_crypto",
        name: D.t("Accounts & Addresses")
      },
      {
        code: "crypto_wallets",
        name: D.t("Address book")
      },
      {
        code: "non_custodial_wallets",
        name: D.t("Off-system addresses")
      },
      {
        code: "wallet_chains",
        name: D.t("Chain of wallets")
      },
      {
        code: "wallet_chains_sr",
        name: D.t("Chain of wallets (Sender/Receiver)")
      }
    ];

    return [
      {
        width: 230,
        dataIndex: "source",
        text: D.t("Module"),
        renderer(v) {
          for (const module of modules) {
            if (module.code == v) return module.name;
          }
          return "-";
        },
        filter: {
          xtype: "combo",
          valueField: "code",
          displayField: "name",
          store: {
            fields: ["code", "name"],
            data: modules
          }
        }
      },
      {
        text: D.t("Address"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "address"
      },
      {
        text: D.t("Currency"),
        flex: 1,
        sortable: true,
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          valueField: "abbr",
          displayField: "abbr",
          store: Ext.create("Core.data.ComboStore", {
            dataModel: Ext.create(
              "Crm.modules.currency.model.CryptoCurrencyFilterModel"
            ),
            fieldSet: ["abbr"],
            scope: this
          })
        },
        dataIndex: "currency"
      },
      {
        text: D.t("Client"),
        flex: 1,
        sortable: true,
        dataIndex: "user_id",
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          valueField: "id",
          displayField: "legalname",
          store: Ext.create("Core.data.ComboStore", {
            dataModel: Ext.create(
              "Crm.modules.accountHolders.model.UsersModel"
            ),
            fieldSet: ["id", "legalname"],
            scope: this
          })
        },
        renderer: (v) => {
          v = v ? v.legalname : "-";
          return v;
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
            fieldSet: ["id", "name", "user_id"],
            scope: this
          })
        },
        renderer: (v) => {
          v = v ? v.name : "-";
          return v;
        }
      }
    ];
  },

  buildTbar: function() {
    this.items = [];

    this.items.push(
      {
        text: D.t("Check system address"),
        action: "check-address"
      },
      "-",
      {
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-sync",
        action: "refresh"
      }
    );

    return this.items;
  },

  buildButtonsColumns() {
    return;
  }
});
