Ext.define("Crm.modules.notifications.view.NotificationsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Notifications"),
  filterable: true,

  // controllerCls: "Crm.modules.notifications.view.NotificationsGridController",

  fields: [
    "id",
    "user_id",
    "sender_id",
    "sender",
    "message",
    "new",
    "ctime",
    "username"
  ],

  buildColumns: function() {
    return [
      {
        text: D.t("Receiver"),
        width: 300,
        sortable: true,
        dataIndex: "username",
        filter: true
      },
      {
        text: D.t("Message"),
        flex: 1,
        sortable: true,
        dataIndex: "message",
        filter: true
      }
    ];
  }
});
