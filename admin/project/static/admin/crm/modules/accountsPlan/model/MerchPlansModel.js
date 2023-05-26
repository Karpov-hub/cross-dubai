Ext.define("Crm.modules.accountsPlan.model.MerchPlansModel", {
  extend: "Crm.classes.DataModel",

  mixins: ["Crm.modules.currency.model.CurrencyFunc"],

  collection: "accounts_plans_merchants",
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "plan_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "accounts_plans",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1,
          items: 1
        }
      }
    },
    {
      name: "merchant_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "make_accounts",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "items",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  getBalance(acc_no) {
    return new Promise((res) => {
      this.runOnServer("getBalance", { acc_no }, (r) => {
        res(r.balance);
      });
    });
  },

  /* scope:server */
  async $getBalance(data, cb) {
    const r = await this.src.db
      .collection("accounts")
      .findOne({ acc_no: data.acc_no }, { balance: 1, currency: 1 });

    const currencyList = await this.getCurrencyList();

    r.balance = await this.roundCurrency({
      currency: r.currency,
      balance: r.balance,
      currencyList
    });

    cb(r);
  },

  /* scope:client */
  async calculateAmount(data) {
    let realm_id = await this.getDefaultRealm();
    return await this.callApi(
      "account-service",
      "precalculateAmount",
      data,
      realm_id
    );
  },

  /* scope:client */
  savePaymentForApproving(data) {
    return new Promise((resolve) => {
      this.runOnServer("savePaymentForApproving", data, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:client */
  validateCryptoAccounts(data) {
    return new Promise((resolve) => {
      this.runOnServer("validateCryptoAccounts", data, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $validateCryptoAccounts(data, cb) {
    let addresses_curr_1 = [];
    let addresses_curr_2 = [];
    let crypto_currencies = await this.src.db
      .collection("currency")
      .findAll(
        { crypto: true, abbr: { $in: [data.currency, data.currency_result] } },
        { abbr: 1 }
      );

    if (!crypto_currencies.length) {
      return cb({ valid: true });
    }

    let res1;
    let res2;
    currency = data.currency;
    currency_result = data.currency_result;

    if (
      crypto_currencies.find((el) => {
        return el.abbr == data.currency;
      })
    ) {
      for (let variable of data.variables) {
        if (
          variable.key.includes(`${data.currency}_ADDR`) ||
          variable.key.includes(`EXTERNAL_${data.currency}`)
        ) {
          addresses_curr_1.push(variable.value);
        }
      }
      if (addresses_curr_1.length)
        res1 = await this.callApi({
          service: "ccoin-service",
          method: "validateAddresses",
          data: {
            addresses: addresses_curr_1,
            currency
          }
        });
    }
    if (
      crypto_currencies.find((el) => {
        return el.abbr == data.currency_result;
      })
    ) {
      for (let variable of data.variables) {
        if (
          variable.key.includes(`${data.currency_result}_ADDR`) ||
          variable.key.includes(`EXTERNAL_${data.currency_result}`)
        ) {
          addresses_curr_2.push(variable.value);
        }
      }
      if (addresses_curr_2.length)
        res2 = await this.callApi({
          service: "ccoin-service",
          method: "validateAddresses",
          data: {
            addresses: addresses_curr_2,
            currency_result
          }
        });
    }
    if (!addresses_curr_1.length && !addresses_curr_2.length)
      return cb({ valid: true });

    if (!res1 && res2) {
      return cb({ valid: res2 && res2.result ? res2.result.valid : false });
    }
    if (res1 && !res2) {
      return cb({ valid: res1 && res1.result ? res1.result.valid : false });
    }
    if (res1 && res2) {
      return cb({
        valid:
          res1 && res1.result && res2 && res2.result
            ? res1.result.valid && res2.result.valid
            : false
      });
    }
    return cb({ valid: false });
  },

  /* scope:client */
  async getCoinexExchangeRate(data) {
    return await this.callApi("ccoin-service", "getCoinexExchangeRate", data);
  },

  /* scope:client */
  async getSwapLimits() {
    const result = await this.callApi("ccoin-service", "getSwapLimits", {});
    return result.currency_limits_list || [];
  },

  /* scope:client */
  getAddressFromBook(data) {
    return new Promise((resolve) => {
      this.runOnServer("getAddressFromBook", data, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $getAddressFromBook(data, cb) {
    const cryptoWallet = await this.src.db
      .collection("crypto_wallets")
      .findOne({ num: data.receiverAddress }, { send_via_chain_required: 1 });

    return cb({ result: cryptoWallet });
  }
});
