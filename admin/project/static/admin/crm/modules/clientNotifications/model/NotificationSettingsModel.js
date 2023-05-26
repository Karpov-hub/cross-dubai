Ext.define("Crm.modules.clientNotifications.model.NotificationSettingsModel", {
  extend: "Crm.classes.DataModel",

  collection: "user_notification_settings",
  idField: "id",
  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "notification_settings",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    }
  ]
});
