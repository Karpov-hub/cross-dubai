Ext.define("Crm.modules.accountsPlan.model.PlansModel", {
  extend: "Crm.classes.DataModel",

  collection: "accounts_plans",
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
      name: "tags",
      type: "array",
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
