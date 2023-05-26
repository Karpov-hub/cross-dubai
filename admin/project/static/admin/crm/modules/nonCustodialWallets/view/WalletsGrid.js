Ext.define("Crm.modules.nonCustodialWallets.view.WalletsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Off-system addresses"),
  detailsInDialogWindow: true,

  filterable: true,
  filterbar: true,

  controllerCls: "Crm.modules.nonCustodialWallets.view.WalletsGridController",

  buildColumns: function() {
    return [
      {
        text: D.t("Wallet"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "address",
        renderer(v, m, r) {
          if (Ext.platformTags.phone)
            return `${v.substring(0, 3)}...${v.substring(v.length - 3,v.length)} ${
              r.data.currency
            }`;
          return v;
        }
      },
      {
        text: D.t("Currency"),
        flex: 1,
        sortable: true,
        hidden: Ext.platformTags.phone,
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          valueField: "abbr",
          displayField: "abbr",
          store: {
            fields: ["abbr"],
            data: [{ abbr: "ETH" }, { abbr: "TRX" }]
          }
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
      },
      {
        text: D.t("Memo"),
        flex: 1,
        sortable: true,
        filter: true,
        hidden: Ext.platformTags.phone,
        dataIndex: "memo"
      },
      {
        xtype: "datecolumn",
        text: D.t("Last PK share date"),
        flex: 1,
        sortable: true,
        filter: true,
        format: "d.m.Y H:i:s",
        hidden: Ext.platformTags.phone,
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "last_pk_share_date"
      }
    ];
  },

  buildTbar() {
    let items = this.callParent(arguments);
    items.splice(
      2,
      0,
      {
        text: D.t("Learn more"),
        iconCls: "x-fa fa-search",
        action: "learn_more"
      },
      "-"
    );

    return items;
  },

  buildButtonsColumns: function() {
    let me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 30,
        items: [
          {
            iconCls: "x-fa fa-share",
            name: "share-private-key",
            tooltip: D.t("Share PK"),
            handler: function(grid, rowIndex) {
              me.fireEvent("sharePrivateKey", grid, rowIndex);
            }
          }
        ]
      }
    ];
  }
});
