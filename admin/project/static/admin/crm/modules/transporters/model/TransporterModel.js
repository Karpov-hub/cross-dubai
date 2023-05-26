Ext.define("Crm.modules.transporters.model.TransporterModel", {
  extend: "Core.data.DataModel",

  collection: "transporters",
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
      name: "host_transporter",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "port_transporter",
      type: "integer",
      sort: 1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "secure_transporter",
      type: "boolean",
      sort: 1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "user_transporter",
      type: "string",
      sort: 1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "password_transporter",
      type: "string",
      sort: 1,
      filterable: true,
      editable: true,
      visible: true
    }
  ]

  // async beforeSave(data, cb) {
  //   if (!data.merchant) return cb(data);
  //   await this.src.db
  //     .collection("merchants")
  //     .update({ id: data.merchant }, { $set: { id_template: data.id } });
  //   cb(data);
  // }
});
