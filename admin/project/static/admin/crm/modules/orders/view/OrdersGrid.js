Ext.define("Crm.modules.orders.view.OrdersGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Orders"),
  controllerCls: "Crm.modules.orders.view.OrdersGridController",
  filterable: true,
  filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Client"),
        flex: 1,
        sortable: true,
        filter: this.buildClientCombo(),
        dataIndex: "merchant_name"
      },
      {
        text: D.t("Merchant"),
        flex: 1,
        sortable: true,
        filter: this.buildMerchantCombo(),
        dataIndex: "organisation_name"
      },
      {
        text: D.t("Order number"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "order_num"
      },
      {
        text: D.t("Amount"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "amount",
        hidden: true
      },
      {
        text: D.t("Currency"),
        flex: 1,
        sortable: true,
        filter: this.buildCurrencyCombo(),
        dataIndex: "currency",
        hidden: true
      },
      {
        text: D.t("Result currency"),
        flex: 1,
        sortable: true,
        filter: this.buildCurrencyCombo(),
        dataIndex: "res_currency",
        hidden: true
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
              { key: 1, val: D.t("Ongoing") },
              { key: 2, val: D.t("Completed") },
              { key: 3, val: D.t("Suspended") }
            ]
          }
        },
        dataIndex: "status",
        renderer: function(v, m, r) {
          return D.t(
            {
              1: "Ongoing",
              2: "Completed",
              3: "Suspended"
            }[v]
          );
        }
      },
      {
        xtype: "datecolumn",
        text: D.t("Creation time"),
        flex: 1,
        sortable: true,
        filter: true,
        format: "d.m.Y H:i:s",
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "ctime"
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

  buildClientCombo() {
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
  },

  buildRealmdepCombo() {
    return {
      xtype: "combo",
      valueField: "name",
      displayField: "name",
      name: "realmdep_combo",
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create(
          "Crm.modules.merchants.model.RealmDepartmentModel"
        ),
        fieldSet: "id,name",
        scope: this,
        sorters: [{ property: "name", direction: "asc" }]
      })
    };
  },

  buildButtonsColumns() {
    return [
      {
        xtype: "actioncolumn",
        width: 34,
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-search",
            tooltip: D.t("Open order"),
            isDisabled: () => {
              return !this.permis.modify && !this.permis.read;
            },
            handler: (grid, rowIndex) => {
              this.fireEvent("edit", grid, rowIndex);
            }
          }
        ]
      }
    ];
  }
});
