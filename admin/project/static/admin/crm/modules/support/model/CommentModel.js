Ext.define("Crm.modules.support.model.CommentModel", {
  extend: "Crm.classes.DataModel",

  collection: "comments",
  idField: "id",
  // removeAction: "remove", // не нужно удалять сообщения, они будут просто отмечаться как удаленные

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "ticket_id",
      type: "ObjectID",
      editable: true,
      visible: true
    },
    {
      name: "sender",
      type: "ObjectID",
      editable: false,
      visible: true,
      bindTo: {
        collection: "vw_allusers",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1,
          login: 1,
          type: 1,
          id: 1
        }
      }
    },

    {
      name: "file_id",
      type: "array",
      editable: true,
      visible: true
    },
    {
      name: "realm_id",
      type: "ObjectID",
      editable: true,
      visible: true
    },
    {
      name: "message",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "is_user_message",
      type: "string",
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "datetime",
      sort: -1,
      filterable: true,
      visible: true
    }
  ],

  async afterGetData(data, callback) {
    if (!data || !data.length) return callback(data);

    let files_id = data.map((item) => item.file_id);
    // files_id = files_id.flat();
    files_id = [].concat(...files_id);

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
      item.file_id.forEach((id) => {
        if (allFiles[id]) files.push(allFiles[id]);
      });
      item.file_id = files;
      return item;
    });
    callback(data);
  }
});
