Ext.define("Crm.modules.telegram.view.TelegramAppOTPWindow", {
  extend: "Ext.window.Window",

  autoShow: true,
  modal: true,
  closable: false,

  title: D.t("Verify phone"),

  layout: "fit",

  width: 450,
  height: 180,

  initComponent() {
    this.items = this.buildItems();
    this.buttons = this.buildButtons();

    this.model = Ext.create("Crm.modules.telegram.model.TelegramAppModel");

    this.callParent(arguments);
  },

  buildItems() {
    return {
      xtype: "form",
      layout: "anchor",
      padding: 5,
      defaults: {
        anchor: "100%",
        xtype: "textfield",
        labelWidth: 130,
        margin: 5
      },
      items: [
        {
          xtype: "textfield",
          name: "code",
          fieldLabel: D.t("OTP"),
          allowBlank: false
        },
        {
          xtype: "textfield",
          inputType: "password",
          name: "password",
          fieldLabel: D.t("Password")
        }
      ]
    };
  },

  buildButtons() {
    return [
      {
        text: D.t("Confirm"),
        action: "confirm_otp",
        handler: () => {
          this.ConfirmOTP();
        }
      },
      {
        text: D.t("Close"),
        handler: () => {
          this.close();
        }
      }
    ];
  },

  async ConfirmOTP() {
    const data = this.down("form").getValues();

    const sendData = {
      phone: this.authData.phone,
      code: data.code,
      password: data.password
    };

    if (!sendData.code) {
      return D.a(D.t("Error"), D.t("Please enter OTP"));
    }

    this.down("[action=confirm_otp]").setDisabled(true);

    const result = await this.model.callApi(
      "telegram-service",
      "verifyPhoneCode",
      sendData,
      null,
      this.authData.user_id
    );

    if (result.error) {
      return D.a(D.t("Error"), JSON.stringify(result.error));
    }
    this.callback();
    this.close();
  }
});
