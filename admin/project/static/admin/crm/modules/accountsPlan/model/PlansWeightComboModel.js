Ext.define("Crm.modules.accountsPlan.model.PlansWeightComboModel", {
  extend: "Crm.classes.DataModel",

  collection: "vw_plans_weights",
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "description",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "algo_amount",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "method_amount",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "items",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "variables",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "weight",
      type: "integer",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "merchant_id",
      type: "ObjectID",
      visible: true,
      editable: true,
      filterable: true
    },
    {
      name: "tags",
      type: "array",
      visible: true,
      editable: true,
      filterable: true
    }
  ],

  async afterGetData(data, callback) {
    const used_plans_ids = data.map((plan) => plan.id);

    const sql = used_plans_ids.length
      ? "SELECT * from accounts_plans where id not in ('" +
        used_plans_ids.join("','") +
        "') order by name asc;"
      : "SELECT * from accounts_plans order by name asc;";

    const currencies = await this.src.db
      .collection("currency")
      .findAll({ ap_active: false }, { abbr: 1 });
    const inactiveCurrencies = currencies.map((item) => item.abbr);

    const unused_plans = await this.src.db.query(sql);

    const allPlans = data.concat(unused_plans);

    const out = allPlans.filter((plan) => {
      const planCurrencies = plan.items.map((plan_item) => plan_item.currency);
      if (!planCurrencies.some((e) => inactiveCurrencies.includes(e))) {
        return plan;
      }
    });

    return callback(out);
  }
});
