Ext.define("Crm.modules.allAddresses.view.CheckAddressWindow", {
  extend: "Ext.window.Window",

  autoShow: true,
  modal: true,

  title: D.t("Check system address"),

  layout: "fit",
  width: 500,
  height: 180,

  initComponent() {
    this.items = this.buildItems();
    this.buttons = this.buildButtons();

    this.model = Ext.create("Crm.modules.allAddresses.model.AllAddressesModel");

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
          xtype: "fieldcontainer",
          layout: "hbox",
          items: [
            {
              xtype: "textfield",
              anchor: "100%",
              fieldLabel: D.t("Address"),
              name: "address",
              flex: 1,
              margin: "0 2 0 0"
            }
          ]
        }
      ]
    };
  },

  buildButtons() {
    return [
      {
        text: D.t("Check"),
        action: "check-address",
        handler: () => {
          this.checkAddress();
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

  async _getCurrencyByAddress(address) {
    let currencies = await this.model.callApi(
      "ccoin-service",
      "getValidCurrenciesForAddress",
      {
        address,
        check_address: true
      }
    );

    if (currencies && currencies.length > 1) {
      currencies = currencies.filter((item) => ["ETH", "TRX"].includes(item));
    }

    return currencies && currencies.length ? currencies[0] : null;
  },

  async checkAddress() {
    const mask = new Ext.LoadMask({
      msg: D.t("Checking..."),
      target: this
    });

    const address = this.down("[name=address]").getValue();
    if (!address) {
      return D.a("Error", "Please fill address");
    }

    const currency = await this._getCurrencyByAddress(address);
    if (!currency) {
      return D.a(
        "Error",
        "Text in the address field is not a supported blockchain address"
      );
    }

    mask.show();

    const checkAddressResult = await this.model.callApi(
      "ccoin-service",
      "checkAddressExist",
      {
        address,
        currency
      }
    );

    mask.hide();

    if (checkAddressResult.isExist) {
      return D.a(
        "Check result",
        "This is a system address, you can have access to its funds and operations."
      );
    } else if (checkAddressResult.isExist == false) {
      return D.a(
        "Check result",
        "This is not a system address. It is possible to integrate it to the system using its private key, contact your system administrator for this."
      );
    }

    return D.a("Check result", "Something went wrong.");
  }
});
