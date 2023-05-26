Ext.define("Crm.classes.ClientFilteredModel", {
  extend: "Crm.classes.DataModel",

  filterParam: { entity: "client", field: "id" },

  /* scope:server */
  async getData(data, cb) {
    const admin_user_cfgs = this.user.profile.other_configs;

    if (admin_user_cfgs.is_manager === true) {
      if (Array.isArray(this.filterParam)) {
        this.find = { $or: [] };
        for (let param of this.filterParam) {
          this.find.$or.push({
            [param.field]: { $in: await this.getSearchParam(param.entity) }
          });
        }
      } else
        this.find = {
          [this.filterParam.field]: {
            $in: await this.getSearchParam(this.filterParam.entity)
          }
        };
    }
    this.callParent(arguments);
  },

  /* scope:server */
  async getSearchParam(entity) {
    let manager_clients_data = {};
    let manager_clients = await this.src.db.collection("managers").findOne(
      {
        admin_id: this.user.id
      },
      {
        clients: 1
      }
    );

    if (
      !manager_clients ||
      !manager_clients.clients ||
      !manager_clients.clients.length
    )
      return [];
    manager_clients_data.clients = await this.getEntityIdsArray(
      "users",
      "id",
      manager_clients.clients
    );

    manager_clients_data.merchants =
      manager_clients_data.clients && manager_clients_data.clients.length
        ? await this.getEntityIdsArray(
            "merchants",
            "user_id",
            manager_clients_data.clients
          )
        : [];

    return manager_clients_data[`${entity}s`]
      ? manager_clients_data[`${entity}s`]
      : [];
  },

  async getEntityIdsArray(collection, search_field, search_criteria) {
    const data = await this.src.db.collection(collection).findAll({
      [search_field]: { $in: search_criteria }
    });
    if (!data || !data.length) return [];
    return data.map((el) => el.id);
  }
});
