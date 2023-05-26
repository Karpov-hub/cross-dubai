Ext.define("Crm.modules.transfers.view.DepositController", {
  extend: "Crm.modules.transfers.view.NewTransferController",

  async setControls() {
    this.control({
      "[name=acc_no]": {
        change: (el, v) => {
          this.onAccChange(el, v);
        }
      },
      "[name=amount]": {
        change: (el, v) => {
          this.checkNegativeAmount(v);
        }
      },
      "[name=deposit_date]": {
        change: (el, v) => {
          this.view.down("[action=deposit]").setDisabled(v > new Date());
        }
      },
      "[name=show_to_client]": {
        change: (el, v) => {
          this.setVisibilityOfExpirationDateTime(!v);
        }
      },
      "[name=date_invisibility_exp_date]": {
        change: (el, v) => {
          this.limitTimeField(v);
        }
      },
      "[name=time_invisibility_exp_date]": {
        change: (el, v) => {
          this.setValidationOnDate(v);
        }
      }
    });

    if (this.view.down("[action=deposit]"))
      this.view.down("[action=deposit]").setHidden(1);
    if (this.view.down("[action=adjust_deposit]"))
      this.view.down("[action=adjust_deposit]").setHidden(1);
    this.callParent(arguments);
  },

  setValidationOnDate(v) {
    if (v)
      this.view.down("[name=date_invisibility_exp_date]").allowBlank = false;
  },

  limitTimeField(date) {
    if (
      Ext.Date.format(new Date(date), "d.m.Y") ==
      Ext.Date.format(new Date(), "d.m.Y")
    )
      return this.view
        .down("[name=time_invisibility_exp_date]")
        .setMinValue(new Date());
    return this.view
      .down("[name=time_invisibility_exp_date]")
      .setMinValue(null);
  },

  setVisibilityOfExpirationDateTime(visible) {
    this.view.down("[name=date_invisibility_exp_date]").setVisible(visible);
    this.view.down("[name=time_invisibility_exp_date]").setVisible(visible);
    this.view.down("[name=date_invisibility_exp_date]").setDisabled(!visible);
    this.view.down("[name=time_invisibility_exp_date]").setDisabled(!visible);
  },

  setValues(data) {
    this.callParent(arguments);

    if (data && data.transfer_data && data.transfer_data.bank)
      this.view.down("[name=option_bank]").setValue(data.transfer_data.bank.id);
    if (!this.view.down("[name=is_adjust]").getValue())
      this.view.down("[action=deposit]").setHidden(0);
    else this.view.down("[action=adjust_deposit]").setHidden(0);
  },

  onAccChange(el, v) {
    el.getStore().each((r) => {
      if (r.data.acc_no == v) {
        this.view.down("[name=currency]").setValue(r.data.currency);
        this.refreshAmountField(r.data.currency);
      }
    });
  },

  async getCurrencyDecimalList() {
    return await this.model.callApi(
      "merchant-service",
      "getListCurrencyDecimal",
      {}
    );
  },

  async refreshAmountField(currency) {
    const listCurrencyDecimal = await this.getCurrencyDecimalList();
    const Amount = this.view.down("[name=amount]");
    Amount.decimalPrecision = listCurrencyDecimal[currency];
    Amount.setValue(Amount.getValue().toFixed(listCurrencyDecimal[currency]));
  },

  async deposit() {
    if (!this.view.down("form").isValid()) return;
    const data = this.prepareData(this.view.down("form").getValues());
    if (!data.show_to_client)
      data.invisibility_exp_date = data.time_invisibility_exp_date
        ? new Date(
            `${data.date_invisibility_exp_date} ${data.time_invisibility_exp_date}`
          )
        : new Date(data.date_invisibility_exp_date);
    data.amount = parseFloat(data.amount.replace(",", "."));

    this.userModel.readRecord(data.user_id, async (merchant) => {
      if (!merchant || !merchant.realm) return;

      data.variables = this.view.down("[name=variables]").getValue();

      this.view.org.getStore().each((item) => {
        if (item.data.id == data.merchant)
          data.organisation_name = item.data.name;
      });
      this.view
        .down("[name=option_bank]")
        .combo.getStore()
        .each((item) => {
          if (item.data.id == data.options.bank) {
            data.bank_name = item.data.name;
          }
        });
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
            value: data.organisation_name || ""
          },
          {
            name: "To account",
            key: "acc_no",
            value: `${data.acc_no} ${data.currency}` || ""
          },
          {
            name: "Amount",
            key: "amount",
            value: `${data.amount} ${data.currency}` || ""
          },
          {
            name: "Bank",
            key: "bank_name",
            value: data.bank_name || "",
            labelStyle: "font-weight: bold"
          },
          {
            name: "Description",
            key: "description",
            value: `${data.description}` || "",
            labelStyle: "font-weight: bold;"
          },
          {
            name: "Deposit date",
            key: "deposit_date",
            value: `${data.deposit_date}` || "",
            labelStyle: "font-weight: bold;"
          }
          // {
          //   name: "Do not generate invoice",
          //   key: "without_invoice",
          //   value: `${data.without_invoice ? "on" : "off"}`,
          //   labelStyle: "font-weight: bold;"
          // }
        ];
        // check for files & push in summary window
        if (data.files && Array.isArray(data.files) && data.files.length) {
          for (const f of data.files) {
            if (data.files[0] == f) {
              summaryData.push({
                name: "Attached files",
                key: "attached_files",
                value: `${f.name}`,
                labelStyle: "font-weight: bold;"
              });
            } else {
              summaryData[summaryData.length - 1].value += `, ${f.name}`;
            }
          }
        }
        Ext.create("Crm.modules.transfers.view.summaryWindow", {
          scope: this,
          summary_data: summaryData,
          confirm_action: { service: "account-service", method: "deposit" },
          full_data: { data, merchant }
        });
      }
    });
  },

  async adjustDeposit() {
    const data = this.prepareData(this.view.down("form").getValues());
    let realm_id = await this.model.getDefaultRealm();
    const res = await this.model.callApi(
      "account-service",
      "removeDeposit",
      data,
      data.user_id,
      realm_id
    );

    if (res && res.success) this.deposit();
    else return D.a("Error", "Something went wrong");
  },

  checkNegativeAmount(amount) {
    this.view
      .down("[action=deposit]")
      .setDisabled(Number(amount) >= 0 ? !Number(amount) : Number(amount));
  }
});
