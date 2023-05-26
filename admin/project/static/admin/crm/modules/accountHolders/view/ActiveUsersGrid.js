Ext.define("Crm.modules.accountHolders.view.ActiveUsersGrid", {
  extend: "Crm.modules.accountHolders.view.UsersGrid",

  title: D.t("Clients"),

  buildColumns() {
    let columns = this.callParent(arguments);
    if (!Ext.platformTags.phone) columns.splice(5, 1);
    return columns;
  }
});
