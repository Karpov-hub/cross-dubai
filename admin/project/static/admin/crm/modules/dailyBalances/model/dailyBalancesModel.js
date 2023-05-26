Ext.define("Crm.modules.dailyBalances.model.dailyBalancesModel", {
  extend: "Crm.classes.DataModel",

  mixins: ["Crm.modules.currency.model.CurrencyFunc"],

  collection: "daily_balances",
  strongRequest: true,
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "sk_balances",
      type: "object",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "nil_balances",
      type: "object",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "deposits_on_hold",
      type: "object",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "ready_to_payout",
      type: "object",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "doh_totals",
      type: "object",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "rtp_totals",
      type: "object",
      visible: true,
      filterable: true,
      editable: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  async afterGetData(data, callback) {
    if (!data || !data.length) return callback(data);

    let merchant_ids = [];
    for (let item of data) {
      if (item.deposits_on_hold)
        for (const record of item.deposits_on_hold.result) {
          if (
            !merchant_ids.find((el) => {
              return el == record.merchant_id;
            })
          )
            merchant_ids.push(record.merchant_id);
        }
      if (item.ready_to_payout)
        for (const record of item.ready_to_payout.result) {
          if (
            !merchant_ids.find((el) => {
              return el == record.id_merchant;
            })
          )
            merchant_ids.push(record.id_merchant);
        }
    }
    let merchants = await this.src.db
      .collection("merchants")
      .findAll({ id: merchant_ids }, { id: 1, name: 1 });

    let currencyList = await this.getCurrencyList();

    for (let item of data) {
      if (item.deposits_on_hold)
        for (const record of item.deposits_on_hold.result) {
          let found_merchant = merchants.find((el) => {
            return el.id == record.merchant_id;
          });
          if (found_merchant) record.merchant_name = found_merchant.name;
        }
      if (item.ready_to_payout)
        for (const record of item.ready_to_payout.result) {
          let found_merchant = merchants.find((el) => {
            return el.id == record.id_merchant;
          });
          if (found_merchant) record.merchant_name = found_merchant.name;
        }

      if (item.doh_totals)
        for (const key of Object.keys(item.doh_totals)) {
          item.doh_totals[key] = await this.roundCurrency({
            currency: key,
            balance: item.doh_totals[key],
            currencyList
          });
        }

      if (item.rtp_totals)
        for (const key of Object.keys(item.rtp_totals)) {
          item.rtp_totals[key] = await this.roundCurrency({
            currency: key,
            balance: item.rtp_totals[key],
            currencyList
          });
        }
    }

    return callback(data);
  }
});
