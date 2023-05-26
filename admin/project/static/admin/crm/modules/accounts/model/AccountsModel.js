Ext.define("Crm.modules.accounts.model.AccountsModel", {
  extend: "Crm.classes.DataModel",

  collection: "accounts",
  idField: "id",
  //removeAction: "remove",

  mixins: ["Crm.modules.currency.model.CurrencyFunc"],

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "status",
      type: "int",
      sort: 1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "acc_no",
      sort: 1,
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "acc_name",
      sort: 1,
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "owner",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "overdraft",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "balance",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "currency",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: false,
      visible: true
    },

    {
      name: "negative",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },

    {
      name: "on_top",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "merchant_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "acc_description",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "legalname",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "crypto_address",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  async afterGetData(data, callback) {
    let currencyList = await this.getCurrencyList();
    for (let item of data) {
      item.balance = await this.roundCurrency({
        currency: item.currency,
        balance: item.balance,
        currencyList
      });
    }
    return callback(data);
  },

  /* scope:server */
  async beforeSave(data, cb) {
    if (!data.status) data.status = 0;
    if (!data.acc_no) {
      const iban = require("iban-generator");
      let res;
      do {
        data.acc_no = iban.randomNumber();
        res = await this.dbCollection.findOne(
          {
            acc_no: data.acc_no
          },
          { id: 1 }
        );
      } while (res);
    }
    cb(data);
  },

  /* scope:client */
  async getTopAccs(cb) {
    this.runOnServer("getTopAccs", {}, cb);
  },

  /* scope:server */
  async $getTopAccs(data, cb) {
    let res = await this.src.db
      .collection("accounts")
      .findAll({ on_top: true, removed: 0 });
    return cb(res);
  },

  /* scope:client */
  async getOwnerRealm(data, cb) {
    this.runOnServer("getOwnerRealm", data, cb);
  },

  /* scope:server */
  async $getOwnerRealm(data, cb) {
    let res = await this.src.db
      .collection("users")
      .findOne({ id: data.owner }, { id: 1, realm: 1 });
    return cb(res);
  },

  /* scope:client */
  bindMonitoringWallet(data, cb) {
    this.runOnServer("bindMonitoringWallet", data, cb);
  },

  /* scope:server */
  async $bindMonitoringWallet(data, cb) {
    let cc = await this.src.db
      .collection("account_crypto")
      .findOne({ acc_no: data.acc_no }, { address: 1 });
    if (!cc) cc = await this.createCryptoAddress(data);
    if (cc && cc.address != data.address && data.address)
      await this.updateCryptoAddress(data);
    cb(cc);
  },

  /* scope:server */
  async updateCryptoAddress(data) {
    await this.src.db
      .collection("account_crypto")
      .update({ acc_no: data.acc_no }, { $set: { address: data.address } });
    return { success: true };
  },

  /* scope:server */
  async createCryptoAddress(data) {
    let res = await this.callApi({
      service: "ccoin-service",
      method: "create",
      data: {
        currency: { abbr: data.currency },
        account: { acc_no: data.acc_no, address: data.address }
      }
    });
    return res;
  },

  /* scope:server */
  getData(params, cb) {
    this.collection = "vw_client_accs";
    this.dbCollection = this.src.db.collection("vw_client_accs");
    this.callParent(arguments);
  },

  /* scope:client */
  async removeAccount(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("removeAccount", params, resolve);
    });
  },

  /* scope:server */
  async $removeAccount(params, cb) {
    await this.src.db.collection("accounts").update(
      { id: params.data.id },
      {
        $set: {
          removed: 1
        }
      }
    );

    await this.src.db
      .collection("merchant_accounts")
      .remove({ id_account: params.data.id });

    cb({});
  },

  /* scope:client */
  async getAccDataByAccounts(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getAccDataByAccounts", params, resolve);
    });
  },

  /* scope:server */
  async $getAccDataByAccounts(params, cb) {
    const res = await this.src.db.query(
      "SELECT acc_name, currency, acc_no, owner, balance, negative FROM accounts WHERE acc_no IN ($1, $2)",
      params.accounts
    );

    const out = {};

    if (res && res.length) {
      res.forEach((item) => {
        out[item.acc_no] = { ...item };
      });
    }

    cb(out);
  },

  /* scope:client */
  findAccountForRebind(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("findAccountForRebind", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $findAccountForRebind(data, cb) {
    let old_acc_data = await this.src.db
      .collection("accounts")
      .findOne({ id: data.id }, { status: 1 });
    if (old_acc_data && old_acc_data.status != 1)
      return cb({ status: "ACCOUNT_ALREADY_DEACTIVATED" });
    let merch_data = await this.src.db
      .collection("merchant_accounts")
      .findOne({ id_account: data.id }, { id_merchant: 1 });

    if (!merch_data) return cb({ status: "MERCH_NOT_FOUND" });
    let all_merchant_accounts = await this.src.db
      .collection("merchant_accounts")
      .findAll({ id_merchant: merch_data.id_merchant }, { id_account: 1 });

    if (!all_merchant_accounts || all_merchant_accounts.length == 0)
      return cb({
        status: "MERCHANT_DONT_HAVE_ANY_ACCOUNTS",
        merchant_id: merch_data.id_merchant
      });

    all_merchant_accounts = all_merchant_accounts.map((el) => el.id_account);
    all_merchant_accounts.splice(all_merchant_accounts.indexOf(data.id), 1);
    let account_by_one_currency = await this.src.db
      .collection("vw_client_accs")
      .findOne(
        {
          id: { $in: all_merchant_accounts },
          currency: data.currency,
          status: 1
        },
        { id: 1, acc_no: 1, crypto_address: 1 }
      );

    if (
      !account_by_one_currency ||
      !account_by_one_currency.hasOwnProperty("id")
    )
      return cb({
        success: true
      });

    await this.$rebindAccount(
      {
        old_acc: {
          id: data.id,
          acc_no: data.acc_no,
          owner: data.owner,
          crypto_address: data.crypto_address
        },
        new_acc: {
          id: account_by_one_currency.id,
          acc_no: account_by_one_currency.acc_no,
          crypto_address: account_by_one_currency.crypto_address
        }
      },
      (res) => {
        return cb(res);
      }
    );
  },

  /* scope:client */
  rebindAccount(data) {
    return new Promise((resolve) => {
      this.runOnServer("rebindAccount", data, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $rebindAccount(data, cb) {
    let merchants = await this.src.db
      .collection("merchants")
      .findAll({ user_id: data.old_acc.owner }, { id: 1, variables: 1 });
    for (let merchant of merchants) {
      if (merchant.variables && merchant.variables.length) {
        for (let variable of merchant.variables) {
          if (variable.value == data.old_acc.acc_no) {
            variable.value = data.new_acc.acc_no;
          }
          if (variable.value == data.old_acc.crypto_address) {
            variable.value = data.new_acc.crypto_address;
          }
        }
      }
    }
    let query_params = "",
      placeholder = [],
      counter = 1;
    for (let merch_data of merchants) {
      query_params += `($${counter},$${counter + 1}::jsonb)`;
      placeholder.push(merch_data.id, { _arr: merch_data.variables });
      if (placeholder.length / 2 < merchants.length) query_params += ",";
      counter += 2;
    }

    let query = `
      update merchants m set
        variables = c.variables
      from (values
      ${query_params}
      ) c(id, variables)
      where c.id = m.id::text
      `;
    await this.src.db.query(query, placeholder);
    return cb({ success: true });
  },

  /* scope:client */
  bindAccToMerchant(data) {
    return new Promise((resolve) => {
      this.runOnServer("bindAccToMerchant", data, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $bindAccToMerchant(data, cb) {
    await this.src.db.collection("merchant_accounts").insert({
      id_merchant: data.merchant,
      id_account: data.id,
      ctime: new Date()
    });
    let new_acc = await this.src.db
      .collection("vw_client_accs")
      .findOne({ id: data.id }, { id: 1, acc_no: 1, crypto_address: 1 });
    return cb({ success: true, acc_data: new_acc });
  },

  /* scope:client */
  createAccounts(data) {
    return new Promise((resolve) => {
      this.runOnServer("createAccounts", data, resolve);
    });
  },

  /* scope:server */
  async $createAccounts(data, cb) {
    data.maker = this.user.id;

    const res = await this.callApi({
      service: "account-service",
      method: "createWallet",
      data: data,
      realm: null,
      user: null
    });

    if (res && res.result && res.result.success) {
      return cb({
        success: true,
        count: res.result.accounts.length,
        accounts: res.result.accounts
      });
    } else if (res && res.error) {
      return cb({ success: false, error: res.error });
    }

    return cb({ success: false, error: "UNKNOWN" });
  },

  /* scope:client */
  getCurrrencies() {
    return new Promise((resolve) => {
      this.runOnServer("getCurrrencies", {}, resolve);
    });
  },

  /* scope:server */
  async $getCurrrencies(data, cb) {
    let currencies = await this.src.db.collection("currency").findAll();

    currencies = currencies.filter(
      (el) => !["USDT", "USDC", "USTR"].includes(el.abbr) && el.ap_active
    );

    currencies.sort((a, b) => (a.abbr > b.abbr ? 1 : -1));

    return cb(currencies);
  }
});
