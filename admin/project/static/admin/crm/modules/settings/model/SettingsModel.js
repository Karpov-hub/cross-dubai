Ext.define("Crm.modules.settings.model.SettingsModel", {
  extend: "Core.data.DataModel",

  collection: "settings",
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "key",
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
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
