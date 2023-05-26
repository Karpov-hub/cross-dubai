Ext.define("Crm.modules.letterTemplates.model.letterTemplatesModel", {
  extend: "Crm.classes.DataModel",

  collection: "letters",
  idField: "id",

  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "transporter",
      type: "ObjectID",
      sort: 1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "realm",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "realms",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1,
          id: 1
        }
      }
    },
    {
      name: "code",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "letter_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "subject",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "lang",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "text",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "from_email",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "to_email",
      type: "string",
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
      name: "data",
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
    },
    {
      name: "type",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  async afterGetData(data, callback) {
    if (!data || !data.length) return callback(data);

    const transporters_id = data.map((item) => item.transporter);
    if (!transporters_id || !transporters_id.length) return callback(data);

    const res = await this.src.db
      .collection("transporters")
      .findAll({ id: { $in: transporters_id } }, {});

    for (transport of res) {
      data = data.map((item) => {
        if (!item.type && item.type !== 0) item.type = 1;
        if (item.transporter == transport.id)
          item.transporter = transport.host_transporter;
        return item;
      });
    }

    callback(data);
  }

  // async beforeSave(data, cb) {
  //   if (!data.merchant) return cb(data);
  //   await this.src.db
  //     .collection("merchants")
  //     .update({ id: data.merchant }, { $set: { id_template: data.id } });
  //   cb(data);
  // }
});
