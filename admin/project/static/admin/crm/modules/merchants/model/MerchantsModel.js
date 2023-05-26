Ext.define("Crm.modules.merchants.model.MerchantsModel", {
  extend: "Crm.classes.ClientFilteredModel",

  filterParam: { entity: "merchant", field: "id" },

  collection: "merchants",
  idField: "id",
  removeAction: "remove",

  mixins: [
    "Crm.modules.merchants.model.DepartmentsFunctionsModel", // scope:server
    "Crm.modules.currency.model.CurrencyFunc"
  ],

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "tariff",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "variables",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      visible: true,
      editable: true,
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true,
      sort: 1
    },
    {
      name: "website",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "description",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "categories",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "token",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "secret",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "callback",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "active",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "callback_url",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "callback_error",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "payment_details",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "country",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "vat",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "email",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "phone",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "address",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "registration",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "accounts_panel",
      type: "boolean",
      editable: false,
      visible: false
    },
    {
      name: "tariff_panel",
      type: "boolean",
      editable: false,
      visible: false
    },
    {
      name: "contracts_panel",
      type: "boolean",
      visible: false,
      editable: false
    },
    {
      name: "tech_panel",
      type: "boolean",
      visible: false,
      editable: false
    },
    {
      name: "orders_panel",
      type: "boolean",
      visible: false,
      editable: false
    },
    {
      name: "transfers_panel",
      type: "boolean",
      visible: false,
      editable: false
    },
    {
      name: "banking_profile_panel",
      type: "boolean",
      visible: false,
      editable: false
    },
    {
      name: "provide_deferred_btn",
      type: "boolean",
      visible: false,
      editable: false
    },
    {
      name: "other_websites",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "campaigns_panel",
      type: "boolean",
      visible: false,
      editable: false
    },
    {
      name: "zip",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "city",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "street",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "house",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "additional_info",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "tax_number",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "short_address",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "city_district",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "region",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "deposits_load_btn",
      type: "boolean",
      visible: false,
      editable: false
    },
    {
      name: "transfers_provide_deferred_btn",
      type: "boolean",
      visible: false,
      editable: false
    },
    {
      name: "registration_info",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  async afterGetData(data, cb) {
    for (const d of data) {
      if (d.categories) {
        let res = await this.src.db
          .collection("categories_merchants")
          .findOne({ id: d.categories });
        d.category_grid = res.name;
      }
    }

    cb(data);
  },

  /* scope:client */
  async getMerchantById(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getMerchantById", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getMerchantById(data, cb) {
    let res = await this.src.db
      .collection("merchants")
      .findOne({ id: data.id });

    return cb(res);
  },

  /* scope:client */
  getAccounts(user_id, org_id, cb) {
    this.runOnServer("getAccounts", { user_id, org_id }, (res) => {
      cb(res.list);
    });
  },

  /* scope:server */
  $getAccounts(data, cb) {
    this.src.db.query(
      "select a.id, a.acc_no, a.currency, a.acc_description, a.balance, ma.id_merchant, ac.address from accounts a left join merchant_accounts ma on (a.id=ma.id_account) inner join account_crypto ac on a.acc_no = ac.acc_no where a.owner=$1 and ma.id_merchant=$2 and a.status = 1 and ac.address notnull and ac.address != ''",
      [data.user_id, data.org_id],
      (e, d) => {
        const accs = {};
        const out = d.filter(
          ({ address }) => !accs[address] && (accs[address] = 1)
        );
        cb({ list: out || [] });
      }
    );
  },

  /* scope:server */
  async $getUserName(data, cb) {
    let usr = await this.src.db
      .collection("users")
      .findOne({ id: data.user_id });
    let usrname = `${usr.first_name} ${usr.last_name}`;
    cb(usrname);
  },

  /* scope:client */
  async getUserName(data, cb) {
    await this.runOnServer("getUserName", data, cb);
  },

  /* scope:server */
  write(data, cb) {
    this.crypto_wallets = data.crypto_wallets;
    this.accounts = data.accounts;
    this.ibans = data.ibans;
    this.callParent(arguments);
  },

  /* scope:server */
  async afterSave(data, cb) {
    await this.saveComboData(
      data,
      "org_cryptowallets",
      this.crypto_wallets,
      {
        org_id: data.id
      },
      {
        org_id: data.id,
        wallet_id: null,
        ctime: new Date()
      }
    );

    await this.checkMonitoringWallets(this.accounts);

    // await this.saveComboData(
    //   data,
    //   "merchant_accounts",
    //   this.accounts,
    //   {
    //     id_merchant: data.id
    //   },
    //   {
    //     id_merchant: data.id,
    //     id_account: null,
    //     ctime: new Date()
    //   }
    // );

    if (this.crypto_wallets && this.crypto_wallets.length) {
      let sqlPlaceHolders = [];
      let sql = "update crypto_wallets set status = 1 where id in (";
      if (Array.isArray(this.crypto_wallets)) {
        for (const wallet of this.crypto_wallets) {
          sqlPlaceHolders.push(wallet);
          sql += `$${sqlPlaceHolders.length}`;
          if (this.crypto_wallets.length > sqlPlaceHolders.length) {
            sql += ",";
          }
        }
      } else {
        sqlPlaceHolders.push(this.crypto_wallets);
        sql += `$${sqlPlaceHolders.length}`;
      }
      sql += ")";
      await this.dbQuery(sql, sqlPlaceHolders);
    }

    cb(data);
  },

  /* scope:client */
  getCryptoWallets(user_id, org_id, cb) {
    this.runOnServer("getCryptoWallets", { user_id, org_id }, cb);
  },

  /* scope:server */
  $getCryptoWallets(data, cb) {
    this.src.db.query(
      `
    select cw.id, cw.name, cw.num, cw.curr_name, oc.org_id
    from crypto_wallets cw
    left join org_cryptowallets oc
    on (cw.id=oc.wallet_id and oc.org_id=$2)
    where cw.user_id=$1 and cw.removed <> 1 and cw.status <>0
    `,
      [data.user_id, data.org_id],
      (e, d) => {
        cb(d || []);
      }
    );
  },

  /* scope:server */
  async checkMonitoringWallets(accounts, custom_address) {
    if (!accounts || !accounts.length) return;

    const curr = await this.src.db.collection("currency").findAll();
    let cryptoCurr = [];
    curr.forEach((c) => {
      if (c.crypto) cryptoCurr.push(c.abbr);
    });

    if (!Ext.isArray(accounts)) accounts = [accounts];

    let accs = await this.src.db
      .collection("accounts")
      .findAll({ id: { $in: accounts }, currency: { $in: cryptoCurr } });
    if (!accs.length) return;

    const cca = accs.map((a) => a.acc_no);

    if (!cca || !cca.length) return;

    let cc = await this.src.db
      .collection("account_crypto")
      .findAll({ acc_no: { $in: cca } });
    cc = cc.map((c) => c.acc_no);

    accs = accs.filter((a) => {
      return !cc.includes(a.acc_no);
    });

    if (accs.length) {
      for (let acc of accs) {
        await this.callApi({
          service: "ccoin-service",
          method: "create",
          data: {
            currency: { abbr: acc.currency },
            account: { acc_no: acc.acc_no, address: custom_address }
          }
        });
      }
    }
    return;
  },
  /* scope:server */
  dbQuery: function(sql, sqlPlaceHolders) {
    let me = this;
    return new Promise((res, rej) => {
      me.src.db.query(sql, sqlPlaceHolders, function(e, data) {
        if (e) {
          console.error(
            `model: MerchantsModel, func: dbQuery, params: ${(sql,
            sqlPlaceHolders)}, result: ${data}, error: ${e}`
          );
          res({ error: "DB error" });
        }
        res(data);
      });
    });
  },

  /* scope:client */
  getData(params, cb) {
    this.runOnServer("getData", { params }, cb);
  },

  /* scope:server */
  async $getData(params, cb) {
    this.getData(params, (res) => {
      return cb(res);
    });
  },

  /* scope:client */
  async attachAccountToMerchant(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("attachAccountToMerchant", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $attachAccountToMerchant(data, cb) {
    console.log("CHECKEED");

    await this.checkMonitoringWallets(data.accounts, data.address);
    await this.saveComboData(
      data,
      "merchant_accounts",
      data.accounts,
      {
        id_merchant: data.id
      },
      {
        id_merchant: data.id,
        id_account: null,
        ctime: new Date()
      }
    );

    return cb(true);
  }
});
