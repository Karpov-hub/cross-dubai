Ext.define("Crm.modules.tariffs.model.DbTablesModel", {
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
    /*const tables = await this.src.db.query(
      "select table_schema, table_name from information_schema.tables where table_schema='public' order by table_schema, table_name",
      []
    );
*/
    let out = []; /*tables.map(item => {
      return { name: item.table_name };
    });*/

    const views = await this.src.db
      .collection("viewset")
      .findAll({}, { name: 1 });
    out = views;

    cb({
      total: out.length,
      list: out
    });
  }
});
