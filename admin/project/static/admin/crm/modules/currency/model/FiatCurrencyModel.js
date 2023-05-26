Ext.define("Crm.modules.currency.model.FiatCurrencyModel", {
  extend: "Crm.modules.currency.model.CurrencyModel",

  /* scope:server */
  afterGetData(data, cb) {
    const out = data.filter((item) => !item.crypto && item.ap_active);
    cb(out);
  }
});
