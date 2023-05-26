const Queue = require("@lib/queue"); // scope:server

Ext.define("Crm.modules.viewset.model.ViewsetModel", {
  extend: "Core.data.DataModel",

  collection: "viewset",
  idField: "id",
  removeAction: "remove",
  strongRequest: true,

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
      name: "sql",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  sendQuery: function(params, cb) {
    this.runOnServer("sendQuery", params, cb);
  },

  /* scope:server */
  $sendQuery: function(params, cb) {
    if (/^select/i.test(params.q) && !/limit/i.test(params.q)) {
      params.q += " limit 100";
    }
    this.src.db.query(params.q, [], (e, d) => {
      cb(e ? { error: e } : { data: d });
    });
  },

  /* scope:server */
  afterSave: function(data, cb) {
    Queue.broadcastJob("updateViews", {}, 3000);
    cb(data);
  }
});
