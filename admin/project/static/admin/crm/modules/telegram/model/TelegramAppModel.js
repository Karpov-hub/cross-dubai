Ext.define("Crm.modules.telegram.model.TelegramAppModel", {
  extend: "Crm.classes.DataModel",

  mixins: ["Crm.modules.managers.model.ManagerFunctions"],

  collection: "telegram_apps",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
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
      name: "app_id",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "api_hash",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "session",
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
          legalname: 1
        }
      }
    },
    {
      name: "active",
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
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  async $checkActiveApp(data, cb) {
    let tgApps = await this.dbCollection.findAll({
      active: true,
      id: { $ne: data.recordAppId },
      user_id: data.userId
    });
    if (tgApps.length > 0) {
      cb({ result: false });
    } else {
      cb({ result: true });
    }
  },

  /* scope:client */
  async checkTelegramChannelExist(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("checkTelegramChannelExist", data, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $checkTelegramChannelExist(data, cb) {
    let where = { ref_id: data.ref_id };
    if (Array.isArray(data.ref_id)) where.ref_id = { $in: data.ref_id };

    const channel = await this.src.db
      .collection("telegram_channels")
      .findAll(where);

    return cb(!!channel.length);
  },

  /* scope:client */
  async checkAppExist(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("checkAppExist", data, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $checkAppExist(data, cb) {
    const app = await this.src.db.collection("telegram_apps").findOne({
      user_id: data.user_id
    });

    return cb(!!app);
  },

  /* scope:client */
  async getChannelInfo(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getChannelInfo", data, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $getChannelInfo(data, cb) {
    let where = { ref_id: data.ref_id };
    if (Array.isArray(data.ref_id)) where.ref_id = { $in: data.ref_id };
    let channel = await this.src.db
      .collection("telegram_channels")
      .findAll(where);
    if (channel.length) channel = channel[0];
    return cb(channel);
  }
});
