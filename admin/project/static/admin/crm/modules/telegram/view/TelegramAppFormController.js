Ext.define("Crm.modules.telegram.view.TelegramAppFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=login]": {
        click: async () => {
          await this.telegramAuth();
        }
      },
      "[action=logout]": {
        click: async () => {
          await this.telegramLogout();
        }
      },
      "[name=active]": {
        change: (e, newVal, oldVal) => {
          let me = this;
          let app = me.view.down("form").getValues();
          this.model.runOnServer(
            "checkActiveApp",
            { recordAppId: app.id, userId: app.user_id },
            function(res) {
              if (res.result === true || oldVal === true) {
                return me.view.down("[name=active]").setValue(newVal);
              } else {
                return me.view.down("[name=active]").setValue(oldVal);
              }
            }
          );
        }
      }
    });
    this.callParent(arguments);
  },

  async setValues(data) {
    if (data.app_id) {
      this.view.down("[name=app_id]").setReadOnly(true);
      this.view.down("[name=api_hash]").setReadOnly(true);
      this.view.down("[name=phone]").setReadOnly(true);
    }

    if (data.app_id && !data.session) {
      this.view.down("[action=login]").setHidden(false);
      this.view.down("[action=logout]").setHidden(true);
    } else {
      this.view.down("[action=login]").setHidden(true);
      this.view.down("[action=logout]").setHidden(false);
    }

    this.callParent(arguments);
  },

  async telegramAuth() {
    const tgData = this.view.down("form").getValues();

    const sendData = {
      phone: tgData.phone,
      telegram_app: tgData.id,
      user_id: tgData.user_id
    };

    const result = await this.model.callApi(
      "telegram-service",
      "login",
      sendData
    );

    if (result.error) {
      return D.a(D.t("Error"), result.error);
    }

    Ext.create("Crm.modules.telegram.view.TelegramAppOTPWindow", {
      authData: sendData,
      callback: async (data) => {
        D.a(
          D.t("Success"),
          "Now you can create telegram channels for this client, and the system will send notifications to them"
        );
        this.view.down("[name=app_id]").setReadOnly(true);
        this.view.down("[name=api_hash]").setReadOnly(true);
        this.view.down("[name=phone]").setReadOnly(true);
        this.view.down("[action=login]").setHidden(true);
        this.view.down("[action=logout]").setHidden(false);
        this.view.down("[action=save]").setDisabled(true);
      }
    });
  },

  async telegramLogout() {
    const tgData = this.view.down("form").getValues();

    const result = await this.model.callApi(
      "telegram-service",
      "logout",
      {
        telegram_app: tgData.id
      },
      null,
      tgData.user_id
    );

    if (result.error) {
      return D.a(D.t("Error"), result.error);
    }

    this.view.down("[name=session]").setValue(null);
    this.view.down("[action=login]").setHidden(false);
    this.view.down("[action=logout]").setHidden(true);
  }
});
