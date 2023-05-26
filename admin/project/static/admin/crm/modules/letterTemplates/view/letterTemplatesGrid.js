Ext.define("Crm.modules.letterTemplates.view.letterTemplatesGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Letter Templates"),
  iconCls: "x-fa fa-envelope",

  filterable: true,
  filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Code"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "code"
      },
      {
        text: D.t("Language"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "lang"
      },
      {
        text: D.t("Letter name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "letter_name"
      },
      {
        text: D.t("Subject"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "subject"
      },

      {
        text: D.t("Transporter"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "transporter"
      },
      {
        text: D.t("Realm"),
        flex: 1,
        sortable: true,
        filter: Ext.create("Crm.modules.realm.view.RealmCombo", {
          name: null,
          fieldLabel: null
        }),
        dataIndex: "realm",
        renderer: (v, m, r) => {
          return v ? v.name : "";
        }
      },
      {
        text: D.t("Type"),
        flex: 1,
        dataIndex: "type",
        sortable: true,
        filter: {
          xtype: "combo",
          valueField: "key",
          displayField: "val",
          store: {
            fields: ["key", "val"],
            data: [
              { key: 0, val: D.t("System") },
              { key: 1, val: D.t("User") },
              { key: 2, val: D.t("Mandatory") }
            ]
          }
        },
        renderer(v) {
          return D.t(["System", "User", "Mandatory"][v]);
        }
      }
    ];
  }
});
