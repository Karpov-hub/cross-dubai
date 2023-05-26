Ext.define("Crm.modules.tariffs.model.DbTablesFieldsModel", {
  extend: "Core.data.DataModel",

  collection: "tariffs",
  idField: "name",
  //removeAction: "remove",

  fields: [
    {
      name: "name",
      type: "string",
      visible: true
    }
  ],

  /* scope:server */
  async getData(params, cb) {
    if (!params.filters || !params.filters[0])
      return cb({ total: 0, list: [] });
    const res = await this.getViewFieldsList(params.filters[0].value);
    cb({
      total: res.length,
      list: res
    });
  },

  /* scope:server */
  async getViewFieldsList(view) {
    const res = await this.src.db
      .collection("viewset")
      .findOne({ name: view }, { sql: 1 });
    if (!res) {
      return [];
    }
    if (!/ limit /i.test(res.sql)) res.sql += " LIMIT 1";
    const out = await this.src.db.query(res.sql);
    if (!out || !out[0]) return [];
    return Object.keys(out[0]).map(key => {
      return { name: key };
    });
  },

  /* scope:server */
  async getTableFieldsList(table) {
    const res = await this.src.db.query(
      "SELECT column_name FROM information_schema.columns  WHERE table_schema = 'public' AND table_name = $1 ORDER BY column_name",
      [table]
    );
    return res.map(item => {
      return { name: item.column_name };
    });
  },

  /* scope:server */
  async $getExampleRecord(data, cb) {
    const res = await this.src.db
      .collection("viewset")
      .findOne({ name: data.table }, { sql: 1 });
    if (!res) return {};
    const recs = await this.src.db.query(
      res.sql + (/ limit /i.test(res.sql) ? "" : " limit 1")
    );

    return cb(recs && recs[0] ? recs[0] : {});
  },

  /* scope:server */
  createExampleRecordByFieldType(data, cb) {
    this.src.db.query(
      "SELECT data_type, column_name FROM information_schema.columns  WHERE table_schema = 'public' AND table_name = $1 ORDER BY column_name",
      [data.table],
      (e, data) => {
        let out = {};
        data.forEach(item => {
          out[item.column_name] = this.buildExDataByType(item.data_type);
        });
        cb(out);
      }
    );
  },

  buildExDataByType(type) {
    switch (type) {
      case "timestamp without time zone":
        return "01.01.2019";
      case "smallint":
        return 123;
      case "numeric":
        return 123998;
      case "double precision":
        return 2.34;
      case "character":
        return "a";
      case "json":
        return { object: 123 };
      case "boolean":
        return true;
    }
    return "Test string";
  }
});
