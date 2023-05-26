Ext.define("Crm.modules.files.model.FilesModel", {
  extend: "Crm.classes.DataModel",

  collection: "files",
  idField: "id",
  //removeAction: "remove",

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
      editable: true,
      visible: true
    },
    {
      name: "code",
      type: "ObjectID",
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
      name: "mtime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "removed",
      type: "int",
      editable: true,
      visible: true,
      filterable: false
    },
    {
      name: "owner_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "maker",
      type: "ObjectID",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "type",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "invoice_id",
      type: "ObjectID",
      filterable: false,
      editable: false,
      visible: true
    },
    {
      name: "cancelled",
      type: "int",
      editable: true,
      visible: true,
      filterable: false
    }
  ],

  /* scope:client */
  updateCustomFileName: async function(params, cb) {
    await this.runOnServer("updateCustomFileName", { params }, (res) => {});
  },

  /* scope:server */
  $updateCustomFileName: async function(data, cb) {
    const res = await this.src.db.query(
      "UPDATE files SET name = $1 WHERE id=$2;",
      [data.params.name, data.params.id]
    );
    return cb({ success: true });
  },

  /* scope:client */
  async updateGrid() {
    return new Promise((resolve, reject) => {
      this.runOnServer("updateGrid", {}, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:client */
  async getRealm(data, cb) {
    this.runOnServer("getRealm", data, cb);
  },

  /* scope:server */
  async $getRealm(data, cb) {
    return cb(
      await this.src.db
        .collection("users")
        .findOne({ id: data.owner_id }, { id: 1, realm: 1 })
    );
  },

  /* scope:client */
  async getRealmOrganization(data, cb) {
    this.runOnServer("getRealmOrganization", data, cb);
  },

  /* scope:server */
  async $getRealmOrganization(data, cb) {
    let res = await this.src.db
      .collection("vw_orgs_contract")
      .findOne(
        { id: data.id, owner_id: { $ne: data.owner_id } },
        { owner_id: 1 }
      );
    return cb(res ? res : {});
  },

  /* scope:client */
  async getArchiveFiles(data, cb) {
    this.runOnServer("getArchiveFiles", data, cb);
  },

  /* scope:server */
  async $getArchiveFiles(data, cb) {
    if (!data || !data.meta_files || !Array.isArray(data.meta_files))
      return cb([]);
    let res = await this.callApi({
      service: "report-service",
      method: "downloadArchive",
      data
    });
    return cb(res);
  }
});
