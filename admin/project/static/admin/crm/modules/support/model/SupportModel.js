Ext.define("Crm.modules.support.model.SupportModel", {
  extend: "Crm.classes.DataModel",

  mixins: ["Crm.modules.managers.model.ManagerFunctions"],

  collection: "tickets",
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "number_of_ticket",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "title",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "category",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "message",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "type",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "new",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "status",
      type: "int",
      sort: 1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: 1,
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "realm_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "users",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          legalname: 1,
          id: 1
        }
      }
    }
  ],

  /* scope:client */
  async getCount(cb) {
    this.runOnServer("getCount", {}, cb);
  },

  /* scope:server */
  async $getCount(data, cb) {
    const res = await this.src.db.query(
      "SELECT count(*) FROM tickets WHERE new=0 and removed=0"
    );
    cb({
      count: res[0].count
    });
  }
});
