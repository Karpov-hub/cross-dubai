Ext.define("Crm.modules.chainOfWallets.model.WalletsModel", {
  extend: "Crm.classes.DataModel",

  collection: "wallet_chains",
  idField: "id",

  mixins: [
    "Crm.modules.orders.model.UpdateDataFuncModel" // scope:server
  ],

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "wallet_sender",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "wallet_receiver",
      type: "string",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "merchant_id",
      type: "ObjectID",
      filterable: true,
      editable: false,
      visible: true,
      bindTo: {
        collection: "merchants",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1
        }
      }
    },
    {
      name: "first_payment_date",
      type: "date",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "lifespan",
      type: "integer",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "status",
      type: "integer",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "wallets",
      type: "object",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: false,
      visible: true
    }
  ],

  /* scope:server */
  getData(params, cb) {
    if (params._filters || params.filters) {
      const filters = params.filters || params._filters;
      for (const f of filters) {
        if (f._property == "wallets" || f.property == "wallets") {
          const sql = `SELECT wc.*, m.name as merchant_name FROM wallet_chains wc left join merchants m on wc.merchant_id=m.id where wallets->'_arr' ? '${f._value ||
            f.value}' and wc.removed = 0`;
          this.src.db.query(sql, [], function(err, data) {
            if (data && data.length > 0 && err == null) {
              data.forEach((item) => {
                item.merchant_id = {
                  id: item.merchant_id,
                  name: item.merchant_name
                };
              });
              cb({ total: data.length, list: data });
            } else {
              cb({ total: data.length, list: [] });
            }
          });
        } else this.callParent(arguments);
      }
    } else this.callParent(arguments);
  },

  /* scope:client */
  async deactivateChain(chain_id, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("deactivateChain", { id: chain_id }, resolve);
    });
  },

  /* scope:server */
  async $deactivateChain(params, cb) {
    await this.src.db.collection("wallet_chains").update(
      {
        id: params.id
      },
      {
        $set: { status: 1 }
      }
    );
    cb({});
  },

  /* scope:client */
  async refreshData(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("refreshData", data, (res) => {
        resolve(res);
      });
    });
  }
});
