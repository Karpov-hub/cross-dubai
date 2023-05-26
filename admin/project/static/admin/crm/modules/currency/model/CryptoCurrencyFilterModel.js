Ext.define("Crm.modules.currency.model.CryptoCurrencyFilterModel", {
  extend: "Crm.modules.currency.model.CurrencyModel",

  /* scope:server */
  afterGetData(data, cb) {
    const out = data.filter((item) => item.crypto);
    cb(out);
  }
});
