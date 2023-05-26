Ext.define("Crm.modules.userLogs.model.UserLogsModel", {
  extend: "Crm.classes.DataModel",
  collection: "vw_user_logs",
  strongRequest: true,
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "username",
      type: "string",
      visible: true,
      filterable: true,
      editable: false
    },
    {
      name: "admin_name",
      type: "string",
      visible: true,
      filterable: true,
      editable: false
    },
    {
      name: "merchant",
      type: "string",
      visible: true,
      filterable: true,
      editable: false
    },
    {
      name: "method",
      type: "string",
      visible: true,
      filterable: true,
      editable: false
    },
    {
      name: "data",
      type: "text",
      visible: true,
      filterable: true,
      editable: false
    },
    {
      name: "result",
      type: "text",
      filterable: true,
      editable: false,
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
    if (!data || !data.length) return cb(data);
    for (const d of data) {
      d.data = JSON.stringify(d.data);
      d.result = JSON.stringify(d.result);
    }
    cb(data);
  }
});
