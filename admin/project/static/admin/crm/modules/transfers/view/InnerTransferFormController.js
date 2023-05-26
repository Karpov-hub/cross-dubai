Ext.define("Crm.modules.transfers.view.InnerTransferFormController", {
  extend: "Crm.modules.transfers.view.NewTransferController",

  setControls() {
    this.control({
      "[action=do_realmtransfer]": {
        click: () => {
          this.realmtransfer();
        }
      },
      "[name=acc_src]": {
        change: (el, v) => {
          this.accChange(v, "acc_dst", "acc_src");
          this.filterCombo(el, v)
        }
      },
      "[name=acc_dst]": {
        change: (el, v) => {
          this.accChange(v, "acc_src", "acc_dst");
          this.filterCombo(el, v)
        }
      }
    });
    this.accountsModel = Ext.create("Crm.modules.accounts.model.AccountsModel");
    this.callParent(arguments);
  },

  filterCombo(el, v) {
    el.store.clearFilter()
    el.store.setFilters([
      {
        filterFn: function (item) {
          if (!v || v == null || v == " ") {
            return item;
          }
          else {
            let value = v.toLowerCase()
            if (item.data.acc_name != null) {
              let acc_name = item.data.acc_name.toLowerCase()
              if (acc_name.indexOf(value) + 1) {
                return item;
              }
            }
            if (item.data.acc_no != null) {
              let acc_no = item.data.acc_no
              if (acc_no.indexOf(value) + 1) {
                return item;
              }
            }
            return 0;
          }
        }
      }
    ])
  },

  accChange(v, acc1, acc2) {
    if (v == this.view.down(`[name=${acc1}]`).getValue()) {
      this.view.down(`[name=${acc2}]`).setValue(null);
    }
  },

  async realmtransfer() {
    if (!this.validateForm()) return;
    this.doAllChecks();
  },

  async doAllChecks() {
    const data = this.prepareData(this.view.down("form").getValues());
    const accounts = await this.accountsModel.getAccDataByAccounts({
      accounts: [data.acc_src, data.acc_dst]
    });

    data.amount = parseFloat(data.amount.replace(",", "."));
    data.exchange_rate = parseFloat(data.exchange_rate.replace(",", "."));

    if (data.amount < 0.00000001) {
      return D.a("Error", "Please indicate correct amount");
    }
    if (data.exchange_rate && data.exchange_rate < 0.00000001) {
      return D.a("Error", "Please indicate correct exchange rate");
    }
    if (
      accounts[data.acc_src].balance < data.amount &&
      !accounts[data.acc_src].negative
    ) {
      return D.a("Error", "Source account has insufficient balance");
    }

    data.currency_src = accounts[data.acc_src].currency;
    data.currency_dst = accounts[data.acc_dst].currency;

    data.accounts = accounts;

    if (data.currency_src != data.currency_dst && !isNaN(data.exchange_rate))
      await this.buildWarning(
        "Are you sure you want to make the exchange operation?",
        async (result) => {
          if (result === "ok") this.merchantAccountsCheck(data);
        }
      );
    else if (
      data.currency_src != data.currency_dst &&
      isNaN(data.exchange_rate)
    )
      await this.buildWarning(
        "Are you sure you do not want to indicate the exchange rate? System rate will apply",
        async (result) => {
          if (result === "ok") this.merchantAccountsCheck(data);
        }
      );
    else this.merchantAccountsCheck(data);
  },

  async merchantAccountsCheck(data) {
    const realm = await this.model.getDefaultRealm();

    const includeTech = [
      data.accounts[data.acc_src].owner,
      data.accounts[data.acc_dst].owner
    ].includes(realm);

    if (!includeTech)
      await this.buildWarning(
        "Are you sure you want to move funds between Merchant accounts?",
        async (result) => {
          if (result === "ok") this.doTransfer(data);
        }
      );
    else this.doTransfer(data);
  },

  async doTransfer(data) {
    if (isNaN(data.exchange_rate)) {
      data.exchange_rate = await this.model.callApi(
        "currency-service",
        "getLatestRates",
        {
          currency: data.currency_src,
          res_currency: data.currency_dst
        }
      );
    }

    let currencyList = await this.model.getCurrrencyList();

    data.exchange_rate = await this.model.roundCurrency(
      data.currency_dst,
      data.exchange_rate,
      currencyList
    );

    let amount_dst = await this.model.roundCurrency(
      data.currency_dst,
      data.amount / data.exchange_rate,
      currencyList
    );

    amount_dst = parseFloat(amount_dst);

    let summaryData = [
      {
        name: "From",
        key: "acc_src",
        value: data.accounts[data.acc_src].acc_name
          ? `${data.accounts[data.acc_src].acc_name} - ${data.acc_src}`
          : data.acc_src
      },
      {
        name: "To",
        key: "acc_dst",
        value: data.accounts[data.acc_dst].acc_name
          ? `${data.accounts[data.acc_dst].acc_name} - ${data.acc_dst}`
          : data.acc_dst
      },
      {
        name: "Send",
        key: "send",
        value: `${data.amount} ${data.accounts[data.acc_src].currency}`
      },
      {
        name: "Exchange rate",
        key: "exchange_rate",
        value:
          data.accounts[data.acc_src].currency ==
            data.accounts[data.acc_dst].currency
            ? 1
            : data.exchange_rate
      },
      {
        name: "Receive",
        key: "receive",
        value: `${amount_dst} ${data.accounts[data.acc_dst].currency}`
      },
      {
        name: "Description",
        key: "description",
        value: `${data.description}` || "",
        labelStyle: "font-weight: bold;"
      }
    ];

    Ext.create("Crm.modules.transfers.view.summaryWindow", {
      scope: this,
      summary_data: summaryData,
      confirm_action: { service: "account-service", method: "realmtransfer" },
      full_data: { data }
    });
  },

  validateForm() {
    let items = this.view
      .down("form")
      .getForm()
      .getFields().items;
    let arrWithEmptyFieldLabels = [];
    for (let item of items) {
      if (
        item &&
        item.config &&
        typeof item.config["allowBlank"] !== "undefined"
      )
        if (!!!item.config.allowBlank && !!!item.value)
          arrWithEmptyFieldLabels.push(
            item.config.fieldLabel ? item.config.fieldLabel : item.fieldLabel
          );
    }
    return arrWithEmptyFieldLabels.length == 0
      ? true
      : D.a(
        "Error",
        `Following fields are required: ${arrWithEmptyFieldLabels}`
      );
  },

  buildWarning(message, cb) {
    Ext.Msg.show({
      title: "Warning",
      message,
      buttons: Ext.Msg.OKCANCEL,
      icon: Ext.Msg.WARNING,
      fn: cb
    });
  }
});
