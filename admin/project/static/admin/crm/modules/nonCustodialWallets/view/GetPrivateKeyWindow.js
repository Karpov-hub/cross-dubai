Ext.define("Crm.modules.nonCustodialWallets.view.GetPrivateKeyWindow", {
  extend: "Ext.window.Window",

  autoShow: true,
  modal: true,
  closable: false,
  resizable: !Ext.platformTags.phone,
  draggable: !Ext.platformTags.phone,

  title: D.t("Share private key"),

  layout: "fit",

  width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 650,
  height: Ext.platformTags.phone ? Ext.Element.getViewportHeight() : 300,

  initComponent() {
    this.items = this.buildItems();
    this.buttons = this.buildButtons();

    this.model = Ext.create(
      "Crm.modules.nonCustodialWallets.model.WalletsModel"
    );

    this.callParent(arguments);
  },

  buildItems() {
    const address = Ext.create("Ext.form.field.Text", {
      readOnly: true,
      name: "address",
      fieldLabel: D.t("Address"),
      value: this.wallet.address
    });
    const wallet_id = Ext.create("Ext.form.field.Text", {
      hidden: true,
      name: "wallet_id",
      value: this.wallet.id
    });

    let me = this;

    return {
      xtype: "form",
      layout: "anchor",
      padding: 5,
      defaults: {
        xtype: "fieldset",
        anchor: "100%",
        labelAlign: Ext.platformTags.phone ? "top" : "left"
      },
      items: [
        wallet_id,
        {
          xtype: "textfield",
          anchor: "100%",
          fieldLabel: D.t("Email"),
          readOnly: true,
          value: me.email,
          name: "email",
          flex: 1,
          allowBlank: false
        },
        address,
        {
          xtype: "textarea",
          region: "center",
          name: "part_private_key",
          anchor: "100%",
          style: "background:#ffffff",
          fieldLabel: D.t("First part of PK"),
          readOnly: true
        }
      ]
    };
  },

  buildButtons() {
    return [
      {
        text: D.t("Share private key"),
        action: "share_pk",
        handler: () => {
          this.getPrivateKey();
        }
      },
      {
        text: D.t("Close"),
        handler: () => {
          if (!!this.down("[name=part_private_key]").getValue()) {
            this.buildWarning(
              D.t("Have you copied the private key?"),
              (result) => {
                if (result === "ok") {
                  this.close();
                }
              }
            );
          } else {
            this.close();
          }
        }
      }
    ];
  },

  buildWarning(message, cb) {
    Ext.Msg.show({
      title: D.t("Warning"),
      message,
      buttons: Ext.Msg.OKCANCEL,
      icon: Ext.Msg.WARNING,
      fn: cb
    });
  },

  async getPrivateKey() {
    this.down("[action=share_pk]").setDisabled(true);
    const data = this.down("form").getValues();

    const sendData = {
      wallet_id: data.wallet_id,
      email: data.email
    };

    const result = await this.model.callApi(
      "ccoin-service",
      "getWalletPrivateKey",
      sendData
    );

    if (result.error) {
      this.down("[action=share_pk]").setDisabled(false);
      return D.a(D.t("Error"), JSON.stringify(result.error));
    }

    this.down("[name=part_private_key]").setValue(result.keyPart1);

    D.a(
      D.t("Success"),
      `${result.keyPart2}. If you didn't receive an email, be sure to check your spam.`
    );

    this.callback();
  }
});
