Ext.define("Crm.modules.accountsPlan.model.PlansDescriptModel", {
  extend: "Crm.modules.accountsPlan.model.PlansModel",

  async afterGetData(data, callback) {
    const allDescriptions = [];
    for (let item of data) {
      item.items.forEach((d) => allDescriptions.push({ descript: d.descript }));
    }

    const uniqDescriptions = allDescriptions.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.descript === value.descript)
    );

    return callback(uniqDescriptions);
  }
});
