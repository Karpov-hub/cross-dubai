Ext.define("Crm.modules.tariffs.model.EasySettingsModel", {
  extend: "Core.data.DataModel",

  collection: "tariffs_es",
  idField: "id",
  find: { pid: null },
  //removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "pid",
      type: "ObjectID",
      filterable: true,
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
      name: "pcategory",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ptype",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "fee_withdrawal",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "fee_transfer",
      type: "float",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "fee_masspayment",
      type: "float",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "fee_merchant",
      type: "float",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "enb_deposit",
      type: "boolean",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "enb_withdrawal",
      type: "boolean",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "enb_merchant",
      type: "boolean",
      filterable: false,
      editable: true,
      visible: true
    }
  ]
});
