Ext.define("Crm.modules.accounts.view.AccountFormationFormController", {
  extend: "Core.form.FormController",

  async setControls() {
    this.control({
      "[name=currency]": {
        change: (el, v) => {
          if (
            el.lastSelection &&
            el.lastSelection[0] &&
            el.lastSelection[0].data &&
            !el.lastSelection[0].data.crypto
          )
            return this.view.down("[name=address]").setDisabled(true);
          return this.view.down("[name=address]").setDisabled(false);
        }
      },
      "[action=about_address]": {
        click: () => {
          this.openAboutAddrWindow();
        }
      }
    });

    let currencies = await this.model.getCurrrencies();
    this.view
      .down("[name=currency]")
      .setStore({ fields: ["abbr", "crypto"], data: currencies });
    this.callParent(arguments);
  },

  setValues(data) {
    if (
      this.view.currentData &&
      (this.view.currentData.merchant_id || this.view.currentData.wallet_type)
    )
      return;
    if (!data.hasOwnProperty("wallet_type") || isNaN(Number(data.wallet_type)))
      data.wallet_type = 0;
    this.callParent(arguments);
  },

  updateButtonsDisabling(disable) {
    this.view.down("[action=save]").setDisabled(disable);
  },

  async checkAddressExist(data) {
    const currency = this.view.down("[name=currency]");

    if (
      currency.lastSelection &&
      currency.lastSelection[0] &&
      currency.lastSelection[0].data &&
      currency.lastSelection[0].data.crypto
    ) {
      this.currencyModel = Ext.create(
        "Crm.modules.accounts.model.AccountsModel"
      );
      const res = await this.currencyModel.callApi(
        "ccoin-service",
        "checkAddressExist",
        {
          currency: data.currency,
          address: data.address
        }
      );

      return res.isExist;
    }

    return true;
  },

  async save(closewin) {
    this.updateButtonsDisabling(true);

    const form_data = this.view
      .down("form")
      .getForm()
      .getValues();

    if (form_data.address) {
      const addressExist = await this.checkAddressExist(form_data);

      if (!addressExist) {
        this.updateButtonsDisabling(false);
        return Ext.toast(D.t("You cannot add this address"));
      }
    }

    form_data.init_currency = form_data.currency;

    const res = await this.model.createAccounts(form_data);

    this.updateButtonsDisabling(false);

    if (res.error == "ADDRESS_VALIDATION_ERROR") {
      return Ext.toast(D.t("Invalid address"));
    }

    if (res.error == "MERCHANT_ADDRESS_LINK_ERROR") {
      return Ext.toast(
        D.t("Address is linked to another merchant and cannot be added")
      );
    }

    if (res.error == "UNKNOWN") {
      return Ext.toast(D.t("Something went wrong"));
    }

    if (!res.count) {
      return Ext.toast(D.t("Account(s) with entered address already exist"));
    } else {
      Ext.toast(D.t("Account(s) created"));
    }

    if (closewin) {
      this.view.close();
    }
  },

  openAboutAddrWindow() {
    return Ext.create("Crm.modules.accounts.view.AboutAddressesWindow");
  }
});
