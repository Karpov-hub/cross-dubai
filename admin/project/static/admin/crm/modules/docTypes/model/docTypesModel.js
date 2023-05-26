Ext.define("Crm.modules.docTypes.model.docTypesModel", {
  extend: "Core.data.DataModel",

  collection: "doc_types",
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      visible: true,
      editable: true
    }
  ],
  /* scope:server */
  async $saveNewDocType(data, cb) {
    var me = this;
    const uuidV4 = require("uuid/v4");
    var res = await me.dbCollection.insert({
      id: uuidV4(),
      name: data.name,
      removed: 0,
      ctime: new Date(),
      mtime: new Date()
    });
    if (res) cb(true);
  }
});
