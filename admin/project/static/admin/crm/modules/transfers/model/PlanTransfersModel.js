Ext.define("Crm.modules.transfers.model.PlanTransfersModel", {
  extend: "Crm.classes.DataModel",

  mixins: ["Crm.modules.currency.model.CurrencyFunc"],

  collection: "transfers",
  idField: "id",
  strongRequest: true,
  showTags: true,
  //removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    }
  ],

  /* scope:client */
  getSystemFees(params) {
    return new Promise((res) => {
      this.runOnServer("getSystemFees", params, (r) => {
        res(r.fee || 0);
      });
    });
  },

  /* scope:server */
  async getSystemFees(data) {
    return new Promise((resolve, reject) => {
      this.$getSystemFees(data, (res) => {
        return resolve(res.fee);
      });
    });
  },

  getSysFees(arr) {
    if (!arr) return null;
    for (let item of arr) {
      if (item.key == "SYS_FEES") return item.value;
    }
    return null;
  },

  /* scope:server */
  async $getSystemFees(data, cb) {
    let vars = await this.src.db
      .collection("transfers_plans")
      .findOne({ id: data.id }, { variables: 1 });
    let fees = this.getSysFees(vars.variables);
    if (!fees) {
      vars = await this.src.db
        .collection("merchants")
        .findOne({ id: data.merchant_id }, { variables: 1, user_id: 1 });
      fees = this.getSysFees(vars.variables);
      if (!fees) {
        vars = await this.src.db
          .collection("users")
          .findOne({ id: vars.user_id }, { variables: 1 });
        fees = this.getSysFees(vars.variables);
      }
    }
    if (!fees) {
      const tariffs = await this.src.db
        .collection("tariffs")
        .findAll({}, { variables: 1 });
      for (let t of tariffs) {
        fees = this.getSysFees(t.variables);
        if (fees) break;
      }
    }
    cb({ fee: fees });
  },

  /* scope:client */
  prepareTransfersData(params) {
    return new Promise((resolve) => {
      this.runOnServer("prepareTransfersData", params, (res) => {
        resolve(res || {});
      });
    });
  },

  /* scope:server */
  async $prepareTransfersData(data, cb) {
    const out = {
      finAmount: null,
      finCurrency: null,
      sentAmount: null,
      sentCurrency: null,
      exchangeRate: null,
      converted: null
    };
    let palanData;
    let currencyList = await this.getCurrencyList();

    for (const item of data.transfersData) {
      if (!palanData) {
        palanData = {
          id: item.plan_transfer_id,
          merchant_id: item.data.merchant_id
        };
      }

      out.ctime = item.ctime;
      if (!out.status) out.status = item.description;

      if (!out.sentAmount) {
        out.sentCurrency = item.data.plan.to.currency;
        out.sentAmount = await this.roundCurrency({
          currency: out.sentCurrency,
          balance: item.data.amount,
          currencyList
        });
      }

      out.amount = await this.roundCurrency({
        currency: item.data.plan.from.currency,
        balance: item.amount,
        currencyList
      });

      out.currency = item.data.plan.from.currency;

      if (!!item.data.netData && !!item.data.netData.exchange) {
        out.exchangeRate = parseFloat(
          item.data.netData.exchange.executed_price
        );
        out.feesCurrency = item.data.plan.from.currency;
      }

      if (!!item.data.netData && !!item.data.netData.net) {
        out.hash = item.data.netData.net.txId;
      }

      out.merchant_id = item.data.merchant_id;

      out.amount_extra = 0;
      if (item.data.netData && item.data.netData.amount_extra) {
        out.amount_extra = item.data.netData.amount_extra;
      }
    }

    const systemFees = await this.getSystemFees(palanData);

    out.fees = await this.roundCurrency({
      currency: out.currency,
      balance: (out.amount * systemFees) / 100,
      currencyList
    });

    out.feesCurrency = out.currency;
    out.finAmount = out.amount - out.fees;
    out.finCurrency = out.currency;

    if (out.amount_extra > 0) {
      out.sentToClient = await this.roundCurrency({
        currency: out.sentCurrency,
        balance: parseFloat(out.sentAmount) - out.amount_extra,
        currencyList
      });
    } else {
      out.sentToClient = await this.roundCurrency({
        currency: out.sentCurrency,
        balance: out.sentAmount,
        currencyList
      });

      out.exchangeRate = (out.finAmount / out.sentAmount).toFixed(5);
    }

    if (out.exchangeRate) {
      out.converted = out.finAmount * out.exchangeRate;
    }

    out.finAmount = await this.roundCurrency({
      currency: out.finCurrency,
      balance: out.finAmount,
      currencyList
    });

    cb(out);
  }
});
