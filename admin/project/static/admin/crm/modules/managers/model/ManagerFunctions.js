Ext.define("Crm.modules.managers.model.ManagerFunctions", {

  /* scope:server */
  $getAdminProfile(data, cb) {
    return cb(this.user.profile);
  }
});
