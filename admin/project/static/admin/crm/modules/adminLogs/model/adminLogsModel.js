Ext.define("Crm.modules.adminLogs.model.adminLogsModel", {
  extend: "Crm.classes.DataModel",
  collection: "admin_logs",
  strongRequest: true,
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "data",
      type: "text",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "result",
      type: "text",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "date",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  async afterGetData(data, cb) {
    if (!data || !data.length) return callback(data);
    for (const d of data) {
      d.data = JSON.stringify(d.data);
      d.result = JSON.stringify(d.result);
    }
    cb(data);
  }
});
