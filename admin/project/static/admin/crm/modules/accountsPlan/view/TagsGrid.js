Ext.define("Crm.modules.accountsPlan.view.TagsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Accounts plans tags"),
  iconCls: "x-fa fa-list-ul",

  detailsInDialogWindow: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Name"),
        flex: 1,
        sortable: true,
        dataIndex: "name"
      }
    ];
  }
});
