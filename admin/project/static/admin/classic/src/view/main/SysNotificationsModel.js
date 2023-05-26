Ext.define("Admin.view.main.SysNotificationsModel", {
  extend: "Ext.app.ViewModel",

  constructor() {
    this.callParent(arguments);
    this.subscribeToSystemNotifications();
  },

  subscribeToSystemNotifications() {
    if (!Glob.ws) {
      setTimeout(() => {
        this.subscribeToSystemNotifications();
      }, 1000);
      return;
    }
    const sysNotificationsModel = Ext.create(
      "Crm.modules.systemNotifications.model.systemNotificationsModel"
    );
    this.getSystemNotifications(sysNotificationsModel);
    setInterval(() => {
      this.getSystemNotifications(sysNotificationsModel);
    }, 1000);
  },

  async getSystemNotifications(model) {
    const res = await model.callApi(
      "auth-service",
      "getSystemNotifications",
      {}
    );
    this.set("notifications_count", res.notification_list.length);
    let notification_html_list = "<ul>";
    if (!res.notification_list.length)
      this.set("notification_html_list", "No new notifications");
    for (let notification of res.notification_list)
      notification_html_list += `<li>${notification.en}</li>`;
    notification_html_list += "</ul>";
    this.set("notification_html_list", notification_html_list);
    this._view
      .down("[name=notification_window]")
      .setData(notification_html_list);
  }
});
