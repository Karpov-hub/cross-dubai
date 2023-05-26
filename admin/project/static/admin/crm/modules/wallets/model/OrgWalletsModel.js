Ext.define("Crm.modules.wallets.model.OrgWalletsModel", {
  extend: "Crm.classes.DataModel",

  collection: "vw_org_wallets",
  idField: "org",
  strongRequest: true,

  fields: [
    {
      name: "org",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
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
      name: "num",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "curr_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  getData(params, cb) {
    var me = this,
      sql,
      sqlPlaceholders = [],
      buildWhere = "";
    sql = "select org,num,curr_name,name from vw_org_wallets";
    if (params.org != undefined && typeof params.org == "string") {
      sqlPlaceholders.push(params.org);
      buildWhere += " where org = $" + sqlPlaceholders.length + " ";
    }
    if (params.currency != undefined && typeof params.currency == "string") {
      sqlPlaceholders.push(params.currency);
      buildWhere +=
        buildWhere.length > 0 ? " and curr_name = $" : " where curr_name = $";
      buildWhere += sqlPlaceholders.length;
    }
    sql += buildWhere;
    me.src.db.query(sql, sqlPlaceholders, function(err, data) {
      if (data && data.length > 0) cb({ total: data.length, list: data }, null);
      else cb({ total: 0, list: [] }, null);
    });
  }
});
