Ext.define("Crm.modules.merchants.model.ViewMerchantsModel", {
  extend: "Crm.classes.ClientFilteredModel",

  filterParam: { entity: "merchant", field: "id" },

  collection: "vw_merchants",
  idField: "id",

  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
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
      name: "legalname",
      type: "string",
      filterable: true,
      visible: true
    },
    {
      name: "contract_acc_no",
      type: "arrayagg",
      filterable: true,
      visible: true
    },
    {
      name: "bank",
      type: "arrayagg",
      filterable: true,
      visible: true
    },
    {
      name: "last_deposit",
      type: "date",
      filterable: true,
      visible: true
    },
    {
      name: "beur",
      type: "number",
      filterable: true,
      visible: true
    },
    {
      name: "busd",
      type: "number",
      filterable: true,
      visible: true
    }
  ],

  /* scope:server */
  getData(params, cb) {
    if (params._filters && params._filters.length) {
      for (const item of params._filters) {
        if (item._property === "bank") {
          item._value = this.prepareString(item._value);
        }
      }
    }
    this.callParent(arguments);
  },

  /* scope:server */
  prepareString(string) {
    if (string.includes('"')) {
      string = string.replace(RegExp('"', "g"), '\\"');
    } else if (string.includes(",")) {
      string = string.replace(RegExp(",", "g"), "\\,");
    }
    return string;
  }
});
