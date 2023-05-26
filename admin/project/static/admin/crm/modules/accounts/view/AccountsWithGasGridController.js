Ext.define("Crm.modules.accounts.view.AccountsWithGasGridController", {
  extend: "Core.grid.GridController",

  setControls: async function() {
    this.control({
      "[action=sum_up]": {
        click: () => {
          this.sumUpUSDT();
        }
      },
      "[action=copy_balance]": {
        click: () => {
          this.copyBalanceToClipboard();
        }
      }
    });

    this.view.on("getWalletbalance", (grid, rowIdx, record) => {
      this.getWalletbalance(grid, rowIdx, record);
    });

    this.view.on("sharePrivateKey", (grid, indx) => {
      this.getPrivateKeyForm(grid.getStore().getAt(indx));
    });

    if (this.view.observe && this.view.observe.length == 2) {
      let columns = this.view.columns;
      columns[6].hidden = true;
    }
    this.sortersCombo();
    this.callParent(arguments);
  },

  async getPrivateKeyForm(data) {
    const email = await this.model.callServerMethod("getClientEmail", data.data);
    Ext.create("Crm.modules.nonCustodialWallets.view.GetPrivateKeyWindow", {
      scope: this.view,
      wallet: data.data,
      email
    });
  },

  sortersCombo() {
    this.view.store.setSorters({ property: "status", direction: "ASC" });
  },

  addRecord() {
    let form = Ext.create("Crm.modules.accounts.view.AccountFormationForm", {
      noHash: true
    });
    form.controller.setValues({
      merchant_id: this.view.ownerCt.ownerCt.ownerCt.ownerCt.ownerCt.currentData
        .id,
      wallet_type: this.view.observeObject.wallet_type
    });
    return form.show();
  },

  gotoRecordHash: async function(data) {
    if (!!this.view.observeObject) {
      window.__CB_REC__ = this.view.observeObject;
    }
    let wallet_ids;
    if (data.address) wallet_ids = await this.model.getWalletIds(data);
    let tg_title = `${data.merchant_name} ${data.address.slice(
      0,
      3
    )}*${data.address.substr(data.address.length - 3)}`;
    Ext.create(this.generateDetailsCls(), {
      noHash: true,
      recordId: data[this.view.model.idField],
      wallet_ids,
      user_id: data.owner_id,
      tg_title
    });
  },

  async getWalletbalance(grid, rowIdx, record) {
    const mask = new Ext.LoadMask({
      msg: D.t("Loading..."),
      target: this.view
    });

    mask.show();

    const accounts = [
      {
        address: record.data.address,
        currency: record.data.currency
      }
    ];

    if (record.data.gas_currency) {
      accounts.push({
        address: record.data.address,
        currency: record.data.gas_currency
      });
    }

    let balances = await this.model.getWalletBalance({
      accounts
    });

    if (balances.error && balances.error === "BLOCKCHAIN_UNAVAILABLE") {
      mask.hide();
      return D.a("Error", "Blockchain currently unavailable.");
    }

    balances = balances.result;

    balances = balances.reduce(
      (out, val) =>
        Object.assign({ [val.currency]: val.crypto_wallet_balance }, out),
      {}
    );
    record.set("crypto_balance", balances[record.data.currency]);
    record.set("gas_balance", balances[record.data.gas_currency]);

    mask.hide();
  },

  async sumUpUSDT() {
    const sumUpBtn = this.view.down("[action=sum_up]");
    sumUpBtn.setDisabled(true);
    Ext.toast(D.t("Sum up USDT requested"));

    const walletType = this.view.observeObject.wallet_type || null;
    const merchantId = this.view.scope.currentData.id;

    const result = await this.model.getAndSumWalletBalance({
      walletType,
      merchantId
    });

    const totalBalanceCmp = this.view.down("[name=total_balance]");
    const copyBalanceBtn = this.view.down("[action=copy_balance]");

    totalBalanceCmp.setValue(result.total_balance);
    totalBalanceCmp.setHidden(false);
    copyBalanceBtn.setHidden(false);
    sumUpBtn.setDisabled(false);
  },

  copyBalanceToClipboard() {
    const balance = this.view.down("[name=total_balance]").getValue();
    navigator.clipboard.writeText(balance);
    return Ext.toast(D.t("Sum up USDT copied to clipboard"));
  }
});
