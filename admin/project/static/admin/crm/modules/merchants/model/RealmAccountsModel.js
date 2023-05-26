Ext.define("Crm.modules.merchants.model.RealmAccountsModel", {
  extend: "Crm.modules.accounts.model.RealmAccountsModel",

  afterGetData(data, cb) {
    data = data.filter((item) => {
      return item.type == 1;
    });
    cb(data)
  },
});
