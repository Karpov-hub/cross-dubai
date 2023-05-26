Ext.define("Crm.modules.notifications.model.NotificationsModel", {
  extend: "Crm.classes.DataModel",

  collection: "notifications",
  idField: "id",

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
      editable: false,
      visible: true
    },
    {
      name: "sender_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "sender",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "message",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "new",
      type: "integer",
      sort: 1,
      filterable: true,
      editable: false,
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

  async afterGetData(data, callback) {
    if (!data || !data.length) return callback(data);

    const users_id = data.map((item) => item.user_id);
    if (!users_id || !users_id.length) return callback(data);

    const res = await this.src.db
      .collection("users")
      .findAll({ id: { $in: users_id } }, {});

    for (user of res) {
      data = data.map((item) => {
        if (item.user_id == user.id)
          item.username = user.first_name + " " + user.last_name;
        return item;
      });
    }

    callback(data);
  }
});
