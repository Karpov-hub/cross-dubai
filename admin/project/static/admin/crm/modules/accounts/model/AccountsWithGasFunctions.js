Ext.define("Crm.modules.accounts.model.AccountsWithGasFunctions", {
  /* scope:client */
  saveAccStatus(data) {
    return new Promise((resolve) => {
      this.runOnServer("saveAccStatus", data, resolve);
    });
  },

  /* scope:client */
  updateWalletType(data) {
    return new Promise((resolve) => {
      this.runOnServer("updateWalletType", data, resolve);
    });
  },

  /* scope:server */
  async $updateWalletType(data, cb) {
    await this.src.db
      .collection("account_crypto")
      .update(
        { address: data.address },
        { $set: { wallet_type: data.wallet_type } }
      );
    return cb(true);
  },

  /* scope:server */
  async $saveAccStatus(data, cb) {
    await this.src.db
      .collection("accounts")
      .update({ id: { $in: data.ids } }, { $set: { status: data.status } });
    this.updateGridData();
    return cb({ success: true });
  },

  /* scope:server */
  updateGridData() {
    return;
  },

  /* scope:client */
  saveMemo(data) {
    return new Promise((resolve) => {
      this.runOnServer("saveMemo", data, resolve);
    });
  },

  /* scope:server */
  async $saveMemo(data, cb) {
    const uuid = require("uuid/v4");
    if (data.id) {
      await this.src.db
        .collection("users_memo")
        .update(
          { id: data.id },
          { $set: { ref_id: data.ref_id, memo: data.memo } }
        );
      return cb({ success: true });
    }
    data.id = uuid();
    await this.src.db.collection("users_memo").insert({
      id: data.id,
      ref_id: data.ref_id,
      memo: data.memo,
      maker: this.user.id
    });
    return cb({ success: true, id: data.id });
  },

  /* scope:client */
  getUserMemo(data) {
    return new Promise((resolve) => {
      this.runOnServer("getUserMemo", data, resolve);
    });
  },

  /* scope:server */
  async $getUserMemo(data, cb) {
    let result = await this.src.db.collection("users_memo").findOne(
      {
        maker: this.user.id,
        ref_id: data.id
      },
      { memo: 1, id: 1 }
    );
    return cb(result || {});
  },

  /* scope:client */
  getAccountsByAddress(data) {
    return new Promise((resolve) => {
      this.runOnServer(
        "getAccountsByAddress",
        { address: data.address },
        resolve
      );
    });
  },

  /* scope:server */
  async $getAccountsByAddress(data, cb) {
    let accounts = await this.src.db.query(
      `select
            a.id,
            a.acc_no,
            a.balance,
            a.currency,
            ac.address
        from accounts a
        inner join account_crypto ac
        on (ac.acc_no = a.acc_no)
        where ac.address = $1
        `,
      [data.address]
    );
    return cb(accounts);
  },

  /* scope:client */
  getWalletBalance(data) {
    return new Promise((resolve) => {
      this.runOnServer(
        "getWalletBalance",
        { accounts: data.accounts },
        resolve
      );
    });
  },

  /* scope:server */
  async $getWalletBalance(data, cb) {
    let result = await this.callApi({
      service: "ccoin-service",
      method: "getWalletsBalances",
      data: {
        accounts: data.accounts
      }
    });

    return cb(result);
  },

  /* scope:client */
  getAndSumWalletBalance(data) {
    return new Promise((resolve) => {
      this.runOnServer("getAndSumWalletBalance", data, resolve);
    });
  },

  /* scope:server */
  async $getAndSumWalletBalance(data, cb) {
    const { result } = await this.callApi({
      service: "ccoin-service",
      method: "getAndSumWalletBalances",
      data: {
        wallet_type:
          parseInt(data.walletType) !== NaN ? parseInt(data.walletType) : null,
        merchant_id: data.merchantId
      }
    });

    return cb(result);
  }
});
