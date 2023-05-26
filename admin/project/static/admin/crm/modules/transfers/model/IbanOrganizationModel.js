Ext.define("Crm.modules.transfers.model.IbanOrganizationModel", {
  extend: "Crm.classes.DataModel",

  collection: "vw_orgs_ibans",
  idField: "id",
  strongRequest: true,
  showTags: true,
  //removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "org_id",
      type: "ObjectID",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "iban",
      type: "string",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "currency",
      type: "string",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "notes",
      type: "string",
      visible: true,
      filterable: true,
      editable: true
    }
  ]
});
