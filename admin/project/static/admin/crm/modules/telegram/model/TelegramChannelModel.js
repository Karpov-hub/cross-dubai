Ext.define("Crm.modules.telegram.model.TelegramChannelModel", {
  extend: "Crm.classes.DataModel",

  collection: "telegram_channels",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "channel_id",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "ref_id",
      type: "ObjectID",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "join_link",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "telegram_app",
      type: "ObjectID",
      filterable: true,
      editable: false,
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
  ]
});
