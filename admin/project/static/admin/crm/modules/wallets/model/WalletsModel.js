Ext.define("Crm.modules.wallets.model.WalletsModel", {
  extend: "Crm.classes.ClientFilteredModel",

  filterParam: { entity: "client", field: "user_id" },

  collection: "crypto_wallets",
  idField: "id",

  mixins: [
    "Crm.modules.merchants.model.DepartmentsFunctionsModel", // scope:server
    "Crm.modules.orders.model.UpdateDataFuncModel" // scope:server
  ],

  fields: [
    {
      name: "id",
      type: "ObjectID",
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
    },
    {
      name: "status",
      type: "boolean",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "send_via_chain_required",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: false,
      visible: true
    }
  ],

  /* scope:client */
  async write(data, cb) {
    await this.callApi("account-service", "upsertWalletAddressBook", data);

    await this.refreshData({
      modelName: this.$className
    });

    return cb({ success: true });
  },

  /* scope:client */
  async refreshData(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("refreshData", data, (res) => {
        resolve(res);
      });
    });
  },

  getData(params, cb) {
    const find_arr = [];
    let user_id = null;

    this.find = {
      $and: []
    };

    if (params._filters || params.filters) {
      const filters = params.filters || params._filters;
      if (filters[0].property == "id") {
        return this.callParent(arguments);
      }
      for (const f of filters) {
        if (f._property == "user_id" || f.property == "user_id") {
          user_id = f._value || f.value;
        }
      }
    }

    if (user_id) {
      find_arr.push({
        user_id
      });
    }

    if (!find_arr.length) {
      return cb({ total: 0, list: [] });
    }

    this.callParent(arguments);
  }
});
