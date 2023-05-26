Ext.define("Crm.modules.tariffs.model.VariablesModel", {
  extend: "Crm.classes.DataModel",

  collection: "triggers",
  idField: "key",
  removeAction: "remove",
  mixins: ["Crm.modules.accounts.model.AccountsFunc"],

  fields: [
    {
      name: "key",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "value",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "descript",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "type",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "values",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  async getData(data, cb) {
    let variables = [];

    if (
      data.filters &&
      data.filters[0] &&
      data.filters[0].property == "tariff_plan"
    ) {
      const plan = await this.src.db.collection("tariffplans").findOne(
        {
          id: data.filters[0].value
        },
        { variables: 1 }
      );
      if (plan) {
        variables = plan.variables;
      }
    } else {
      const tariffs = await this.src.db
        .collection("tariffs")
        .findAll({}, { variables: 1 });

      tariffs.forEach((item) => {
        variables = variables.concat(item.variables);
      });
    }
    variables.sort((a, b) => (a.descript > b.descript ? 1 : -1));
    cb({
      total: variables.length,
      list: variables
    });
  }
});
