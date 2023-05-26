Ext.define("Crm.modules.currency.model.CurrencyModel", {
  extend: "Core.data.DataModel",

  collection: "currency",
  idField: "id",
  removeAction: "remove",
  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "int",
      visible: true
    },
    {
      name: "code",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "abbr",
      type: "string",
      filterable: true,
      editable: true,
      visible: true,
      sort: 1
    },

    {
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "api",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "apitoken",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "crypto",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "decimal",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "min_quote",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },

    {
      name: "provider_address",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "withdrawal_decimal",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "explorer_url",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ui_decimal",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ap_active",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ui_active",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
