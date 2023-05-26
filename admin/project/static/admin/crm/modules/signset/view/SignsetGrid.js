Ext.define("Crm.modules.signset.view.SignsetGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Workflow"),
  iconCls: "x-fa fa-briefcase",

  requires: ["Core.grid.ComboColumn"],

  filterable: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Module"),
        flex: 1,
        sortable: true,
        dataIndex: "module"
      },
      {
        xtype: "combocolumn",
        text: D.t("Realm"),
        flex: 1,
        sortable: true,
        dataIndex: "realm",
        model: "Crm.modules.realm.model.RealmModel",
        guideKeyField: "id",
        guideValueField: "name"
      },
      {
        text: D.t("Active"),
        width: 70,
        sortable: true,
        dataIndex: "active"
      }
    ];
  }
});
