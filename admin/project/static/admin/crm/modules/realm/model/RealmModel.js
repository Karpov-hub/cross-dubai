Ext.define("Crm.modules.realm.model.RealmModel", {
  extend: "Core.data.DataModel",

  collection: "realms",
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "pid",
      type: "ObjectID",
      visible: true,
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
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "token",
      type: "string",
      filterable: true,
      editable: true,
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
      name: "cors",
      type: "object",
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
      name: "ip",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "domain",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "permissions",
      type: "object",
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
      name: "admin_realm",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  getApiServices(cb) {
    this.runOnServer("getApiServices", {}, cb);
  },

  /* scope:server */
  async $getApiServices(data, cb) {
    cb(
      await this.src.queue.requestOne("auth-service", {
        method: "getPublicMethods",
        data: {}
      })
    );
  },

  /* scope:client */
  generateToken(cb) {
    this.runOnServer("generateToken", {}, (res) => {
      cb(res && res.token ? res.token : null);
    });
  },

  /* scope:server */
  async $generateToken(data, cb) {
    const UIDGenerator = require("uid-generator");
    const uidgen = new UIDGenerator(256, UIDGenerator.BASE16);
    uidgen.generate((err, token) => {
      if (err) throw err;
      cb({ token });
    });
  },

  /* scope:server */
  async beforeSave(data, cb) {
    const res = await this.dbCollection.findOne({ id: data.id }, { token: 1 });
    if (res && res.token) {
      this.oldToken = res.token;
    }
    cb(data);
  },

  /* scope:server */
  async afterSave(data, cb) {
    if (this.oldToken) {
      await this.src.queue.requestOne("auth-service", {
        method: "resetServer",
        data: { token: this.oldToken }
      });
    }
    cb(data);
  },

  /* scope:server */
  async $checkDefaultRealm(data, cb) {
    let realms = await this.dbCollection.findAll({
      admin_realm: true,
      id: { $ne: data.realmId }
    });
    if (realms.length > 0) {
      cb({ result: false });
    } else {
      cb({ result: true });
    }
  }
});
