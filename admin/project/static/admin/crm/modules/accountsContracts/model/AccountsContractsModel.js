Ext.define("Crm.modules.accountsContracts.model.AccountsContractsModel", {
  extend: "Core.data.DataModel",

  collection: "account_contracts",
  idField: "id",
  //removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "account_number",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "bank",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "swift",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "correspondent_account",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "correspondent_currency",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "owner_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: 1,
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "currency",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  getData(params, cb) {
    if (params.fieldSet == "bank") {
      let sql = `select distinct bank from account_contracts where removed = 0`;
      this.src.db.query(sql, [], function(err, data) {
        if (data && data.length > 0 && err == null) {
          cb({ total: data.length, list: data });
        } else {
          cb({ total: data.length, list: [] });
        }
      });
    } else this.callParent(arguments);
  },

  /* scope:server */
  async beforeSave(data, cb) {
    let where = {};
    if (
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
        data.bank
      )
    )
      where.id = data.bank;
    else {
      where.name = data.bank;
    }

    let bank = await this.src.db.collection("banks").findOne(where);

    data.bank = bank.name;
    data.swift = bank.swift;
    cb(data);
  }
});
