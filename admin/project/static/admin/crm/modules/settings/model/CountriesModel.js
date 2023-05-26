Ext.define("Crm.modules.settings.model.CountriesModel", {
  extend: "Core.data.DataModel",

  collection: "countries",
  idField: "id",
  strongRequest: true,
  //removeAction: "remove",

  find: { lang: "English" },

  fields: [
    {
      name: "id",
      type: "int",
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
      name: "code",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "abbr2",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "abbr3",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "lang",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
