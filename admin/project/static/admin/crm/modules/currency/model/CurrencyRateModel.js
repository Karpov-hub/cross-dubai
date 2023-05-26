Ext.define("Crm.modules.currency.model.CurrencyRateModel", {
  extend: "Crm.classes.DataModel",

  collection: "currency_history",
  idField: "id",
  //removeAction: "remove",
  //strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "realms",
      type: "array",
      filterable: true,
      editable: true,
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
      name: "service",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },

    {
      name: "active",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },

    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: false,
      visible: true
    }
  ],

  /* scope:server */
  beforeSave(data, cb) {
    this.rateValues = Ext.clone(data.values);
    cb(data);
  },

  /* scope:server */
  async afterSave(data, cb) {
    if (this.rateValues) {
      await this.src.db.collection("currency_values").remove({ pid: data.id });
      for (let item of this.rateValues) {
        await this.src.db.collection("currency_values").insert({
          id: this.src.db.createObjectId(),
          pid: data.id,
          abbr: item.abbr,
          amount: parseFloat(item.amount || 0),
          value: parseFloat(item.value || 0)
        });
      }
    }
    cb(data);
  },

  /* scope:server */
  async afterGetData(data, cb) {
    if (data.length == 1) {
      data[0].values = await this.src.db.collection("currency_values").findAll({
        pid: data[0].id
      });
    }
    cb(data);
  }
});
