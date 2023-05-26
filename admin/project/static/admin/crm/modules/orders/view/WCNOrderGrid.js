Ext.define("Crm.modules.orders.view.WCNOrderGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Currency exchange orders"),

  controllerCls: "Crm.modules.orders.view.WCNOrderGridController",

  filterable: true,
  filterbar: true,

  buildColumns() {
    const orderTypes = [
      {
        code: "StartFinal",
        name: D.t("Start/Final")
      },
      {
        code: "CardsWithWithdrawalFiat",
        name: D.t("Cards with withdrawal fiat")
      },
      {
        code: "CardsWithWithdrawal",
        name: D.t("Cards with withdrawal")
      },
      {
        code: "CryptoFiatWithRate",
        name: D.t("Crypto-fiat with tariff delta")
      },
      {
        code: "CryptoFiatWithExchangeRateDelta",
        name: D.t("Crypto-fiat with exchange rate delta")
      },
      {
        code: "FiatCryptoWithTariffDelta",
        name: D.t("Fiat-crypto with tariff delta")
      },
      {
        code: "FiatCryptoWithExchangeRateDelta",
        name: D.t("Fiat-crypto with exchange rate delta")
      }
    ];

    return [
      {
        width: 100,
        dataIndex: "short_id",
        text: D.t("ID"),
        filter: true,
        renderer(v) {
          return v || "-";
        }
      },
      {
        flex: 1,
        dataIndex: "organisation",
        text: D.t("Merchant"),
        filter: this.buildMerchantCombo(),
        renderer(v) {
          return v.name;
        }
      },
      {
        flex: 1,
        xtype: "datecolumn",
        dataIndex: "ctime",
        text: D.t("Order date"),
        format: "d.m.Y H:i:s",
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        }
      },
      {
        flex: 1,
        dataIndex: "order_type",
        text: D.t("Type"),
        renderer(v) {
          for (const type of orderTypes) {
            if (type.code == v) return type.name;
          }
          return "-";
        },
        filter: {
          xtype: "combo",
          valueField: "code",
          displayField: "name",
          store: {
            fields: ["code", "name"],
            data: orderTypes
          }
        }
      },
      {
        flex: 1,
        dataIndex: "status",
        text: D.t("Status"),
        renderer(v) {
          return ["Created", "In progress", "Provided"][v];
        },
        filter: {
          xtype: "combo",
          valueField: "code",
          displayField: "name",
          store: {
            fields: ["code", "name"],
            data: [
              { code: 0, name: "Created" },
              { code: 1, name: "In progress" },
              { code: 2, name: "Provided" }
            ]
          }
        }
      }
    ];
  },

  buildMerchantCombo() {
    return {
      xtype: "combo",
      valueField: "id",
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

  buildButtonsColumns() {
    let action_column = this.callParent(arguments);
    action_column[0].items[1].isDisabled = (
      view,
      rowIdx,
      colIdx,
      item,
      rec
    ) => {
      return !!rec.data.has_transfers;
    };
    return action_column;
  }
});
