Ext.define("Crm.modules.accounts.model.RealmAccountsModel", {
  extend: "Crm.classes.DataModel",

  mixins: [
    "Crm.modules.orders.model.UpdateDataFuncModel" // scope:server
  ],

  collection: "vw_realmaccounts",
  idField: "id",
  removeAction: "remove",

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
      name: "type",
      type: "int",
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
      name: "details",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },

    {
      name: "ra_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  async refreshData(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("refreshData", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async write(data, cb) {
    if (data.acc_no) {
      const acc = await this.src.db.collection("accounts").findOne({
        acc_no: data.acc_no
      });
      if (acc) {
        if (acc.id == data.id) {
          await this.src.db.collection("accounts").update(
            {
              id: acc.id
            },
            {
              $set: { acc_name: data.acc_name }
            }
          );
          await this.src.db.collection("realmaccounts").update(
            {
              account_id: data.id
            },
            {
              $set: {
                iban_id:
                  data.iban_id && data.iban_id.length > 0 ? data.iban_id : null,
                realm_id: data.owner,
                account_id: acc.id,
                type: data.type,
                details: data.details,
                callback: data.callback,
                country: data.country
              }
            }
          );
          return cb({ success: true });
        }
        return cb({ success: false });
      }
    }

    const uuid = require("uuid/v4");
    const params = {
      service: "account-service",
      method: "create",
      realm: data.owner,
      user: data.owner,
      data: {
        currency: data.currency
      }
    };
    const { result } = await this.callApi(params);
    const account = result;
    const set = {
      active: 1,
      acc_name: data.acc_name,
      negative: data.negative == "on"
    };

    if (data.acc_no) {
      set.acc_no = data.acc_no;
    }

    await this.src.db.collection("accounts").update(
      {
        id: account.id
      },
      {
        $set: set
      }
    );

    await this.src.db.collection("realmaccounts").insert({
      id: uuid(),
      realm_id: data.owner,
      account_id: account.id,
      type: data.type,
      details: data.details,
      callback: data.callback
    });

    cb({ success: true });
  },

  /* scope:server */
  async remove(data, cb) {
    this.collection = "accounts";
    this.dbCollection = this.src.db.collection(this.collection);
    this.callParent(arguments);
  },

  /* scope:client */
  getAccountsOfDefaultRealm() {
    return new Promise((resolve) => {
      this.runOnServer("getAccountsOfDefaultRealm", {}, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $getAccountsOfDefaultRealm(data, cb) {
    let default_realm = await this.src.db
      .collection("realms")
      .findOne({ removed: 0, admin_realm: true }, { id: 1 });
    let accounts = await this.src.db
      .collection("accounts")
      .findAll(
        { owner: default_realm.id },
        { acc_no: 1, balance: 1, currency: 1, acc_name: 1, acc_description: 1 }
      );
    return cb(accounts);
  }
});
