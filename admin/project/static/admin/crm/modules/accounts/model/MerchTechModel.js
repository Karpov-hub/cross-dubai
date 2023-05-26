Ext.define("Crm.modules.accounts.model.MerchTechModel", {
  extend: "Crm.classes.DataModel",

  collection: "vw_withdraval_accounts",
  idField: "merchant",
  strongRequest: true,

  fields: [
    {
      name: "merchant",
      type: "ObjectID",
      filterable: true,
      visible: true
    },

    {
      name: "acc_no",
      sort: 1,
      type: "string",
      filterable: true,
      visible: true
    },
    {
      name: "acc_name",
      sort: 1,
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
    }
  ]
});
