Ext.define("Crm.modules.merchants.model.CustomMerchantsModel", {
  extend: "Core.data.DataModel",

  collection: "cstm_merchants_for_deposits",
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
      name: "custom_name",
      type: "string",
      sort: 1,
      filterable: true,
      visible: true
    },
    {
      name: "merchant_id",
      sort: 1,
      type: "ObjectID",
      filterable: true,
      visible: true
    },
    {
      name: "merchant_name",
      sort: 1,
      type: "string",
      filterable: true,
      visible: true
    }
  ]
});
