Ext.define("Crm.modules.tariffs.model.TestsChecksModel", {
  extend: "Crm.classes.DataModel",

  idField: "id",
  collection: "checks",
  removeAction: "remove",
  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "test_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "code",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "parameter",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "operator",
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
      name: "status",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: 1,
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
