Ext.define("Crm.modules.contractors.model.ContractorsModel", {
  extend: "Crm.classes.DataModel",

  collection: "contractors",
  idField: "id",
  // removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "country",
      type: "string",
      filterable: true,
      editable: true,
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
      name: "reg_num",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "tax_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "vat",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "legal_address",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "office_address",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "phone",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "email",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "agreement_num",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "agreement_date",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "report_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  async getDefaultRealm(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getDefaultRealm", {}, resolve);
    });
  },

  /* scope:server */
  async $getDefaultRealm(params, cb) {
    let res = await this.src.db.collection("realms").findOne({
      admin_realm: true
    });
    cb(res ? res.id : {});
  }
});
