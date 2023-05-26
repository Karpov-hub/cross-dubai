Ext.define("Crm.modules.userDocs.model.userDocsModel", {
  extend: "Crm.classes.DataModel",

  collection: "user_documents",
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
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      visible: true,
      editable: true
    },
    {
      name: "doc_code",
      type: "string",
      filterable: true,
      visible: true,
      editable: true
    },
    {
      name: "type",
      type: "ObjectID",
      filterable: true,
      visible: true,
      editable: true
    },
    {
      name: "status",
      type: "int",
      filterable: true,
      visible: true,
      editable: true
    }
  ],

  /* scope:server */
  async $checkIfDocumentExist(data, cb) {
    var me = this;
    var res = await me.dbCollection.findOne(
      { id: data.id },
      { id: 1, name: 1, doc_code: 1 }
    );

    cb(res || false);
  },
  /* scope:server */
  async $updateDocument(data, cb) {
    var me = this;
    await me.dbCollection.update(
      { id: data.id, user_id: data.user_id },
      {
        $set: {
          name: data.files[0].name,
          doc_code: data.files[0].code,
          type: data.type,
          status: data.status,
          mtime: new Date()
        }
      }
    );
    cb();
  }
});
