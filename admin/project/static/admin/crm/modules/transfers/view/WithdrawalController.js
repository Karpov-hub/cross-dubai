Ext.define("Crm.modules.transfers.view.WithdrawalController", {
  extend: "Crm.modules.transfers.view.NewTransferController",

  // this.view.down("[action=withdrawal]").setDisabled(false);

  async setControls() {
    this.control({
      "[name=merchant]": {
        change: (el, v) => {
          this.onMerchant(el, v);
        }
      },
      "[name=acc_no]": {
        change: async (el, v) => {
          this.onAccChange(el, v);
          this.updateDecimalPrecision("[name=currency]", "[name=amount]");
        }
      },
      "[name=iban]": {
        change: (e, v) => {
          if (v) this.view.down("[name=wallet]").setValue("");
        }
      },
      "[name=wallet]": {
        change: (e, v) => {
          if (v) this.view.down("[name=iban]").setValue("");
        }
      },
      "[name=to_currency]": {
        change: async (e, v) => {
          await this.checkCurr(v);
          if (v) {
            this.updateDecimalPrecision(
              "[name=to_currency]",
              "[name=result_amount]"
            );
            this.setCmpValue(
              this.view.down("[name=amount]").getValue(),
              "[name=result_amount]",
              "[name=currency]",
              "[name=to_currency]",
              1
            );
          }
        }
      },
      "[name=amount]": {
        change: async (el, v) => {
          this.checkNegativeAmount(v);
          this.updateDecimalPrecision(
            "[name=to_currency]",
            "[name=result_amount]"
          );
          this.setCmpValue(
            v,
            "[name=result_amount]",
            "[name=currency]",
            "[name=to_currency]",
            1
          );
        }
      },
      "[name=result_amount]": {
        change: async (el, v) => {
          this.updateDecimalPrecision("[name=currency]", "[name=amount]");
          this.setCmpValue(
            v,
            "[name=amount]",
            "[name=to_currency]",
            "[name=currency]",
            -1
          );
        }
      },
      "[name=custom_exchange_rate]": {
        change: async () => {
          const customExchangeRate = this.view.down(
            "[name=custom_exchange_rate]"
          );
          this.checkNegativeAmount(customExchangeRate.getValue());
          const useStock = this.view.down("[name=use_stock]");
          const curr = this.view.down("[name=to_currency]").getValue();
          let abbrs = await this.TransferModel.getCurrency({
            abbr: curr
          });
          // if to currency field equals fiat then this code not completed
          abbrs &&
            abbrs.crypto &&
            useStock
              .setValue(!Number(customExchangeRate.getValue()))
              .setDisabled(!!Number(customExchangeRate.getValue()));
        }
      },
      "[name=use_stock]": {
        change: () => {
          const defTransfer = this.view.down("[name=deferred_transfer]");
          const useStock = this.view.down("[name=use_stock]");
          defTransfer.setValue(false).setDisabled(!Number(useStock.getValue()));
        }
      }
    });
    this.TransferModel = Ext.create(
      "Crm.modules.transfers.model.TransfersModel"
    );
    this.callParent(arguments);
  },
  async updateDecimalPrecision(currencyFieldName, amountFieldName) {
    const currency = this.view.down(currencyFieldName).getValue();
    const listCurrencyDecimal = await this.getCurrencyDecimalList();
    this.view.down(amountFieldName).decimalPrecision =
      listCurrencyDecimal[currency];
  },
  checkNegativeAmount(amount) {
    amount !== null
      ? this.view
          .down("[action=withdrawal]")
          .setDisabled(Number(amount) >= 0 ? !Number(amount) : Number(amount))
      : this.view.down("[action=withdrawal]").setDisabled(false);
  },
  async onMerchant(el, v) {
    if (v == "") return;
    let order = await this.TransferModel.getOrderById({
      id: this.view.currentData.ref_id
    });
    let account = await this.TransferModel.getAccountByOrg({
      org: order.organisation,
      curr: order.currency
    });
    if (account) {
      this.view.down("[name=acc_no]").setValue(account.acc_no);
      this.view.down("[name=currency]").setValue(account.currency);
      this.view.down("[name=amount]").setValue(account.balance);
    }
    if (order.res_currency) {
      this.view.down("[name=to_currency]").setValue(order.res_currency);
    }
  },
  setCmpValue(v, selector, currFromSelector, currToSelector, dir) {
    if (this.calcTm) clearTimeout(this.calcTm);

    this.calcTm = setTimeout(async () => {
      const value = await this.calculateAmount(
        v,
        this.view.down(currFromSelector).getValue(),
        this.view.down(currToSelector).getValue(),
        dir
      );
      const el = this.view.down(selector);
      el.suspendEvents();
      el.setValue(value);
      el.resumeEvents(false);
    }, 1000);
  },

  async calculateAmount(amount, currency_from, currency_to, dir) {
    if (!currency_from || !currency_to) return;
    if (currency_from == currency_to) return amount;
    const price = await this.getNilRates(currency_from, currency_to);
    const getSystemFee = await this.getSystemFee();
    let amnt = parseFloat(amount) / parseFloat(price);
    if (getSystemFee) {
      if (dir == 1) {
        return amnt * (1 - getSystemFee);
      } else {
        return amnt / (1 - getSystemFee);
      }
    }
    return amnt;
  },

  async getSystemFee() {
    const vars = this.view.down("[name=variables]").getValue();

    for (let v of vars) {
      if (v.key == "SYS_FEES") return parseFloat(v.value) / 100;
    }

    const fee = await this.view.model.getSystemFeeByOrgIg(
      this.view.down("[name=merchant_id]").getValue(),
      this.view.down("[name=tariff]").getValue()
    );

    return fee / 100;
  },

  async getCurrencyDecimalList() {
    return await this.model.callApi(
      "merchant-service",
      "getListCurrencyDecimal",
      {}
    );
  },

  async getNilRates(currency_from, currency_to) {
    const currentNilRate = await this.model.callApi(
      "ccoin-service",
      "getExchangeRate",
      {
        currency_from,
        currency_to,
        amount: 1
      }
    );
    return currentNilRate ? currentNilRate.price : null;
  },

  async checkCurr(v) {
    let merchant_id = this.view.down("[name=merchant_id]").getValue();
    const Wallet = this.view.down("[name=wallet]");
    const Iban = this.view.down("[name=iban]");
    if (!Wallet || !Iban) {
      return 0;
    }
    Wallet.store.exProxyParams.currency = v;
    Wallet.store.exProxyParams.org = merchant_id;
    Wallet.setValue("");

    let res = await this.TransferModel.getCurrency({
      abbr: v
    });
    const defTransfer = this.view.down("[name=deferred_transfer]");
    const useStock = this.view.down("[name=use_stock]");

    res &&
      defTransfer &&
      useStock &&
      defTransfer.setValue(defTransfer.getValue()) &&
      defTransfer.setDisabled(!res.crypto) &&
      useStock.setValue(res.crypto) &&
      useStock.setDisabled(!res.crypto);

    let user_id = this.view.down("[name=user_id]").getValue();

    if (res.crypto) {
      let wallet = await this.TransferModel.getWallet({
        merchant: merchant_id,
        currency: v
      });
      if (wallet && wallet.length) Wallet.setValue(wallet[0].num);
      Iban.setDisabled(1);
      Wallet.setDisabled(0);
    } else {
      let iban = await this.TransferModel.getIban({
        merchant: merchant_id,
        currency: v ? v : null
      });
      if (iban && iban.length) Iban.setValue(iban[0].name);
      Iban.setDisabled(0);
      Wallet.setDisabled(1);
    }

    let tech_acc = await this.TransferModel.getTechAccount({
      user: user_id,
      currency: v
    });
    if (tech_acc && tech_acc.length == 1)
      this.view.down("[name=acc_tech]").setValue(tech_acc[0].acc_no);
  },

  checkLimit(formData) {
    // if(formData.amount && parseFloat(formData.amount) && parseFloat(formData.amount)>)
  },

  async showWidget() {
    let data = this.view
      .down("form")
      .getForm()
      .getValues();

    if (data.deferred_transfer || !data.use_stock) return this.withdrawal();
    let res = await this.model.checkLimit(data);

    if (res.result) {
      return this.withdrawal();
    }
    this.view.down("[name=deferred_transfer]").setValue(true);
    return D.a(
      "Message",
      `The amount is less than limit %s$. The payment cannot be executed immediately.`,
      [res.tx_limit]
    );
  },

  onAccChange(el, v) {
    el.getStore().each((r) => {
      if (r.data.acc_no == v) {
        this.view.down("[name=amount]").setValue(r.data.balance);
        this.view.down("[name=currency]").setValue(r.data.currency);
      }
    });
  },

  async withdrawal() {
    const me = this;
    const data = this.prepareData(this.view.down("form").getValues());

    const res_curr = await this.TransferModel.getCurrency({
      abbr: data.to_currency
    });

    if (!res_curr.crypto && !data.recipient) {
      return D.a("Error", "Please fill recipient filed");
    }

    data.amount = data.amount.replace(",", ".");
    if (data.custom_exchange_rate)
      data.custom_exchange_rate = data.custom_exchange_rate.replace(",", ".");

    this.userModel.readRecord(data.user_id, async (merchant) => {
      if (!merchant || !merchant.realm) return;
      let previewVariables = [];
      data.variables = this.view.down("[name=variables]").getValue();
      for (const variable of data.variables) {
        if (parseFloat(variable.value) <= 100) {
          previewVariables.push({
            name: variable.descript,
            value:
              variable.descript.slice(-1) == "%"
                ? `${(data.amount * parseFloat(variable.value)) / 100} ${
                    data.currency
                  }`
                : variable.value
          });
        }
      }
      if (data.custom_exchange_rate != "") {
        previewVariables.push({
          name: "Exchange rate",
          value: data.custom_exchange_rate
        });
      }
      if (data && merchant) {
        let summaryData = [
          {
            name: "Client",
            key: "group",
            value: `${merchant.legalname}` || ""
          },
          {
            name: "Merchant",
            key: "organization",
            value: me.view.org.rawValue || ""
          },
          {
            name: "From account",
            key: "acc_no",
            value: `${data.acc_no} ${data.currency}` || ""
          },
          {
            name: "To Account",
            key: "to_account",
            value: `${data.wallet || data.iban} ${data.to_currency}`
          },
          {
            name: "Custom Exchange Rate",
            key: "custom_exchange_rate",
            value: `${data.custom_exchange_rate}` || "No"
          },
          {
            name: "Deferred transfer",
            key: "deferred_transfer",
            value: `${data.deferred_transfer ? "Yes" : "No"}`
          },
          {
            name: "Exchange by Stock",
            key: "use_stock",
            value: `${data.use_stock ? "Yes" : "No"}`
          },
          {
            name: "Source Amount",
            key: "amount",
            value: `${data.amount} ${data.currency}` || ""
          },
          {
            name: "Result Amount",
            key: "result_amount",
            value: `${data.result_amount} ${data.to_currency}` || ""
          },
          {
            name: "Recipient",
            key: "recipient",
            value: `${data.recipient}` || ""
          },
          ...previewVariables
        ];
        Ext.create("Crm.modules.transfers.view.summaryWindow", {
          scope: this,
          summary_data: summaryData,
          confirm_action: {
            service: "account-service",
            method: "withdrawalCustomExchangeRate"
          },
          full_data: { data, merchant }
        });
      }
    });
  }
});
