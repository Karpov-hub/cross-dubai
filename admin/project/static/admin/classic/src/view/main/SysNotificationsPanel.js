Ext.define("Admin.view.main.SysNotificationsPanel", {
  extend: "Ext.panel.Panel",
  xtype: "system_notifications_panel",

  viewModel: Ext.create("Admin.view.main.SysNotificationsModel"),

  requires: ["Admin.view.main.SysNotificationsController"],
  controller: "sysnotificationscontroller",

  layout: "anchor",
  margin: "0 5 0 5",
  bodyPadding: 0,

  initComponent() {
    this.items = this.buildItems();
    this.callParent(arguments);
  },

  buildItems() {
    return [
      Ext.platformTags.phone ? this.mobileButton() : this.desktopButton(),
      this.buildNotificationWindow()
    ];
  },

  buildNotificationWindow() {
    return {
      xtype: "panel",
      layout: "anchor",
      title: D.t("System notifications"),
      name: "notification_window",
      padding: "0 8 0 0",
      hidden: true,
      floating: true,
      modal: true,
      resizable:false,
      closable: false,
      draggable: !Ext.platformTags.phone,
      closable: true,
      closeAction: "hide",
      width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 400,
      height: Ext.platformTags.phone ? Ext.Element.getViewportHeight() : 300,
      bind: {
        html: "{notification_html_list}"
      }
    };
  },

  mobileButton() {
    return {
      xtype: "button",
      iconCls: "x-fa fa-bell",
      padding:2,
      margin:0,
      bind: {
        text: "{notifications_count}"
      },
      handler: (el) => {
        let notification_window = Ext.create(
          "Ext.window.Window",
          this.buildNotificationWindow()
        );
        notification_window.show();
        notification_window.setData(this.viewModel.data.notification_html_list);
      }
    };
  },

  desktopButton() {
    return {
      tooltip: D.t("Show system notifications"),
      xtype: "button",
      iconCls: "x-fa fa-bell",
      cls: "topbar-button",
      bind: {
        text: "{notifications_count}"
      },
      handler: function(el) {
        el.ownerCt
          .down("[name=notification_window]")
          .showBy(this, "b", [-300, 0]);
      }
    };
  }
});
