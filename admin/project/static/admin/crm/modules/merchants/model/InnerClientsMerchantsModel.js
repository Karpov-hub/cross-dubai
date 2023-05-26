Ext.define("Crm.modules.merchants.model.InnerClientsMerchantsModel", {
  extend: "Crm.classes.ClientFilteredModel",

  filterParam: { entity: "client", field: "user_id" },

  collection: "vw_inner_clients_merchants",
  idField: "id",
  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
      filterable: true,
      visible: true
    },
    {
      name: "name",
      type: "string",
      sort: 1,
      filterable: true,
      visible: true
    },
    {
      name: "user_id",
      sort: 1,
      type: "ObjectID",
      filterable: true,
      visible: true
    }
  ]
});
