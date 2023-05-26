Ext.define("Crm.modules.merchants.model.RealmDepartmentModel", {
  extend: "Core.data.DataModel",

  collection: "realmdepartments",
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
      name: "realm",
      type: "ObjectID",
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
      name: "description",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "status",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "bank_details",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "realm_acc",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "director",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "address",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "register",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "tax_number",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "vat_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "bank_id",
      type: "array",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "phone",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "country",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "zip",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "city",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "street",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "house",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "additional_info",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
