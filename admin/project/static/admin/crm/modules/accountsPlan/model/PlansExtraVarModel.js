Ext.define("Crm.modules.accountsPlan.model.PlansExtraVarModel", {
  extend: "Crm.modules.accountsPlan.model.PlansModel",

  async afterGetData(data, callback) {
    const extraVariables = [];
    for (let item of data) {
      item.items.forEach((r) => {
        if (isNaN(r.extra)) {
          extraVariables.push({ extra: r.extra });
        }
      });
    }

    const uniqExtra = extraVariables.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.extra === value.extra)
    );

    return callback(uniqExtra);
  }
});
