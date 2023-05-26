Ext.define("Crm.modules.vat.model.VatLogsModel", {
  extend: "Crm.classes.DataModel",

  collection: "logs",
  idField: "id",
  // removeAction: "remove", // не нужно удалять сообщения, они будут просто отмечаться как удаленные

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "request",
      type: "text",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "responce",
      type: "text",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "realm",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "service",
      type: "text",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "method",
      type: "text",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  // async afterGetData(data, callback) {
  //   if (!data || !data.length) return callback(data);

  //   const files_id = data.map((item) => item.file_id).flat();
  //   if (!files_id || !files_id.length) return callback(data);

  //   const allFiles = {};
  //   const res = await this.src.db
  //     .collection("providers")
  //     .findAll({ code: { $in: files_id } }, {});

  //   res.forEach((item) => {
  //     allFiles[item.code] = item;
  //   });
  //   data = data.map((item) => {
  //     let files = [];
  //     item.file_id.forEach((id) => {
  //       if (allFiles[id]) files.push(allFiles[id]);
  //     });
  //     item.file_id = files;
  //     return item;
  //   });
  //   callback(data);
  // }

  /* scope:server */
  async $findLog(data, cb) {
    let date = Date.parse(data.ctime);

    let res = await this.src.db.collection("logs").findAll({
      ctime: {
        $gte: Ext.Date.format(new Date(date), "Y-m-d"),
        $lte: Ext.Date.format(new Date(date + 86400000), "Y-m-d")
      }
    });

    let out = [];
    for (item of res) {
      if (
        item.responce.countryCode == data.country &&
        item.responce.vatNumber == data.vat_num
      )
        out.push(item);
    }

    cb(out);
  }
});
