Ext.define("Crm.modules.banks.model.OrgIBANModel", {
  extend: "Crm.classes.DataModel",

  collection: "vw_org_ibans",
  idField: "org",
  strongRequest: true,

  fields: [
    {
      name: "org",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "iban",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "currency",
      type: "string",
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
      name: "bank_details",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "bank_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "notes",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "receiver_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "dflt",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "active",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "file_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
