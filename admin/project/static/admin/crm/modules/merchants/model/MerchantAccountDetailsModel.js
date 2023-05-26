Ext.define("Crm.modules.merchants.model.MerchantAccountDetailsModel", {
  extend: "Core.data.DataModel",

  collection: "vw_accounts_details",
  idField: "id",

  // strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "account_number",
      type: "string",
      sort: 1,
      filterable: true,
      visible: true
    },
    {
      name: "bank",
      type: "string",
      sort: 1,
      filterable: true,
      visible: true
    },
    {
      name: "swift",
      sort: 1,
      type: "string",
      filterable: true,
      visible: true
    },
    {
      name: "correspondent_currency",
      type: "string",
      filterable: true,
      visible: true
    },
    {
      name: "correspondent_account",
      type: "string",
      filterable: true,
      visible: true
    },
    {
      name: "merchant_id",
      type: "string",
      filterable: true,
      visible: true
    },
    {
      name: "contract_subject",
      type: "string",
      filterable: true,
      visible: true
    },
    {
      name: "contract_acc_currency",
      type: "string",
      filterable: true,
      visible: true
    }
  ]
});
