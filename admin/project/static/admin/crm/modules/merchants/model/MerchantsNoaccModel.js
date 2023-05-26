Ext.define("Crm.modules.merchants.model.MerchantsNoaccModel", {
  extend: "Core.data.DataModel",

  collection: "merchants",
  idField: "id",
  removeAction: "remove",

  mixins: [
    "Crm.modules.merchants.model.DepartmentsFunctionsModel" // scope:server
  ],

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "tariff",
      type: "ObjectID",
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
      name: "user_id",
      type: "ObjectID",
      visible: true,
      editable: true,
      visible: true
    }
  ]
});
