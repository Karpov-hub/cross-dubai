Ext.define("Crm.modules.tariffs.model.PlansValuesModel", {
  extend: "Crm.modules.tariffs.model.PlansModel",

  /* scope:server */
  async getData(data, cb) {
    let plans = await this.dbCollection.findAll(
      {
        removed: { $ne: 1 }
      },
      { id: 1, tariffs: 1, name: 1 }
    );

    let ids = [];
    plans.forEach((item) => {
      ids = ids.concat(item.tariffs);
    });
    ids = ids.filter((id) => !!id);
    if (ids.length) {
      const tariffs = await this.src.db.collection("tariffs").findAll(
        {
          id: { $in: ids }
        },
        { id: 1, variables: 1 }
      );
      plans = plans.map((item) => {
        item.variables = [];
        tariffs.forEach((tariff) => {
          if (
            item.tariffs.includes(tariff.id) &&
            tariff.variables &&
            tariff.variables.length
          ) {
            tariff.variables.forEach((variable) => {
              for (let vrb of item.variables) {
                if (vrb.key == variable.key) return;
              }
              item.variables.push(variable);
            });
          }
        });
        return item;
      });
    }
    cb({ total: plans.length, list: plans });
  }
});
