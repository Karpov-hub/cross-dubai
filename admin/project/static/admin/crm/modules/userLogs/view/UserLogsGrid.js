Ext.define("Crm.modules.userLogs.view.UserLogsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("User actions logs"),
  iconCls: "x-fa fa-list",

  filterable: true,
  filterbar: true,

  detailsInDialogWindow: true,

  buildColumns: function() {
    const actions = [
      {
        value: "write",
        label: "Save"
      },
      {
        value: "deposit",
        label: "Deposit"
      },
      {
        value: "withdrawalCustomExchangeRate",
        label: "Withdrawal"
      },
      {
        value: "createOrder",
        label: "Create/save order"
      },
      {
        value: "addContract",
        label: "Create/save contract"
      },
      {
        value: "accept",
        label: "Accept transfer"
      }
    ];
    return [
      {
        text: D.t("Admin"),
        flex: 1,
        sortable: true,
        filter: this.buildAdminCombo(),
        dataIndex: "admin_name",
        renderer: function(v, m, r) {
          return v ? v : "Not Found";
        }
      },
      {
        text: D.t("Client"),
        flex: 1,
        sortable: true,
        filter: this.buildClientCombo(),
        dataIndex: "username"
      },
      {
        text: D.t("Merchant"),
        flex: 1,
        sortable: true,
        filter: this.buildMerchantCombo(),
        dataIndex: "merchant"
      },
      {
        text: D.t("Action"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "method",
        filter: {
          xtype: "combo",
          valueField: "value",
          displayField: "label",
          store: {
            fields: ["value", "label"],
            data: actions
          }
        },
        renderer: function(v, m, r) {
          if (v) {
            let i = 0;
            for (const item of actions) {
              if (v === item.value) return item.label;
            }
          }
        }
      },
      {
        text: D.t("Creation date"),
        flex: 1,
        sortable: true,
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "date",
        renderer: (v) => {
          return Ext.Date.format(new Date(v), "d.m.Y H:i:s");
        }
      }
    ];
  },

  buildTbar: function() {
    var items = [];
    items.push({
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-sync",
      action: "refresh"
    });

    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  },

  buildButtonsColumns: function() {
    var me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 34,
        items: [
          {
            iconCls: "x-fa fa-edit",
            tooltip: D.t("View log"),
            handler: function(grid, rowIndex) {
              me.fireEvent("edit", grid, rowIndex);
            }
          }
        ]
      }
    ];
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
  buildAdminCombo() {
    return {
      xtype: "combo",
      valueField: "login",
      displayField: "login",
      name: "admin_combo",
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.users.model.UsersModel"),
        fieldSet: "_id,login",
        scope: this,
        sorters: [{ property: "login", direction: "asc" }]
      })
    };
  }
});
