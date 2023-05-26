Ext.define("Crm.modules.accountHolders.model.ActiveUsersModel", {
  extend: "Crm.modules.accountHolders.model.UsersModel",

  getData(params, cb) {
    let filter_obj = { property: "activated", value: true };
    if (!params._filters && !params.filters) params._filters = [filter_obj];
    else if (params._filters) params._filters.push(filter_obj);
    this.callParent(arguments);
  }
});
