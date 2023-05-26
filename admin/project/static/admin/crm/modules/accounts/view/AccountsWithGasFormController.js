Ext.define("Crm.modules.accounts.view.AccountsWithGasFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=apply]": {
        click: () => {
          this.saveFormData();
        }
      },
      "[action=formclose]": {
        click: () => {
          this.closeView(true);
        }
      },
      "[action=copy_address_to_clipboard]": {
        click: () => {
          this.copyAddressToClipboard();
        }
      }
    });
  },

  async saveFormData() {
    const data = this.view
      .down("form")
      .getForm()
      .getValues();

    await this.saveMemo(data);
    await this.saveAccountData(data);

    if (!data.wallet_type) {
      data.wallet_type = 0;
    }

    await this.saveWalletType(data);
    Ext.toast(D.t("Data saved"));
  },

  async saveWalletType(data) {
    await this.model.updateWalletType({
      address: data.address,
      wallet_type: data.wallet_type
    });
  },

  async saveAccountData(data) {
    const accounts_store = this.view
      .down("[name=accounts_gridpanel]")
      .getStore()
      .getData();
    const accounts_ids = accounts_store.items.map((el) => el.data.id);

    if (!accounts_ids || !accounts_ids.length) return;

    await this.model.saveAccStatus({
      ids: accounts_ids,
      status: data.status
    });
    return;
  },

  async saveMemo(data) {
    const result = await this.model.saveMemo({
      id: data.user_memo_id,
      memo: data.user_memo,
      ref_id: data.gas_acc_id ? data.gas_acc_id : data.id
    });

    if (result && result.id) {
      this.view.down("[name=user_memo_id]").setValue(result.id);
    }

    return;
  },

  async setAccountsStore(data) {
    let accounts = [];

    let columns = this.view.down("[name=accounts_gridpanel]").initialConfig
      .columns;
    if (data.address) {
      accounts = await this.model.getAccountsByAddress({
        address: data.address
      });
      columns[2].hidden = true;
    } else {
      accounts.push(data);
      columns[3].hidden = true;
    }
    this.view.down("[name=accounts_gridpanel]").reconfigure(null, columns);

    this.view
      .down("[name=accounts_gridpanel]")
      .getStore()
      .setData(accounts);

    return;
  },

  async setWalletsDataInAccountsGrid() {
    let accounts = this.view
      .down("[name=accounts_gridpanel]")
      .getStore()
      .getData();

    accounts = accounts.items.map((el) => ({
      id: el.data.id,
      acc_no: el.data.acc_no,
      balance: el.data.balance,
      currency: el.data.currency,
      address: el.data.address
    }));

    let wallets_data = await this.model.getWalletBalance({ accounts });

    if (wallets_data.error) return;

    wallets_data = wallets_data.result;

    for (const account of accounts) {
      const wallet_item = wallets_data.find((el) => {
        return el.id == account.id;
      });
      if (wallet_item) {
        account.crypto_wallet_balance = wallet_item.crypto_wallet_balance;
      }
    }

    this.view
      .down("[name=accounts_gridpanel]")
      .getStore()
      .setData(accounts);
  },

  async setValues(data) {
    const user_memo = await this.model.getUserMemo({
      id: data.gas_acc_id ? data.gas_acc_id : data.id
    });

    data.user_memo = user_memo.memo;
    data.user_memo_id = user_memo.id;

    if (data.address) {
      this.view.down("[name=address_panel]").setVisible(true);
    }

    await this.setAccountsStore(data);

    this.callParent(arguments);

    this.setWalletsDataInAccountsGrid();

    const profile = await this.model.callServerMethod("getAdminProfile");
    this.view
      .down("[name=status]")
      .setReadOnly(
        profile.other_configs
          ? !profile.other_configs.can_change_wallet_status
          : true
      );
  },

  copyAddressToClipboard() {
    const address = this.view.down("[name=address]").getValue();
    if (!address) {
      return Ext.toast(D.t("Nothing to copy"));
    }
    navigator.clipboard.writeText(address);
    return Ext.toast(D.t("Address copied to clipboard"));
  }
});
