Ext.define("Crm.modules.allAddresses.model.AllAddressesModel", {
  extend: "Crm.classes.ClientFilteredModel",

  filterParam: { entity: "merchant", field: "merchant_id" },

  collection: "vw_all_addresses",
  idField: "id",
  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "source",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "address",
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
      name: "user_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "users",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          legalname: 1
        }
      }
    },
    {
      name: "merchant_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "merchants",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1
        }
      }
    }
  ]
});
