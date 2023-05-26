Ext.define("Crm.modules.businessTypes.model.BusinessTypesModel", {
  extend: "Core.data.DataModel",

  collection: "business_types",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "type",
      type: "string",
      sort: 1,
      filterable: true,
      editable: true,
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
      name: "ctime",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
