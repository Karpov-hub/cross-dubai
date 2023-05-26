Ext.define("Crm.modules.systemNotifications.model.systemNotificationsModel", {
  extend: "Crm.classes.DataModel",

  collection: "system_notifications",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "letter_template",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "date_from",
      type: "utcdatetime",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "date_to",
      type: "utcdatetime",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "data",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
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
      editable: false,
      visible: true
    },
    {
      name: "mail_sent",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "title",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  updateData() {
    return new Promise((resolve) => {
      this.runOnServer("updateData", {}, resolve);
    });
  },
  /* scope:server */
  $updateData(data, cb) {
    this.changeModelData(
      "Crm.modules.systemNotifications.model.systemNotificationsModel",
      "ins",
      {}
    );
    cb({ success: true });
  },

  /* scope:client */
  getLetterTemplate(code, lang) {
    return new Promise((resolve) => {
      this.runOnServer("getLetterTemplate", { code, lang }, resolve);
    });
  },

  /* scope:server */
  async $getLetterTemplate(data, cb) {
    let letter = await this.src.db
      .collection("letters")
      .findOne({ code: data.code, lang: data.lang });
    if (!letter) return cb({});
    return cb(letter);
  },

  /* scope:client */
  updateNotificationDeliveringStatus(data) {
    return new Promise((resolve) => {
      this.runOnServer("updateNotificationDeliveringStatus", data, resolve);
    });
  },

  /* scope:server */
  async $updateNotificationDeliveringStatus(data, cb) {
    await this.src.db.collection("system_notifications").update(
      {
        id: data.id
      },
      {
        $set: {
          mail_sent: data.sent
        }
      }
    );
  }
});
