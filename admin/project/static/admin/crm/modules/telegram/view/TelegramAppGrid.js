Ext.define("Crm.modules.telegram.view.TelegramAppGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Telegram apps"),
  detailsInDialogWindow: true,

  filterable: true,
  filterbar: true,

  controllerCls: "Crm.modules.telegram.view.TelegramAppGridController",

  buildColumns: function() {
    return [
      {
        dataIndex: "id",
        hidden: true
      },
      {
        dataIndex: "session",
        hidden: true
      },
      {
        text: D.t("Phone number"),
        dataIndex: "phone",
        flex: 1,
        sortable: true,
        filter: true
      },
      {
        text: D.t("App ID"),
        dataIndex: "app_id",
        flex: 1,
        sortable: true,
        filter: true
      },
      {
        text: D.t("Status"),
        width: 150,
        sortable: true,
        dataIndex: "active",
        renderer: (v) => {
          return v ? "Active" : "Inactive";
        },
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          editable: false,
          store: [
            [true, "Active"],
            [false, "Inactive"]
          ],
          operator: "eq"
        }
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

  buildButtonsColumns() {
    return [
      {
        xtype: "actioncolumn",
        width: 34,
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-search",
            tooltip: D.t("View"),
            isDisabled: () => {
              return !this.permis.modify && !this.permis.read;
            },
            handler: (grid, rowIndex) => {
              this.fireEvent("edit", grid, rowIndex);
            }
          }
          // {
          //   iconCls: "x-fa fa-sign-in",
          //   name: "share-private-key",
          //   tooltip: D.t("Login"),
          //   handler: (grid, rowIndex) => {
          //     this.fireEvent("loginTelegram", grid, rowIndex);
          //   },
          //   isDisabled: (g, index) => {
          //     return !!g.store.getAt(index).data.session;
          //   }
          // }
        ]
      }
    ];
  }
});
