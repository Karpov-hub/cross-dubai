Ext.define("Crm.modules.wallets.view.WalletsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Address book"),
  detailsInDialogWindow: true,

  filterable: true,
  filterbar: true,

  gridCfg: {
    viewConfig: {
      getRowClass: (record) => {
        if (!record.data.status) return "disabled";
      }
    }
  },

  buildColumns: function() {
    return [
      {
        text: D.t("Name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "name"
      },
      {
        text: D.t("Address"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "num"
      },
      {
        text: D.t("Active"),
        width: 120,
        sortable: true,
        filter: {
          xtype: "combo",
          valueField: "code",
          editable: false,
          displayField: "name",
          store: {
            fields: ["code", "name"],
            data: [
              { code: true, name: D.t("Yes") },
              { code: false, name: D.t("No") }
            ]
          }
        },
        dataIndex: "status",
        renderer(v) {
          return v ? "Yes" : "No";
        }
      },
      {
        text: D.t("Chain of wallets required"),
        width: 180,
        sortable: true,
        filter: {
          xtype: "combo",
          valueField: "code",
          displayField: "name",
          editable: false,
          store: {
            fields: ["code", "name"],
            data: [
              { code: true, name: D.t("Yes") },
              { code: false, name: D.t("No") }
            ]
          }
        },
        dataIndex: "send_via_chain_required",
        renderer(v) {
          return v ? "Yes" : "No";
        }
      }
    ];
  }
});
