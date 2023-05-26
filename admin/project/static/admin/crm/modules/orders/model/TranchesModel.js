const uuid = require("uuid/v4"); //scope:server
Ext.define("Crm.modules.orders.model.TranchesModel", {
  extend: "Crm.classes.DataModel",

  collection: "tranches",
  idField: "id",

  removeAction:"remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "ref_id",
      type: "ObjectID",
      filterable: true,
      visible: true
    },
    {
      name: "no",
      sort: 1,
      type: "integer",
      filterable: true,
      visible: true
    },
    {
      name: "data",
      sort: 1,
      type: "object",
      filterable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  generateUUID() {
    return new Promise((resolve) => {
      this.runOnServer("generateUUID", {}, (res) => {
        resolve(res.id);
      });
    });
  },

  /* scope:server */
  async $generateUUID(data, cb) {
    return cb({ id: uuid() });
  }
});
