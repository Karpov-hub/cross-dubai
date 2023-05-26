Ext.define("Crm.modules.reports.model.ReportsQueueModel", {
  extend: "Core.data.DataModel",

  extend: "Crm.classes.DataModel",
  collection: "reports_queue",
  strongRequest: true,
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true,
      filterable: true,
      editable: false
    },
    {
      name: "data",
      type: "object",
      visible: true,
      filterable: true,
      editable: false
    },
    {
      name: "status",
      type: "integer",
      visible: true,
      filterable: true,
      editable: false
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
      name: "error",
      type: "object",
      visible: true,
      filterable: true,
      editable: false
    }
  ],

  /* scope:server */
  async afterGetData(data, callback) {
    if (!data || !data.length) return callback(data);

    const reports_id = data.map((item) => item.id);
    if (!reports_id || !reports_id.length) return callback(data);

    const allFiles = {};
    const res = await this.src.db
      .collection("files")
      .findAll({ owner_id: { $in: reports_id } }, {});

    res.forEach((item) => {
      allFiles[item.owner_id] = item;
    });

    data = data.map((item) => {
      let files = [];
      if (allFiles[item.id]) files.push(allFiles[item.id]);
      item.report_description = item.data.report_description;
      item.file = files;
      return item;
    });

    callback(data);
  },

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
  },

  /* scope:client */
  async updateReportStatus(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("updateReportStatus", params, resolve);
    });
  },

  /* scope:server */
  async $updateReportStatus(params, cb) {
    await this.src.db.collection("reports_queue").update(
      {
        id: params.report_id
      },
      {
        $set: {
          status: params.status
        }
      }
    );
    cb(true);
  },

  /* scope:server */
  async onChange(params, cb) {
    this.changeModelData(Object.getPrototypeOf(this).$className, "ins", params);
    if (!!cb) cb({ success: true });
  }
});
