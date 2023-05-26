Ext.define("Crm.modules.tariffs.model.PlansModel", {
  extend: "Core.data.DataModel",

  collection: "tariffplans",
  idField: "id",
  //removeAction: "remove",

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
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "tariffs",
      type: "arraystring",
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
    }
  ],

  /* scope:client */
  getVariablesFromTariffs(tariffs, cb) {
    this.runOnServer("getVariablesFromTariffs", { tariffs }, res => {
      cb(res.variables);
    });
  },

  /* scope:server */
  async $getVariablesFromTariffs(data, cb) {
    const tariffs = await this.src.db
      .collection("tariffs")
      .findAll({ id: { $in: data.tariffs } }, { variables: 1 });
    let out = [];
    tariffs.forEach(tariff => {
      if (tariff.variables && tariff.variables.length) {
        tariff.variables.forEach(variable => {
          for (let vrb of out) {
            if (vrb.key == variable.key) return;
          }
          out.push(variable);
        });
      }
    });
    cb({ variables: out });
  },

  /* scope:client */
  getCopy(id, cb) {
    this.runOnServer("getCopy", { id }, cb);
  },

  /* scope:server */
  async $getCopy(data, cb) {
    const out = {};
    out.plan = await this.dbCollection.findOne({ id: data.id });
    out.tariffs = await this.src.db
      .collection("tariffs")
      .findAll({ id: { $in: out.plan.tariffs } });
    let triggers = [];
    out.tariffs.forEach(item => {
      if (!triggers.includes(item.trigger)) triggers.push(item.trigger);
    });
    out.triggers = await this.src.db
      .collection("triggers")
      .findAll({ id: { $in: triggers } });
    cb(out);
  },

  /* scope:client */
  pushCopy(data, cb) {
    this.runOnServer("pushCopy", data, cb);
  },

  /* scope:server */
  async $pushCopy(data, cb) {
    for (let trigger of data.triggers) {
      await this.src.db.collection("triggers").remove({ id: trigger.id }, {});
      await this.src.db.collection("triggers").insert(trigger);
    }
    for (let tariff of data.tariffs) {
      await this.src.db.collection("tariffs").remove({ id: tariff.id }, {});
      await this.src.db.collection("tariffs").insert(tariff);
    }
    await this.dbCollection.remove({ id: data.plan.id });
    await this.dbCollection.insert(data.plan);
    cb({ success: true });
  }
});
