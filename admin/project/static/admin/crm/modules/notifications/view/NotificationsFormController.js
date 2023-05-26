Ext.define("Crm.modules.notifications.view.NotificationsFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=send_notification]": {
        click: (el, v) => {
          this.send();
        }
      },
      "[action=formclose]": {
        click: (el, v) => {
          window.history.back();
        }
      }
    });
    this.callParent(arguments);
  },

  async send() {
    const formdata = this.view.down("form").getValues();
    let data = {
      user_id: this.view.currentData.user_id,
      message: formdata.message
    };

    const res = await this.model.callApi(
      "support-service",
      "sendNotification",
      data,
      data.realm_id,
      localStorage.uid
    );
    if (res.success == true) window.history.back();
  }
});
