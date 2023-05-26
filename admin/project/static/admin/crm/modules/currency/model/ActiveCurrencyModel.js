Ext.define("Crm.modules.currency.model.ActiveCurrencyModel", {
  extend: "Crm.modules.currency.model.CurrencyModel",

  /* scope:server */
  afterGetData(data, cb) {
    const out = data.filter((item) => item.ap_active);
    cb(out);
  }
});
