Ext.define("Crm.modules.tariffs.model.TariffsModel", {
  extend: "Core.data.DataModel",

  collection: "tariffs",
  idField: "id",

  //removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "pid",
      type: "ObjectID",
      visible: true,
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
      name: "description",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "trigger",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "data",
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
      name: "actions",
      type: "object",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "rules",
      type: "object",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "stop_on_rules",
      type: "boolean",
      filterable: false,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  checkAdminActionQuery(query) {
    return new Promise((resolve) => {
      this.runOnServer("checkAdminActionQuery", { query }, resolve);
    });
  },

  /* scope:server */
  async $checkAdminActionQuery(data, cb) {
    try {
      await this.src.db.query(
        "select name from admin_users where " + data.query
      );
      return cb({ success: true });
    } catch (e) {
      console.log(e);
      return cb({ success: false, message: e.message });
    }
  }
});
