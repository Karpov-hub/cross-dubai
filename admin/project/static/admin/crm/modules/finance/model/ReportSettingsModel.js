Ext.define("Crm.modules.finance.model.ReportSettingsModel", {
  extend: "Core.data.DataModel",

  collection: "finance_settings",
  idField: "id",
  removeAction: "remove",
  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "name",
      type: "string",
      sort: 1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "gtype",
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
      name: "duration",
      type: "int",
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
      name: "accounts",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "status_pending",
      type: "boolean",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "status_approved",
      type: "boolean",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "status_canceled",
      type: "boolean",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "status_refund",
      type: "boolean",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "separate_chart",
      type: "boolean",
      filterable: false,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  async beforeSave(data, cb) {
    cb(data);
  },

  /* scope:server */
  async $saveAccountsForDashboard(data, cb) {
    let where = { id_merchant: data.company };
    if (!data.company) {
      let merchantData = await this.src.db
        .collection("merchants")
        .findAll({ user_id: data.group }, { id: 1 }); //get all companies ids if the're not defined from form
      data.company = [];
      for (let merch of merchantData) data.company.push(merch.id);
      where.id_merchant = { $in: data.company };
    }
    let merchantAccs = await this.src.db
      .collection("merchant_accounts")
      .findAll(where, { id_account: 1 }); //get all accounts ids by companies ids
    let accsArr = [];
    for (let merchAcc of merchantAccs) accsArr.push(merchAcc.id_account);

    let whereForAccounts = { id: { $in: accsArr } };
    if (data.currency) whereForAccounts.currency = data.currency;

    let accountsData = await this.src.db
      .collection("accounts")
      .findAll(whereForAccounts, { acc_no: 1 });
    let res = [];
    for (let acc of accountsData)
      res.push({ account: acc.acc_no, dir: data.dir });

    return cb(res);
  }
});
