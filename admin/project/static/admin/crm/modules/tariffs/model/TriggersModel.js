Ext.define("Crm.modules.tariffs.model.TriggersModel", {
  extend: "Core.data.DataModel",

  collection: "triggers",
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
      name: "ttype",
      type: "int",
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
      name: "method",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "cron",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "tablename",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "conditions",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "data",
      type: "object",
      filterable: false,
      editable: true,
      visible: true
    }
  ],
  /* scope:client */
  testCronString(text, cb) {
    this.runOnServer("testCronString", { text }, cb);
  },

  /* scope:server */
  $testCronString(data, cb) {
    cb({ valid: require("node-cron").validate(data.text) });
  },

  /* scope:client */
  testQuery(data, cb) {
    this.runOnServer("testQuery", data, cb);
  },

  /* scope:server */
  $testQuery(data, cb) {
    this.src.db.query(
      `SELECT * FROM ${data.table} WHERE ${data.conditions} LIMIT 1`,
      [],
      (e, d) => {
        cb({ valid: !e });
      }
    );
  }
});
