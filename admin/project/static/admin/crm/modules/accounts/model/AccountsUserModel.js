Ext.define("Crm.modules.accounts.model.AccountsUserModel", {
  extend: "Core.data.DataModel",

  collection: "vw_accounts",
  idField: "id",

  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true,
    },
    {
      name: "status",
      type: "int",
      sort: 1,
      filterable: true,
      visible: true,
    },
    {
      name: "acc_no",
      sort: 1,
      type: "string",
      filterable: true,
      visible: true,
    },
    {
      name: "owner",
      type: "ObjectID",
      filterable: true,
      visible: true,
    },
    {
      name: "overdraft",
      type: "float",
      filterable: true,
      visible: true,
    },
    {
      name: "balance",
      type: "float",
      filterable: true,
      visible: true,
    },
    {
      name: "currency",
      type: "string",
      filterable: true,
      visible: true,
    },
    {
      name: "first_name",
      type: "float",
      filterable: true,
      visible: true,
    },
    {
      name: "last_name",
      type: "string",
      filterable: true,
      visible: true,
    },
    {
      name: "legalname",
      type: "string",
      filterable: true,
      visible: true,
    },
    {
      name: "zip",
      type: "string",
      filterable: true,
      visible: true,
    },
    {
      name: "address",
      type: "string",
      filterable: true,
      visible: true,
    },
    {
      name: "country",
      type: "string",
      filterable: true,
      visible: true,
    },
    {
      name: "realm",
      type: "ObjectID",
      filterable: true,
      visible: true,
    },
    {
      name: "realmname",
      type: "string",
      filterable: true,
      visible: true,
    },
  ],
});
