Ext.define("Crm.modules.kyc.model.AddressModel", {
  extend: "Crm.classes.DataModel",

  collection: "address_kycs",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "realm_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "country",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "state",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "city",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "zip_code",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "address_type",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "doc_type",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "issue_date",
      type: "date",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "verified",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "file",
      type: "ObjectID",
      editable: false,
      visible: true
    }
  ],
  async afterGetData(data, callback) {
    if (!data || !data.length) return callback(data);

    const files_id = data.map((item) => item.file);
    if (!files_id || !files_id.length) return callback(data);

    const allFiles = {};
    const res = await this.src.db
      .collection("providers")
      .findAll({ code: { $in: files_id } }, {});

    res.forEach((item) => {
      allFiles[item.code] = item;
    });
    data = data.map((item) => {
      let files = [];
      item.file.forEach((id) => {
        if (allFiles[id]) files.push(allFiles[id]);
      });
      item.file = files;
      return item;
    });
    callback(data);
  }
});
