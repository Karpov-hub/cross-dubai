Ext.define("Crm.modules.finance.model.ChartModel", {
  extend: "Core.data.DataModel",

  collection: "finance_settings",
  idField: "id",
  removeAction: "remove",
  strongRequest: true,

  mixins: ["Crm.modules.finance.model.Operations"], // scope:server

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    }
  ],

  /* scope:client */
  getData(settings) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getData", { settings }, resolve);
    });
  },

  /* scope:server */
  async $getData(data, cb) {
    if (!data.settings) return cb({});
    cb(await this.getData(data.settings));
  },

  /* scope:server */
  async getData(settings) {
    let { where, accounts } = this.buildTxWhere(settings);
    const dur = parseInt(settings.duration);

    const res = await this.src.db
      .collection("transactions")
      .findSortLimit(where, null, { ctime: 1 });

    if (settings.separate_chart)
      return await this.prepareTransactionsSeparate(
        res,
        settings.currency,
        dur > 24 ? "day" : "hour",
        settings.accounts,
        accounts
      );
    return await this.prepareTransactions(
      res,
      settings.currency,
      dur > 24 ? "day" : "hour",
      accounts
    );
  },

  async prepareTransactions(data, currency, dateType, accountDir) {
    let total = 0;
    let out = {};
    const currencyRates = await this.getCurrencyRates();
    data.forEach((tx) => {
      let date = this.calculateDate(tx.mtime, dateType);
      let amount = this.calculateAmount(
        tx.amount,
        tx.currency_src,
        currency,
        currencyRates
      );

      if (!out[date]) out[date] = 0;
      if (
        accountDir.src &&
        accountDir.src.find((el) => {
          return el == tx.acc_src;
        })
      ) {
        out[date] -= amount;
        total -= amount;
      }
      if (
        accountDir.dst &&
        accountDir.dst.find((el) => {
          return el == tx.acc_dst;
        })
      ) {
        out[date] += amount;
        total += amount;
      }
    });
    const ret = {
      list: Object.keys(out).map((date) => {
        return { date, value: out[date] };
      }),
      total,
      currency
    };
    return ret;
  },

  async prepareTransactionsSeparate(
    data,
    currency,
    dateType,
    accounts,
    accountDir
  ) {
    let total = 0;
    let out = {};
    const currencyRates = await this.getCurrencyRates();
    data.forEach((tx) => {
      let date = this.calculateDate(tx.mtime, dateType);
      let amount = this.calculateAmount(
        tx.amount,
        tx.currency_src,
        currency,
        currencyRates
      );
      const accKeys = this.getAccountKeys(tx, accounts);
      if (!out[date]) out[date] = {};
      if (
        accountDir.src &&
        accountDir.src.find((el) => {
          return el == tx.acc_src;
        })
      ) {
        accKeys.forEach((k) => {
          if (!out[date][k]) out[date][k] = 0;
          out[date][k] -= amount;
        });
        total -= amount;
      }
      if (
        accountDir.dst &&
        accountDir.dst.find((el) => {
          return el == tx.acc_dst;
        })
      ) {
        accKeys.forEach((k) => {
          if (!out[date][k]) out[date][k] = 0;
          out[date][k] += amount;
        });
        total += amount;
      }
    });
    const ret = {
      list: Object.keys(out).map((date) => {
        out[date].date = date;
        return out[date];
      }),
      total,
      currency
    };
    return ret;
  },

  getAccountKeys(tx, accounts) {
    let accKeys = [];
    accounts.forEach((acc) => {
      if (acc.dir == "profit") {
        if (tx.acc_src == acc.account || tx.acc_dst == acc.account)
          return accKeys.push(`${acc.dir}_${acc.account}`);
      }
      if (acc.dir == "income") {
        if (tx.acc_dst == acc.account)
          return accKeys.push(`${acc.dir}_${acc.account}`);
      }
      if (acc.dir == "spending") {
        if (tx.acc_src == acc.account)
          return accKeys.push(`${acc.dir}_${acc.account}`);
      }
    });
    return accKeys;
  },

  calculateDate(date, dateType) {
    if (dateType == "hour") {
      return Ext.Date.format(new Date(date), "H");
    }
    return Ext.Date.format(new Date(date), "M d");
  },

  calculateAmount(amount, src_currency, dst_currency, currencyRates) {
    return (amount * currencyRates[src_currency]) / currencyRates[dst_currency];
  },

  async getCurrencyRates() {
    const res = await this.src.db.collection("vw_current_currency").findAll({});
    const out = {};
    res.forEach((r) => {
      out[r.abbr] = r.k;
    });
    return out;
  }
});
