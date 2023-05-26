Ext.define("Crm.modules.accountsPlan.model.TagsModel", {
  extend: "Core.data.DataModel",

  collection: "acc_plans_tags",
  idField: "id",

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
      filterable: false,
      editable: true,
      visible: true
    }
  ]
});
