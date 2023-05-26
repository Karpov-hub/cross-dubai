Ext.define("Crm.modules.notifications.view.NotificationsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Notification - {username}",
  iconCls: "x-fa fa-list",

  controllerCls: "Crm.modules.notifications.view.NotificationsFormController",

  syncSize: function() {
    var width = Ext.Element.getViewportWidth(),
      height = Ext.Element.getViewportHeight();

    this.setSize(Math.floor(width * 0.25), Math.floor(height * 0.4));
    this.setXY([Math.floor(width * 0.05), Math.floor(height * 0.05)]);
  },
  formMargin: 0,

  buildItems: function() {
    return [
      {
        xtype: "panel",
        margin: { left: 10 },
        layout: "vbox",
        defaults: {
          xtype: "textfield",
          width: 430,
          labelWidth: 110
        },
        items: [
          {
            name: "id",
            hidden: true
          },
          {
            name: "user_id",
            hidden: true
          },
          {
            xtype: "textarea",
            region: "center",
            name: "message",
            style: "background:#ffffff",
            fieldLabel: D.t("Message")
          }
        ]
      }
    ];
  },
  buildButtons: function() {
    return [
      {
        text: D.t("Send"),
        iconCls: "x-fa fa-check-square",
        action: "send_notification"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
