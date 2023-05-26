Ext.define("Crm.modules.telegram.view.TelegramAppGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=learn_more]": {
        click: () => {
          this.openLearnMoreWindow();
        }
      }
    });

    this.view.on("loginTelegram", (grid, indx) => {
      this.telegramOTPForm(grid.getStore().getAt(indx));
    });

    this.callParent(arguments);
  },

  async telegramOTPForm(data) {
    const sendData = {
      phone: data.data.phone,
      telegram_app: data.data.id
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
      authData: sendData
    });
  },

  openLearnMoreWindow() {
    return Ext.create("Crm.modules.telegram.view.LearnMoreWindow");
  }
});
