Ext.define("Crm.modules.banks.model.ClientBanksModel", {
  extend: "Crm.modules.banks.model.BanksModel",

  /* scope:server */
  afterGetData(data, cb) {
    let out = [];
    for (const bank of data) {
      if (!bank.falcon_bank) out.push(bank);
    }
    cb(out);
  }
});
