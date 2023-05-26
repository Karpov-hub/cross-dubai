Ext.define("Crm.modules.currency.view.CurrencyGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Currency"),
  iconCls: "x-fa fa-dollar-sign",

  filterable: true,
  filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Abbreviation"),
        flex: 1,
        sortable: true,
        dataIndex: "abbr",
        filter: true
      },
      {
        text: D.t("Currency name"),
        flex: 1,
        sortable: true,
        dataIndex: "name",
        filter: true
      },
      {
        text: D.t("Crypto"),
        flex: 1,
        sortable: true,
        dataIndex: "crypto",
        filter: {
          xtype: "combo",
          valueField: "code",
          displayField: "name",
          store: {
            fields: ["code", "name"],
            data: [
              { code: true, name: D.t("Yes") },
              { code: false, name: D.t("No") }
            ]
          }
        },
        renderer(v) {
          return v ? "Yes" : "No";
        }
      },
      {
        text: D.t("AP Active"),
        flex: 1,
        sortable: true,
        dataIndex: "ap_active",
        filter: {
          xtype: "combo",
          valueField: "code",
          displayField: "name",
          store: {
            fields: ["code", "name"],
            data: [
              { code: true, name: D.t("Yes") },
              { code: false, name: D.t("No") }
            ]
          }
        },
        renderer(v) {
          return v ? "Yes" : "No";
        }
      },
      {
        text: D.t("UI Active"),
        flex: 1,
        sortable: true,
        dataIndex: "ui_active",
        filter: {
          xtype: "combo",
          valueField: "code",
          displayField: "name",
          store: {
            fields: ["code", "name"],
            data: [
              { code: true, name: D.t("Yes") },
              { code: false, name: D.t("No") }
            ]
          }
        },
        renderer(v) {
          return v ? "Yes" : "No";
        }
      }
    ];
  }
});
