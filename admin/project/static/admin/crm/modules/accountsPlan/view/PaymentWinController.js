Ext.define("Crm.modules.accountsPlan.view.PaymentWinController", {
  extend: "Core.form.FormController",

  mixins: ["Crm.modules.accountsPlan.view.PaymentFunctions"],
  setControls: async function () {
    this.control({
      "[action=transfer]": {
        click: (b) => {
          this.sendPayment(b);
        }
      },
      "[name=plan_id]": {
        change: (el, val) => {
          if (!val) return;
          this.changePlan(val);
        }
      },
      "[name=amount]": {
        change: (el, val) => {
          this.calcAmounts(1, el);
        }
      },
      // "[name=result_amount]": {
      //   change: (el, val) => {
      //     this.calcAmounts(2, el);
      //   }
      // },
      "[name=internaltransfer]": {
        change: (el, val) => {
          this.handleInternalTransferCheckbox(val);
        }
      },
      "[action=formclose]": {
        click: () => {
          this.view.close();
        }
      },
      "[action=save_as_draft]": {
        click: () => {
          this.saveAsDraft();
        }
      },
      "[action=show_rejection_reason]": {
        click: () => {
          this.showRejectionReason();
        }
      }
    });
    this.calcLog = false;
    this.merchantModel = Ext.create(
      "Crm.modules.merchants.model.MerchantsNoaccModel"
    );
    this.clientModel = Ext.create(
      "Crm.modules.accountHolders.model.UsersModel"
    );
    this.notApprovedTrasnfers = Ext.create(
      "Crm.modules.transfers.model.NotApprovedTransfersModel"
    );
    this.swapLimits = await this.view.model.getSwapLimits();
    this.callParent(arguments);
  },
  async saveAsDraft() {
    const send_transfer_btn = this.view.down("[action=transfer]"),
      save_as_draft_btn = this.view.down("[action=save_as_draft]");
    let data = await this.preparePaymentData();
    send_transfer_btn.setDisabled(true);
    save_as_draft_btn.setDisabled(true);
    
    if (!data) {
      send_transfer_btn.setDisabled(false);
      save_as_draft_btn.setDisabled(false);
      return D.a(
        "Error",
        "Some addresses are not valid, please check and try again"
      );
    }

    data.id = this.view.down("[name=id]").getValue();
    data.is_draft = true;
    const result = await this.notApprovedTrasnfers.callServerMethod(
      "saveDraft",
      await this.buildPaymentForApprovingData(
        Object.assign(data, {
          rate: this.getNumberFromField("rate"),
          result_amount: this.getNumberFromField("result_amount"),
          fees: this.getNumberFromField("fees"),
          netto_amount: this.getNumberFromField("netto_amount"),
          currency: this.view.down("[name=currency]").text,
          result_currency: this.view.down("[name=result_currency]").text,
          field_name: this.view.field_name || ""
        })
      )
    );
    this.model.callServerMethod("updateGridData", {
      model_name: [
        "Crm.modules.independentTransfers.model.IndependentNotApprovedTransfersModel",
        "Crm.modules.transfers.model.NotApprovedTransfersModel"
      ]
    });
    Ext.toast("Draft saved");
    send_transfer_btn.setDisabled(false);
    save_as_draft_btn.setDisabled(false);
    if (this.view.cb) {
      this.view.cb(result.id);
    }
  },
  handleInternalTransferCheckbox(val) {
    const varsEl = this.view.down("[name=variables]");
    varsEl.internalTransfer = val;
  },

  async setValues(data) {
    this.merchantVars = [];
    let admin = await this.notApprovedTrasnfers.callServerMethod(
      "getAdminProfile"
    );
    if (admin.other_configs && !admin.other_configs.need_checker_widget)
      this.view.down("[action=save_as_draft]").setVisible(true);

    if (this.view.config.data) {
      this.view.config.data.tariff = this.view.config.data.tariff.id;
      this.view.config.data.plan_id = this.view.config.data.plan_id.id;
      this.view.config.data.merchant_id = this.view.config.data.merchant_id.id;

      data = this.view.config.data;
      if (data.last_rejection_reason)
        this.view.down("[action=show_rejection_reason]").setVisible(true);
      this.view.currentData = this.view.config.data;
      this.data = this.view.config.data;
      this.setTariffData({
        tariff: this.view.config.data.tariff,
        variables: this.view.config.data.variables
      });
      await this.changePlan(this.view.config.data.plan_id);

      return this.callParent(arguments);
    }
    this.view.currentData = data;
    this.data = data;
    let tariff_data = await this.getTariffAndVariables(
      this.merchantModel,
      data.merchant_id
    );
    if (tariff_data) {
      this.setTariffData(tariff_data);
      if (!tariff_data.tariff || !tariff_data.variables) {
        tariff_data = await this.getTariffAndVariables(
          this.clientModel,
          data.user_id
        );
        this.setTariffData(tariff_data);
      }
    }
    this.callParent(arguments);
  },

  setTariffData(data) {
    if (data.tariff && !this.view.down("[name=tariff]").getValue())
      this.view.down("[name=tariff]").setValue(data.tariff);
    if (
      data.variables &&
      !this.view.down("[name=variables]").getValue().length
    ) {
      this.view.down("[name=variables]").setValue(data.variables);
      this.merchantVars = data.variables;
    }
    return true;
  },

  getTariffAndVariables(model, id) {
    return new Promise((res) => {
      model.readRecord(id, async (data) => {
        if (data && (data.tariff || data.variables)) {
          res(data);
        }
        res(null);
      });
    });
  },

  async changePlan(val) {
    const plan_combo_store = this.view.down("[name=plan_id]").getStore();
    plan_combo_store.on("datachanged", async () => {
      await this.changePlan(val);
    });

    this.selectedPlanData;

    plan_combo_store.each((item) => {
      if (item.data.id == val) this.selectedPlanData = item.data;
    });
    if (this.selectedPlanData) {
      this.view
        .down("[name=internaltransfer]")
        .setHidden(
          !["manualtransfer", "innertransfer", "swap"].includes(
            this.selectedPlanData.description
          )
        );

      const currency = this.selectedPlanData.items[0].currency;
      const res_currency = this.selectedPlanData.items[
        this.selectedPlanData.items.length - 1
      ].currency;

      this.view.down("[name=currency]").setText(currency);
      this.view.down("[name=fees_currency]").setText(currency);
      this.view.down("[name=result_currency]").setText(res_currency);
      this.view.down("[name=netto_currency]").setText(currency);

      if (this.selectedPlanData.description == "swap") {
        [
          "swap_exchange_fee_currency",
          "swap_network_fee_currency",
          "swap_to_amount_currency"
        ].forEach((item) =>
          this.view.down(`[name=${item}]`).setText(res_currency)
        );
        this.setSwapFiledsHidden(false);
      } else {
        this.setSwapFiledsHidden(true);
      }

      let varsEl = this.view.down("[name=variables]");
      let variables = this.merchantVars;

      let outVars = [];

      for (let v of this.selectedPlanData.variables) {
        let f = true;
        for (let i = 0; i < variables.length; i++) {
          if (variables[i].key == v.key) {
            outVars.push(variables[i]);
            f = false;
            break;
          }
        }
        if (f) outVars.push(v);
      }

      varsEl.planCurrency = res_currency;

      varsEl.setValue(outVars);

      let acc_no;
      for (let v of variables) {
        if (v.key == `SRC_ACC_${currency}`) {
          acc_no = v.value;
        }
      }

      if (acc_no) {
        if (this.view.cb) return true;
        const balance = await this.view.model.getBalance(acc_no);
        if (balance) this.view.down("[name=amount]").setValue(balance);
      }
    }
  },

  calcAmounts(dir, el) {
    el.setValue(el.getValue().replace(",", "."));

    if (!el.validate()) this.view.down("[action=transfer]").setDisabled(true);
    else this.view.down("[action=transfer]").setDisabled(false);

    if (this.calcTm) clearTimeout(this.calcTm);
    this.calcTm = setTimeout(() => {
      this.calcAmounts_do(dir);
    }, 1000);
  },

  async calcAmounts_do(dir) {
    if (this.calcLog) {
      this.calcLog = false;
      return;
    }
    this.calcLog = true;
    const data = {
      currency_from: this.view.down("[name=currency]").text,
      currency_to: this.view.down("[name=result_currency]").text,
      merchant_id: this.view.down("[name=merchant_id]").getValue(),
      amount_from: 0,
      amount_to: 0
    };
    if (dir == 1) {
      data.amount_from = this.view.down("[name=amount]").getValue();
    } else {
      data.amount_to = this.view.down("[name=result_amount]").getValue();
    }

    data.rate = this.getRateFromVariables();

    const res = await this.view.model.calculateAmount(data);

    this.view.down("[name=rate]").setValue(res.rate);

    if (dir == 2) {
      this.view.down("[name=amount]").setValue(res.source);
    } else {
      this.view.down("[name=result_amount]").setValue(res.result);
    }

    if (this.selectedPlanData && this.selectedPlanData.description == "swap") {
      const exchange = await this.view.model.getCoinexExchangeRate({
        fromCurrency: data.currency_from,
        toCurrency: data.currency_to,
        fromAmount: data.amount_from
      });

      this.view.down("[name=swap_exchange_fee]").setValue(exchange.exchangeFee);
      this.view.down("[name=swap_network_fee]").setValue(exchange.networkFee);
      this.view.down("[name=swap_to_amount]").setValue(exchange.toAmount);
    }

    this.view.down("[name=fees]").setValue(res.fees);
    this.view.down("[name=netto_amount]").setValue(res.netto);
  },

  setSwapFiledsHidden(flag) {
    [
      "swap_exchange_fee_container",
      "swap_network_fee_container",
      "swap_to_amount_container"
    ].forEach((item) => this.view.down(`[name=${item}]`).setHidden(flag));
  },

  getRateFromVariables() {
    const vars = this.view.down("[name=variables]").getValue();
    for (let v of vars) {
      if (v.key == "EXCHANGE_RATE") return v.value;
    }
    return null;
  },

  async _checkReceiverForChain() {
    const vars = this.view.down("[name=variables]").getValue();

    let doCheck = false;
    let receiverAddress = null;

    for (const v of vars) {
      if (v.type == "merchant_addr_and_address_book") {
        receiverAddress = v.value;
        doCheck = true;
      }
    }

    if (!doCheck) {
      return true;
    }

    if (
      this.selectedPlanData.description == "manualtransfer" ||
      this.selectedPlanData.description == "innertransfer"
    ) {
      const addressCW = await this.view.model.getAddressFromBook({
        receiverAddress
      });

      const planMethod = this.selectedPlanData.items[
        this.selectedPlanData.items.length - 1
      ].method;

      if (!addressCW.result || !addressCW.result.send_via_chain_required) {
        return true;
      } else if (planMethod == "ccoin-service/sendViaChain") {
        return true;
      } else {
        return false;
      }
    }

    return true;
  },

  async sendPayment(b) {
    const data = await this.preparePaymentData();

    if (!data) {
      return D.a(
        "Error",
        "Some addresses are not valid, please check and try again"
      );
    }
    if (!data.plan_id) {
      return D.a(
        "Error",
        "Sorry, but you can't send a transfer without selecting a plan"
      );
    }
    if (b) {
      b.setDisabled(true);
    }

    if (!(await this._checkReceiverForChain())) {
      if (b) b.setDisabled(false);
      return D.a(
        "Error",
        "Transfer is possible only through a chain of addresses"
      );
    }
    let src_address = data.variables.find((el) => {
      return (
        el.key.includes(`FROM_${this.view.down("[name=currency]").text}`) ||
        el.key.includes(
          `FROM_INNER_${this.view.down("[name=currency]").text}`
        ) ||
        el.key.includes(`ADDR_${this.view.down("[name=currency]").text}`)
      );
    });
    if (src_address) {
      src_address = src_address.value;
      let checkSenderAddress = await this.view.model.callApi(
        "account-service",
        "checkNetworkFeeLimit",
        {
          address: src_address,
          currency: this.view.down("[name=currency]").text,
          result_currency: this.view.down("[name=result_currency]").text
        }
      );
      if (!checkSenderAddress || !checkSenderAddress.success) {
        if (b) {
          b.setDisabled(false);
        }
        switch (checkSenderAddress.code) {
          case "ONLYSWAPAVAILABLE": {
            return D.a(
              "Error",
              `Low balance on ${checkSenderAddress.data.currency} gas. Only swap USDT > ETH | USTR > TRX is available. You have a ${checkSenderAddress.data.gas_acc_balance}, limit is ${checkSenderAddress.data.network_fee_limit}. Please top up your gas balance.`
            );
          }
          case "INSUFFICIENTGASBALANCEFOROPERATIONS":
            return D.a(
              "Error",
              `Insufficient balance on ${checkSenderAddress.data.currency} gas. Available ${checkSenderAddress.data.gas_acc_balance} but limit is ${checkSenderAddress.data.network_fee_limit}`
            );
          default: {
            return D.a("Error", `Error occured while checking gas limits`);
          }
        }
      }
    }
    const sendTransfer = async (approver) => {
      let result = await this.view.model.callApi(
        "account-service",
        "createTransferForApproval",
        await this.buildPaymentForApprovingData(
          Object.assign(data, {
            id: this.view.down("[name=id]").getValue(),
            rate: this.getNumberFromField("rate"),
            result_amount: this.getNumberFromField("result_amount"),
            fees: this.getNumberFromField("fees"),
            netto_amount: this.getNumberFromField("netto_amount"),
            currency: this.view.down("[name=currency]").text,
            result_currency: this.view.down("[name=result_currency]").text,
            field_name: this.view.field_name || "",
            is_draft: false,
            approve_request: approver
          })
        )
      );

      if (b) {
        b.setDisabled(false);
      }
      if (!result.success) {
        return D.a("Error", "Not all required data was provided");
      }
      if (this.view.cb) {
        this.view.cb(result.id);
      }

      this.model.callServerMethod("updateGridData", {
        model_name: [
          "Crm.modules.independentTransfers.model.IndependentNotApprovedTransfersModel",
          "Crm.modules.transfers.model.NotApprovedTransfersModel"
        ]
      });
      Ext.toast(D.t("Transfer is waiting for approval"));

      this.view.close();
    };
    let me = this
    const approverWin = Ext.create("Ext.window.Window", {
      title: D.t("Please choose approver"),
      layout: "anchor",
      modal: true,
      closable: false,
      resizable: false,
      width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 400,
      height: 200,
      items: [
        {
          anchor: "100%",
          margin: 10,
          xtype: "combo",
          name: "approver",
          displayField: "name",
          valueField: "_id",
          allowBlank: false,
          store: await me.notApprovedTrasnfers.callServerMethod("getCheckers")
        }
      ],
      buttons: [
        {
          text: D.t("Send"),
          iconCls: "x-fa fa-check-square",
          handler: async () => {
            const approver_field = approverWin.down("[name=approver]");
            if (approver_field.isValid()) {
              await sendTransfer(approver_field.getValue());
              approverWin.close();
            }
          }
        },
        "->",
        {
          text: D.t("Close"),
          iconCls: "x-fa fa-ban",
          handler: async () => {
            approverWin.close();
            if (b) {
              b.setDisabled(false);
            }
          }
        }
      ]
    });
    approverWin.show();
  },

  async buildPaymentForApprovingData(data) {
    const maker = await this.notApprovedTrasnfers.callServerMethod(
      "getAdminProfile"
    );
    let approving_data = {
      plan_transfer_id: data.plan_transfer_id || null,
      merchant_id: data.merchant_id,
      amount: data.amount,
      fees: data.fees,
      netto_amount: data.netto_amount,
      rate: data.rate,
      result_amount: data.result_amount,
      currency: data.currency,
      result_currency: data.result_currency,
      plan_id: data.plan_id,
      ref_id: data.ref_id,
      tariff: data.tariff,
      variables: data.variables,
      description: data.description,
      status: 0,
      ctime: new Date(),
      mtime: new Date(),
      removed: 0,
      maker: maker._id,
      additional_order_data: {
        field_name: data.field_name
      },
      is_draft: data.is_draft
    };
    if (data.id) approving_data.id = data.id;
    if (data.approve_request)
      approving_data.approve_request = data.approve_request;
    return approving_data;
  },

  showRejectionReason() {
    let form = Ext.create("Ext.window.Window", {
      title: D.t("Rejection reason"),
      layout: "fit",
      modal: Ext.platformTags.phone,
      draggable: !Ext.platformTags.phone,
      alwaysOnTop: true,
      closable: true,
      resizable: !Ext.platformTags.phone,
      width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 400,
      height: Ext.platformTags.phone ? Ext.Element.getViewportHeight() : 500,
      items: [
        {
          xtype: "textarea",
          readOnly: true,
          value: this.view.down("[name=last_rejection_reason]").getValue()
        }
      ]
    });
    form.show();
  },

  getNumberFromField(field_name) {
    return Number(this.view.down(`[name=${field_name}]`).getValue());
  },

  validateAmountValue(value) {
    if (!this.selectedPlanData) return true;
    if (!value || Number(value) <= 0) return "Value must be more than 0";
    value = Number(value);
    if (
      this.selectedPlanData.description &&
      this.selectedPlanData.description == "swap" &&
      this.swapLimits &&
      this.swapLimits.length
    ) {
      const currency_pair = this.swapLimits.find((el) => {
        return (
          el.from == this.selectedPlanData.items[0].currency &&
          el.to ==
          this.selectedPlanData.items[this.selectedPlanData.items.length - 1]
            .currency
        );
      });

      if (!currency_pair) return true;

      if (currency_pair.tradeMin > value)
        return `Amount must be more than ${currency_pair.tradeMin}`;
    }
    return true;
  }
});
