Ext.define("Crm.modules.realm.view.RealmGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Realms"),
  iconCls: "x-fa fa-users",

  buildColumns: function() {
    return [
      {
        text: D.t("Parent"),
        flex: 1,
        sortable: true,
        filter: Ext.create("Crm.modules.realm.view.RealmCombo", {
          name: null,
          fieldLabel: null
        }),
        dataIndex: "pid",
        renderer: (v, m, r) => {
          return v ? v.name : "-";
        }
      },
      {
        text: D.t("name"),
        flex: 1,
        sortable: true,
        dataIndex: "name"
      },
      {
        text: D.t("IP adderss"),
        flex: 1,
        sortable: true,
        dataIndex: "ip"
      },
      {
        text: D.t("Domain"),
        flex: 1,
        sortable: true,
        dataIndex: "domain"
      },
      {
        text: D.t("Token"),
        flex: 1,
        sortable: true,
        dataIndex: "token"
      }
    ];
  }
});
