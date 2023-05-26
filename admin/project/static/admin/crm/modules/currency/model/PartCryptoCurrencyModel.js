Ext.define("Crm.modules.currency.model.PartCryptoCurrencyModel", {
  extend: "Crm.modules.currency.model.CurrencyModel",

  /* scope:server */
  afterGetData(data, cb) {
    const out = data.filter(
      (item) =>
        item.crypto && ["ETH", "TRX"].includes(item.abbr) && item.ap_active
    );
    cb(out);
  }
});
