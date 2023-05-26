Ext.define("Crm.modules.banks.model.RealmDepartmentIBANModel", {
  extend: "Crm.modules.banks.model.IBANModel",

  async afterGetData(data, callback) {
    if (!data || !data.length) return callback(data);
    const out = data.filter((item) => item.verified_on_nil);
    callback(out);
  }
});
