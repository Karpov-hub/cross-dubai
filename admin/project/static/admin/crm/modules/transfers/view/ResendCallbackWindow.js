Ext.define("Crm.modules.transfers.view.ResendCallbackWindow", {
  extend: "Ext.window.Window",

  autoShow: true,
  modal: true,

  title: D.t("Resend Callback"),

  layout: "fit",
  width: 500,
  height: 140,

  initComponent() {
    this.items = this.buildItems();
    this.buttons = this.buildButtons();

    this.model = Ext.create("Crm.modules.transfers.model.TransfersModel");

    this.callParent(arguments);
  },

  buildItems() {
    return {
      xtype: "form",
      layout: "anchor",
      padding: 5,
      defaults: {
        xtype: "fieldset",
        anchor: "100%",
        defaults: {
          xtype: "textfield",
          anchor: "100%",
          defaults: {
            xtype: "textfield"
          }
        }
      },
      items: [
        {
          xtype: "textfield",
          anchor: "100%",
          fieldLabel: D.t("Hash ID"),
          name: "hash_id",
          flex: 1,
          allowBlank: false
        },
        Ext.create("Crm.modules.currency.view.CurrencyCombo", {
          name: "currency",
          fieldLabel: D.t("Currency"),
          allowBlank: false
        })
      ]
    };
  },

  buildButtons() {
    return [
      {
        text: D.t("Send"),
        handler: () => {
          this.resendCallback();
        }
      },
      {
        text: D.t("Cancel"),
        handler: () => {
          this.close();
        }
      }
    ];
  },

  async resendCallback() {
    const values = this.down("form").getValues();
    const realm_id = await this.model.getDefaultRealm();

    for (const item in values) {
      if (!values[item]) return D.a("Error", "Please fill all fields");
    }

    await this.model.callApi(
      "ccoin-service",
      "resendCallback",
      values,
      realm_id
    );

    this.callback();
    this.close();
  }
});
