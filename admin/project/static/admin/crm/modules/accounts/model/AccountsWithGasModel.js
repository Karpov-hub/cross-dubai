Ext.define("Crm.modules.accounts.model.AccountsWithGasModel", {
  extend: "Crm.classes.ClientFilteredModel",

  filterParam: { entity: "merchant", field: "merchant_id" },

  collection: "vw_accounts_with_gas",
  idField: "id",

  mixins: [
    "Crm.modules.accounts.model.AccountsWithGasFunctions",
    "Crm.modules.managers.model.ManagerFunctions"
  ],

  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
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
      name: "owner_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "merchant_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "wallet_id",
      type: "ObjectID",
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
      name: "acc_no",
      type: "string",
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
      name: "balance",
      type: "float",
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
      name: "gas_acc_no",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "gas_currency",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "gas_acc_id",
      type: "ObjectID",
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
      name: "status",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "telegram_link",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "wallet_type",
      type: "int",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  updateGridData() {
    this.changeModelData(
      "Crm.modules.accounts.model.AccountsWithGasModel",
      "ins",
      {}
    );
    return;
  },

  /* scope:client */
  getWalletIds(data) {
    return new Promise((resolve) => {
      this.runOnServer("getWalletIds", data, resolve);
    });
  },

  /* scope:server */
  async $getWalletIds(data, cb) {
    let id_list = await this.src.db
      .collection("account_crypto")
      .findAll({ address: data.address }, { id: 1 });
    return cb(id_list.map((el) => el.id));
  },

  /* scope:server */
  async $getClientEmail(data, cb) {
    const client_data = await this.src.db
      .collection("users")
      .findOne({ id: data.owner_id }, { email: 1 });
    return cb(client_data.email);
  }
});
