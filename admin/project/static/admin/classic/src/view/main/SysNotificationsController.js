Ext.define("Admin.view.main.SysNotificationsController", {
  extend: "Ext.app.ViewController",
  alias: "controller.sysnotificationscontroller",

  init() {
    this.control = this.setControls();
    this.callParent(arguments);
  },

  setControls() {
    document.addEventListener("click", (event) => {
      let notification_window = this.view.down("[name=notification_window]");
      let notification_window_dom_el = notification_window.getEl();
      if (
        notification_window_dom_el &&
        !notification_window_dom_el.contains(event.target)
      ) {
        notification_window.setVisible(false);
      }
    });
  }
});
