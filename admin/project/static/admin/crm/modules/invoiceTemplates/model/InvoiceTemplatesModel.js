Ext.define("Crm.modules.invoiceTemplates.model.InvoiceTemplatesModel", {
  extend: "Core.data.DataModel",

  collection: "invoice_templates",
  idField: "id",

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
      editable: true,
      visible: true
    },
    {
      name: "def",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "html",
      type: "text",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  async beforeSave(data, cb) {
    if (data.def) await this.dbCollection.update({}, { $set: { def: false } });
    cb(data);
  }
});
