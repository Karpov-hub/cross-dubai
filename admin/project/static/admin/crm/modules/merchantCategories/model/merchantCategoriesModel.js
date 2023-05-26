Ext.define("Crm.modules.merchantCategories.model.merchantCategoriesModel", {
  extend: "Crm.classes.DataModel",

  collection: "categories_merchants",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
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
      name: "name",
      type: "string",
      sort: 1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: false,
      visible: true
    }
  ]
});
