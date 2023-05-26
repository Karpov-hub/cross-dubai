Ext.define("Crm.modules.accounts.model.ClientAccsModel", {
  extend: "Crm.modules.accounts.model.AccountsModel",

  collection: "vw_client_accs",
  idField: "id",

  mixins: ["Crm.modules.currency.model.CurrencyFunc"],

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
