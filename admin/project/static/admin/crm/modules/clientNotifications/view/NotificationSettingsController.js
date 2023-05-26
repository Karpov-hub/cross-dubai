Ext.define(
  "Crm.modules.clientNotifications.view.NotificationSettingsController",
  {
    extend: "Core.form.FormController",

    setControls() {
      this.view.on("edit", async (el, ctx) => {
        await this.updateUserNotificationSettings(ctx);
      });
      this.control({
        "[action=refresh]": {
          click: async () => {
            await this.loadGridData();
          }
        }
      });
    },

    originalData: "",
    user_id: null,

    async updateUserNotificationSettings(ctx) {
      let settings = ctx.grid
        .getStore()
        .getData()
        .items.map((el) => el.data);

      if (this.stringifyArray(settings) == this.originalData) return;
      let notification_settings = await this.model.callApi(
        "mail-service",
        "updateNotificationEvents",
        { settings },
        null,
        this.view.down("[name=user_id]").getValue()
      );
      this.originalData = this.stringifyArray(settings);
      return notification_settings;
    },

    async loadGridData(user_id) {
      user_id = user_id ? user_id : this.user_id;
      let user_settings = await this.getUserNotificationSettings({
        user_id
      });
      this.view.down("[name=notification_settings_panel]").setStore({
        fields: ["subject", "code", "channels"],
        data: user_settings.settings
      });
      this.originalData = this.stringifyArray(user_settings.settings);
    },

    async setValues(data) {
      if (data.user_id) {
        this.view.down("[name=user_id]").setValue(data.user_id);
        this.user_id = data.user_id;
        await this.loadGridData(data.user_id);
      }
      return data;
    },

    stringifyArray(arr) {
      let copied_arr = Ext.Array.clone(arr);
      for (let i = 0; i < copied_arr.length; i++)
        copied_arr[i] = JSON.stringify(copied_arr[i]);
      return copied_arr.toString();
    },

    async getUserNotificationSettings(data) {
      let notification_settings = await this.model.callApi(
        "mail-service",
        "getNotificationEvents",
        {},
        null,
        data.user_id
      );
      return notification_settings;
    }
  }
);
