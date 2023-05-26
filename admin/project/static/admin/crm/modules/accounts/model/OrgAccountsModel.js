Ext.define("Crm.modules.accounts.model.OrgAccountsModel", {
  extend: "Core.data.DataModel",

  collection: "vw_org_accounts",
  idField: "org",
  strongRequest: true,
  mixins: ["Crm.modules.currency.model.CurrencyFunc"],
  fields: [
    {
      name: "org",
      type: "ObjectID",
      visible: true,
      filterable: true
    },
    {
      name: "currency",
      sort: 1,
      type: "string",
      filterable: true,
      visible: true
    },
    {
      name: "acc_no",
      type: "string",
      sort: 1,
      filterable: true,
      visible: true
    },
    {
      name: "balance",
      type: "float",
      filterable: true,
      visible: true
    },
    {
      name: "status",
      type: "int",
      filterable: true,
      visible: true
    }
  ],

  async afterGetData(data, callback) {
    const out = [];
    let currencyList = await this.getCurrencyList();
    for (let item of data) {
      if (item.status == 1) {
        item.balance = await this.roundCurrency({
          currency: item.currency,
          balance: item.balance,
          currencyList
        });
        out.push(item);
      }
    }
    return callback(out);
  }
});
