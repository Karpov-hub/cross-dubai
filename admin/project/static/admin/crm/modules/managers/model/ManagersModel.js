Ext.define("Crm.modules.managers.model.ManagersModel", {
  extend: "Crm.classes.DataModel",

  collection: "managers",
  removeAction: "remove",
  strongRequest: true,
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "admin_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "clients",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  async getData(data, cb) {
    const uuid = require("uuid/v4");
    let sql = `
    select 
        m.id id,
        au._id admin_id, 
        au."name" "name", 
        au.login login, 
        m.clients clients 
    from admin_users au
    left join managers m
    on(au."_id" = m.admin_id)
    where (au.other_configs ->>'is_manager')::boolean = true
    `;
    let list = await this.src.db.query(sql);
    for (let el of list) if (!el.id) el.id = uuid();
    let row_counter = this.src.db.query(
      `select count(cnt.*) from (${sql}) cnt`
    );

    return cb({
      list: await this.afterGetData(list),
      total: row_counter
    });
  },

  /* scope:server */
  async afterGetData(data) {
    if (!data) return [];
    let clients = Array.from(new Set(data.flatMap((el) => el.clients)));
    if (!clients || !clients.length) return data;
    let clients_data = await this.src.db
      .collection("users")
      .findAll({ id: { $in: clients } }, { id: 1, legalname: 1 });

    for (let item of data)
      if (item && item.clients)
        item.clients_data = item.clients.map((el) =>
          clients_data.find((cd_el) => cd_el.id == el)
        );

    return data;
  },

  /* scope:client */
  reloadGridData() {
    return this.runOnServer("reloadGridData", {}, () => {});
  },

  /* scope:server */
  $reloadGridData(data, cb) {
    this.changeModelData("Crm.modules.managers.model.ManagersModel", "ins", {});
    cb();
  }
});
