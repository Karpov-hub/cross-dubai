Ext.define("Crm.modules.wallets.view.WalletsFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=bindingHeader]": {
        async headerclick(grid, col, e, t) {
          await this.allowAllBinding();
        }
      },
      "[action=check_and_apply]": {
        click: async () => {
          await this.checkAndSaveAddress(false, () => {});
        }
      },
      "[action=check_and_save]": {
        click: async () => {
          await this.checkAndSaveAddress(true, () => {});
        }
      }
    });

    this.view.on("beforesave", (el, data) => {
      this.prepareDataBeforeSave(data);
    });

    this.callParent(arguments);
  },

  async allowAllBinding() {
    const walletAccess = this.view.down("[name=walletAccess]");
    let walletAccessData = walletAccess.getValue();
    let notAllYES = false;
    for (let binding of walletAccessData) {
      if (!binding.activeWallet) notAllYES = true;
    }
    for (let binding of walletAccessData) {
      binding.activeWallet = notAllYES;
    }
    walletAccess.setValue(walletAccessData);
  },

  prepareDataBeforeSave(data) {
    let out = [];

    data.wallet_id = data.id;
    data.status = data.status == "on" ? 1 : 0;
    data.send_via_chain_required =
      data.send_via_chain_required == "on" ? true : false;

    data.walletAccess.forEach((rec) => {
      if (rec.activeWallet) {
        out.push(rec.id);
      }
    });
    data.walletAccess = out;
  },

  async setValues(data) {
    if (!data.num) {
      data.status = true;
    }

    this.callParent(arguments);

    const walletData = await this.model.callApi(
      "account-service",
      "getWalletDataFromAddressBook",
      {
        wallet_id: data.id
      },
      null,
      data.user_id
    );

    if (!walletData || !walletData.merchants || !walletData.merchants.length) {
      this.callParent(arguments);
    }

    const walletAccess = this.view.down("[name=walletAccess]");

    walletAccess.setLoading(true);
    walletData.merchants.sort((a, b) => {
      return a.name > b.name ? 1 : -1;
    });
    walletAccess.setValue(walletData.merchants);
    walletAccess.setLoading(false);
  },

  buildWarning(message, cb) {
    Ext.Msg.show({
      title: D.t("Confirm action"),
      message,
      buttons: Ext.Msg.OKCANCEL,
      icon: Ext.Msg.WARNING,
      fn: cb
    });
  },

  async _validateAddress(address) {
    const currencies = await this.model.callApi(
      "ccoin-service",
      "getValidCurrenciesForAddress",
      {
        address
      }
    );

    if (currencies && currencies.length) return true;

    return false;
  },

  async checkAndSaveAddress(closeWin, cb) {
    const formData = this.view
      .down("form")
      .getForm()
      .getValues();

    if (!(await this._validateAddress(formData.num))) {
      return cb(
        D.a(
          "Error",
          "Text in the address field is not a supported blockchain address"
        )
      );
    }

    if (formData.walletAccess && formData.walletAccess.length) {
      let showWarning = true;

      for (const wa of formData.walletAccess) {
        if (wa.activeWallet) showWarning = false;
      }

      if (formData.status == "on" && showWarning) {
        this.buildWarning(
          "This recipient will not be available for selection on the transfer form of any merchant",
          (action) => {
            if (action === "ok") {
              this.save(closeWin, cb);
            }
          }
        );
      } else {
        this.save(closeWin, cb);
      }
    } else {
      this.save(closeWin, cb);
    }
  }
});
