Ext.define("Admin.view.main.NRModel", {
  extend: "Ext.app.ViewModel",

  constructor: function() {
    this.callParent(arguments);
    setInterval(() => {
      this.loadNilRates();
    }, 1800000);
  },

  async loadNilRates() {
    if (!this.currencyModel)
      this.currencyModel = Ext.create(
        "Crm.modules.accounts.model.AccountsModel"
      );
    const instruments = [
      {
        currency_from: "EUR",
        currency_to: "USDT"
      },
      {
        currency_from: "USD",
        currency_to: "USDT"
      },
      {
        currency_from: "USDT",
        currency_to: "EUR"
      },
      {
        currency_from: "USDT",
        currency_to: "USD"
      },
      // {
      //   currency_from: "EUR",
      //   currency_to: "BTC"
      // },
      // {
      //   currency_from: "USD",
      //   currency_to: "BTC"
      // },
      // {
      //   currency_from: "BTC",
      //   currency_to: "EUR"
      // },
      // {
      //   currency_from: "BTC",
      //   currency_to: "USD"
      // }
    ];
    const res = await this.currencyModel.callApi(
      "ccoin-service",
      "getExchangeRates",
      {
        instruments
      }
    );
    this.set("nil_rates", res);
    return res;
  }
});
