Ext.define("Crm.modules.banks.model.DirectoryBanksModel", {
  extend: "Crm.classes.DataModel",

  collection: "directory_banks",
  idField: "id",
  removeAction: "remove",
  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "bank_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "skip_rows",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "parse_code",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "fee_percent",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
