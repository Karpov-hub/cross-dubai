Ext.define("Crm.modules.nonCustodialWallets.model.WalletsModel", {
  extend: "Crm.classes.ClientFilteredModel",

  filterParam: { entity: "merchant", field: "merchant_id" },

  collection: "non_custodial_wallets",
  idField: "id",

  mixins: [
    "Crm.modules.orders.model.UpdateDataFuncModel" // scope:server
  ],

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "address",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "currency",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "users",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          legalname: 1,
          email: 1
        }
      }
    },
    {
      name: "merchant_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "merchants",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1
        }
      }
    },
    {
      name: "memo",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "last_pk_share_date",
      type: "date",
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

  /* scope:server */
  write(data, cb) {},

  /* scope:client */
  async getDefaultRealm(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getDefaultRealm", {}, resolve);
    });
  },

  /* scope:server */
  async $getDefaultRealm(params, cb) {
    const res = await this.src.db.collection("realms").findOne({
      admin_realm: true
    });
    cb(res ? res.id : {});
  },

  /* scope:client */
  async refreshData(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("refreshData", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:client */
  async getAllMerchantsByClient(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getAllMerchantsByClient", params, resolve);
    });
  },

  /* scope:server */
  async $getAllMerchantsByClient(params, cb) {
    const res = await this.src.db.collection("merchants").findAll(
      {
        user_id: params.client_id
      },
      { id: 1, name: 1 }
    );
    cb(res || []);
  },

  /* scope:client */
  async checkClientMerchant(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("checkClientMerchant", params, resolve);
    });
  },

  /* scope:server */
  async $checkClientMerchant(params, cb) {
    const res = await this.src.db.collection("merchants").findOne({
      id: params.merchant_id,
      user_id: params.client_id
    });
    cb(!!res);
  },

  /* scope:client */
  async getClientByMerchant(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getClientByMerchant", params, resolve);
    });
  },

  /* scope:server */
  async $getClientByMerchant(params, cb) {
    const res = await this.src.db.collection("merchants").findOne(
      {
        id: params.merchant_id
      },
      { user_id: 1 }
    );
    cb(res ? res.user_id : null);
  }
});
