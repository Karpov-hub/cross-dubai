const config = require("@lib/config"); // scope:server

Ext.define("Crm.modules.accountHolders.model.UsersModel", {
  extend: "Crm.classes.ClientFilteredModel",

  mixins: [
    "Crm.modules.currency.model.CurrencyFunc",
    "Crm.modules.managers.model.ManagerFunctions"
  ],

  collection: "users",
  idField: "id",
  removeAction: "remove",
  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "tariff",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "variables",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "type",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "pass",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "on_top",
      type: "boolean",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "activated",
      type: "boolean",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "google_auth",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "kyc",
      sort: 1,
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: 1,
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "login",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "email",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "first_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "last_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "birthday",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "countries",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "legalname",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "phone",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "realm",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "realms",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1,
          id: 1
        }
      }
    },
    {
      name: "activatecode",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "country",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "keyword",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "zip_addr1",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "city_addr1",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "street_addr1",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "house_addr1",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "apartment_addr1",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "zip_addr2",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "city_addr2",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "street_addr2",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "house_addr2",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "apartment_addr2",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "notes",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "otp_transport",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "signobject",
      type: "object",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "blocked",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "invoice_tpl",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ip",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "sumsub_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "payment_details",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "wcc",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "role",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "communication_lang",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "inner_client",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  async $bindCreatorAsManager(data, cb) {
    const uuid = require("uuid/v4");
    let manager =
      data.manager ||
      (await this.src.db
        .collection("managers")
        .findOne({ admin_id: data.admin_id }));
    if (!manager) {
      await this.src.db.collection("managers").insert({
        id: uuid(),
        admin_id: data.admin_id,
        clients: []
      });
      manager = { clients: [] };
    }
    manager.clients.push(data.client_id);
    await this.src.db
      .collection("managers")
      .update(
        { admin_id: data.admin_id },
        { $set: { clients: manager.clients } }
      );
    return cb({ success: true });
  },

  /* scope:server */
  async $bindManagers(data, cb) {
    let managers_id_list = data.managers.map((el) => el._id);
    let managers_data = await this.src.db.collection("managers").findAll({
      admin_id: { $in: managers_id_list }
    });
    for (let admin_id of managers_id_list) {
      let manager = managers_data.find((el) => el.admin_id == admin_id);
      this.$bindCreatorAsManager(
        { manager, admin_id: admin_id, client_id: data.client_id },
        () => {}
      );
    }
    return cb({ sucess: true });
  },

  /* scope:server */
  async $getManagers(data, cb) {
    return cb(
      await this.src.db.collection("admin_users").findAll({
        "other_configs->>is_manager": "true",
        removed: 0
      })
    );
  },

  /* scope:server */
  async $getManagersByClient(data, cb) {
    let managers = await this.src.db.collection("managers").findAll();
    managers = managers
      .filter((el) => el.clients.includes(data.client_id))
      .map((el) => el.admin_id);
    if (!managers || !managers.length) return cb([]);
    let admin_users = await this.src.db.collection("admin_users").findAll({
      "other_configs->>is_manager": "true",
      _id: {
        $in: managers
      },
      removed: 0
    });
    return cb(admin_users);
  },

  /* scope:client */
  async checkUserExitst(data, cb) {
    await this.runOnServer("checkUserExitst", data, cb);
  },

  /* scope:server */
  async $checkUserExitst(data, cb) {
    let user = await this.src.db.collection("users").findOne({ id: data.id });
    if (!user) return cb({ userExists: false });
    return cb({ userExists: true });
  },

  /* scope:client */
  async sendTempPassToUser(data, cb) {
    await this.runOnServer("sendTempPassToUser", data, cb);
  },
  /* scope:client */
  async checkUsersLogin(data, cb) {
    await this.runOnServer("checkUsersLogin", data, cb);
  },
  /* scope:server */
  async $checkUsersLogin(data, cb) {
    let user = await this.src.db
      .collection("users")
      .findAll({ email: data.email, id: { $ne: data.id } });
    if (!user.length) return cb({ haveUserWithSuchLogin: false });
    else return cb({ haveUserWithSuchLogin: true });
  },
  /* scope:server */
  async $sendTempPassToUser(data, cb) {
    let newData = await this.prepareData(data);
    let res = await this.callApi({
      service: "auth-service",
      method: "sendTempPassToUser",
      data: newData,
      realm: data.realm
    });
    return cb(res);
  },

  /* scope:server */
  async prepareData(data) {
    return {
      id: data.id,
      email: data.email
    };
  },

  /* scope:client */
  async getCount(cb) {
    this.runOnServer("getCount", {}, cb);
  },

  /* scope:server */
  async $getCount(data, cb) {
    const res = await this.src.db.query(
      "SELECT count(*) FROM users WHERE kyc=false and activated=true"
    );
    cb({
      count: res[0].count
    });
  },

  /* scope:server */
  insertDataToDb: function(data, cb) {
    data.ctime = new Date();
    data.mtime = new Date();
    this.dbCollection.insert(data, cb);
  },

  /* scope:server */
  updateDataInDb: function(_id, data, cb) {
    var oo = {};
    oo[this.idField] = _id;
    data.mtime = new Date();
    this.dbCollection.update(oo, { $set: data }, cb);
  },

  /* scope:client */
  getBalance(user_id, currency, cb) {
    this.runOnServer("getBalance", { user_id, currency }, (res) => {
      cb(res ? res.balance : 0);
    });
  },

  /* scope:server */
  async $getBalance(data, cb) {
    const realm = await this.src.db.collection("users").findOne(
      {
        id: data.user_id
      },
      { realm: 1 }
    );
    if (!realm) return cb({ balance: 0 });

    let { result } = await this.src.queue.requestOne("account-service", {
      method: "getUserBalance",
      data: {
        currency: data.currency
      },
      realmId: realm.realm,
      userId: data.user_id
    });

    const currencyList = await this.getCurrencyList();

    result.balance = await this.roundCurrency({
      currency: result.currency,
      balance: result.balance,
      currencyList
    });

    cb(result);
  },

  /* scope:client */
  async getDefaultRealm(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getDefaultRealm", {}, resolve);
    });
  },

  /* scope:server */
  async $getDefaultRealm(params, cb) {
    let res = await this.src.db.collection("realms").findOne({
      admin_realm: true
    });
    cb(res ? res.id : {});
  },

  /* scope:client */
  async removeClient(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("removeClient", params, resolve);
    });
  },

  /* scope:server */
  async $removeClient(params, cb) {
    await this.src.db.collection("users").remove({ id: params.data.id });
    await this.src.db
      .collection("merchants")
      .remove({ user_id: params.data.id });

    cb({});
  },

  /* scope:client */
  async getUserById(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getUserById", data, (res) => {
        resolve(res);
      });
    });
  },
  /* scope:server */
  async $getUserById(data, cb) {
    let res = await this.src.db.collection("users").findOne({ id: data.id });

    return cb(res);
  },

  /* scope:client */
  getUIUrl(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getUIUrl", {}, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  $getUIUrl(data, cb) {
    return cb(config.URL_TO_UI);
  }
});
