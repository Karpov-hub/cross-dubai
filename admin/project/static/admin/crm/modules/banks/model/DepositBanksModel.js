Ext.define("Crm.modules.banks.model.DepositBanksModel", {
  extend: "Crm.modules.banks.model.BanksModel",

  /* scope:server */
  getData(params, cb) {
    if (
      params.falcon_bank != undefined &&
      typeof params.falcon_bank == "string"
    ) {
      params._filters = [
        {
          _property: "falcon_bank",
          _value: true
        }
      ];
    }

    this.callParent(arguments);
  }
});
