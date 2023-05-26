Ext.define("Crm.modules.accounts.model.AccountsFunc", {
  /* scope:client */
  getMerchantAccounts(data) {
    return new Promise((resolve) => {
      this.runOnServer("getMerchantAccounts", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getMerchantAccounts(data, cb) {
    const where = {};

    if (!data.merchant_search_params.field) {
      return cb([]);
    }

    if (data.merchant_search_params.field == "client") {
      where.owner = data.merchant_search_params.value;
    }

    if (data.planCurrency) {
      where.currency = data.planCurrency;
    }

    if (data.merchant_search_params.field == "merchant") {
      const ids_of_merchant_accounts = await this.src.db
        .collection("merchant_accounts")
        .findAll(
          { id_merchant: data.merchant_search_params.value },
          { id_account: 1 }
        );

      if (ids_of_merchant_accounts && ids_of_merchant_accounts.length) {
        where.id = { $in: ids_of_merchant_accounts.map((el) => el.id_account) };
      }
    }

    where.wallet_type = 0;
    const accounts = await this.src.db
      .collection("vw_client_accs")
      .findAll(where, {
        acc_no: 1,
        balance: 1,
        currency: 1,
        acc_description: 1,
        acc_name: 1
      });

    return cb(accounts);
  },

  /* scope:client */
  getAddressBookByMerchant(data) {
    return new Promise((resolve) => {
      this.runOnServer("getAddressBookByMerchant", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getAddressBookByMerchant(data, cb) {
    let addresses = [];

    if (data.internalTransfer) {
      if (
        !data.client_search_params.field ||
        data.client_search_params.field != "client"
      ) {
        return cb([]);
      }

      addresses = await this.src.db.collection("vw_client_accs").findAll(
        {
          owner: data.client_search_params.value,
          currency: data.planCurrency,
          status: 1,
          removed: 0,
          wallet_type: 0
        },
        { crypto_address: 1, merchant_name: 1 }
      );
      addresses = addresses.filter((item) => item.crypto_address != null);
    } else {
      if (
        !data.client_search_params.field ||
        data.client_search_params.field != "client" ||
        !data.merchant_search_params.field ||
        data.merchant_search_params.field != "merchant"
      ) {
        return cb([]);
      }

      addresses = await this.src.db.collection("vw_org_wallets").findAll(
        {
          user_id: data.client_search_params.value,
          org: data.merchant_search_params.value,
          status: 1,
          removed: 0
        },
        {
          num: 1,
          name: 1
        }
      );

      addresses = await this._filterAddressesByCurrency(addresses, data);
    }

    const out = addresses.map((item) => {
      if (item.hasOwnProperty("crypto_address")) {
        return { address: item.crypto_address, name: item.merchant_name };
      }
      return { address: item.num, name: item.name };
    });

    return cb(out);
  },

  async _filterAddressesByCurrency(addresses, data) {
    const { result } = await this.callApi({
      service: "ccoin-service",
      method: "getValidAddressesForCurrency",
      data: {
        addresses: addresses.map((item) => item.num),
        currency: data.planCurrency
      }
    });

    const out = addresses.filter((item) => result.includes(item.num));

    return out;
  },

  /* scope:client */
  getMerchantAddresses(data) {
    return new Promise((resolve) => {
      this.runOnServer("getMerchantAddresses", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getMerchantAddresses(data, cb) {
    if (
      !data.merchant_search_params.field ||
      data.merchant_search_params.field != "merchant"
    ) {
      return cb([]);
    }

    let addresses = await this.src.db.collection("vw_client_accs").findAll(
      {
        merchant_id: data.merchant_search_params.value,
        currency: data.planCurrency,
        status: 1,
        removed: 0,
        wallet_type: 0
      },
      { crypto_address: 1 }
    );

    addresses = addresses.filter((item) => item.crypto_address != null);

    const out = addresses.map((item) => {
      return { address: item.crypto_address };
    });

    return cb(out);
  },

  /* scope:client */
  getInnerClientAddresses(data) {
    return new Promise((resolve) => {
      this.runOnServer("getInnerClientAddresses", data, resolve);
    });
  },

  /* scope:server */
  async $getInnerClientAddresses(data, cb) {
    let addresses = await this.src.db.collection("vw_client_accs").findAll(
      {
        owner_is_inner_client: true,
        currency: data.planCurrency,
        status: 1,
        removed: 0,
        wallet_type: 0
      },
      { crypto_address: 1 }
    );
    addresses = addresses.filter((item) => item.crypto_address != null);
    const out = addresses.map((item) => {
      return { address: item.crypto_address };
    });
    return cb(out);
  }
});
