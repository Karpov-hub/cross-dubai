/**
 * Emelyanov Alexander
 * Currency functions
 * getCurrrencyList - get all currency
 * roundCurrency - round amount by currency decimal
 *  ---->(data for client scoped method): currency, balance, currencyList
 * ----->(data for server scoped method): {currency, balance, currencyList}
 */
Ext.define("Crm.modules.currency.model.CurrencyFunc", {
  /* scope:client */
  async getCurrrencyList() {
    return new Promise((resolve, reject) => {
      this.runOnServer("getCurrencyList", {}, (res) => {
        return resolve(res);
      });
    });
  },
  /* scope:server */
  async $getCurrencyList(data, cb) {
    let res = await this.src.db.collection("vw_currency_values").findAll();
    return cb(res);
  },
  /* scope:server */
  async getCurrencyList() {
    return new Promise((resolve, reject) => {
      this.$getCurrencyList({}, (res) => {
        return resolve(res);
      });
    });
  },

  async roundCurrency_do(currency, balance, currencyList) {
    balance = Number(balance);
    if (!currency) return balance ? balance.toFixed(2) : 0;
    let thisCurr = currencyList.find((item) => item.abbr == currency);
    return balance && thisCurr && thisCurr.decimal
      ? balance.toFixed(thisCurr.decimal)
      : 0;
  },

  /* scope:client */
  async roundCurrency(currency, balance, currencyList) {
    return await this.roundCurrency_do(currency, balance, currencyList);
  },

  /* scope:server */
  async roundCurrency(data) {
    return await this.roundCurrency_do(
      data.currency,
      data.balance,
      data.currencyList
    );
  },

  /* scope:client */
  calculateCurrenciesRating(data) {
    return new Promise((resolve) => {
      this.runOnServer("calculateCurrenciesRating", data, resolve);
    });
  },

  /* scope:server */
  async $calculateCurrenciesRating(data, cb) {
    let volume = await this.calculateCurrenciesRating(
      data.volume,
      data.orders_data
    );
    return cb(volume);
  },

  /* scope:server */
  async calculateCurrenciesRating(volume, orders_data) {
    if (!orders_data)
      orders_data = await this.src.db.collection("non_ad_orders").findAll();
    let currencies = {};
    for (let order of orders_data) {
      if (!currencies[order.additional_data[volume]])
        currencies[order.additional_data[volume]] = 0;
      currencies[order.additional_data[volume]]++;
    }
    return currencies;
  },

  /* scope:server */
  getCommonlyUsedCurrency(volumes) {
    let common_currency_object = {};
    for (let currency of Object.keys(volumes)) {
      let common_currency_key = Object.keys(common_currency_object);
      if (
        !common_currency_key.length ||
        common_currency_object[common_currency_key[0]] < volumes[currency]
      )
        common_currency_object = {
          [currency]: volumes[currency]
        };
    }
    return Object.keys(common_currency_object)[0];
  }
});
