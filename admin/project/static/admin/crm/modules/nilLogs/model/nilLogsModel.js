Ext.define("Crm.modules.nilLogs.model.nilLogsModel", {
  extend: "Crm.classes.DataModel",
  collection: "nil_logs",
  strongRequest: true,
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "request",
      type: "text",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "response",
      type: "text",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
