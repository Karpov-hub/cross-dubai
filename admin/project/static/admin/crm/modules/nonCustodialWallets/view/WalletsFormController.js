Ext.define("Crm.modules.nonCustodialWallets.view.WalletsFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=save]": {
        click: async () => {
          await this.saveWallet();
        }
      },
      "[name=user_id]": {
        change: async (e, v) => {
          this.setMerchantsByClient(v);
        }
      }
    });
    this.callParent(arguments);
  },

  async setValues(data) {
    if (data && data.user_id) {
      data.user_id = data.user_id.id;
      this.view.down("[name=user_id]").setReadOnly(true);
    }

    if (data && data.merchant_id) {
      data.merchant_id = data.merchant_id.id;
    }

    if (data && data.address) {
      this.view.down("[name=currency]").setReadOnly(true);
    }

    this.callParent(arguments);

    if (!data.user_id && data.merchant_id) {
      const clientId = await this.model.getClientByMerchant({
        merchant_id: data.merchant_id
      });
      this.view.down("[name=user_id]").setValue(clientId);
    }
  },

  async saveWallet() {
    const realm = await this.model.getDefaultRealm();
    const walletData = this.view.down("form").getValues();

    const sendData = {
      id: walletData.id,
      address: walletData.address,
      currency: walletData.currency,
      memo: walletData.memo,
      merchant_id: walletData.merchant_id
    };

    const result = await this.model.callApi(
      "ccoin-service",
      "createUpdateNonCustodialWallet",
      sendData,
      realm,
      walletData.user_id
    );

    if (result.error) {
      this.view.down("[action=save]").setReadOnly(false);
      return D.a(D.t("Error"), result.error);
    }

    await this.model.refreshData({ modelName: this.model.$className });

    this.closeView();
  },

  async setMerchantsByClient(client_id) {
    const merchantsCombo = this.view.down("[name=merchant_id]");

    if (!!merchantsCombo.getValue()) {
      const validMerchant = await this.model.checkClientMerchant({
        merchant_id: merchantsCombo.getValue(),
        client_id
      });

      if (!validMerchant) {
        merchantsCombo.setValue(null);
      }
    }

    merchantsCombo.setStore({
      fields: ["id", "name"],
      data: await this.model.getAllMerchantsByClient({ client_id })
    });

    this.view.down("[name=merchant_id]").setDisabled(false);
  }
});
