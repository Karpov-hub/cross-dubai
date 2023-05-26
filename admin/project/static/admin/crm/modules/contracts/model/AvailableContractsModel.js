Ext.define("Crm.modules.contracts.model.AvailableContractsModel", {
  extend: "Crm.modules.contracts.model.ContractsModel",

  /* scope:server */
  afterGetData(data, cb) {
    data = data.filter((item) => {
      return item.status != 2;
    });
    cb(data);
  }
});
