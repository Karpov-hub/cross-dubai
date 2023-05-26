Ext.define("Crm.modules.accountsPlan.model.PlansAccVarModel", {
  extend: "Crm.modules.accountsPlan.model.PlansModel",

  async afterGetData(data, callback) {
    const accVariables = [];
    for (let item of data) {
      item.items.forEach((r) => {
        if (isNaN(r.acc_no)) {
          accVariables.push({ acc_no: r.acc_no });
        }
      });
    }

    const uniqAccounts = accVariables.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.acc_no === value.acc_no)
    );

    return callback(uniqAccounts);
  }
});
