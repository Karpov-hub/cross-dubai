Ext.define("Crm.modules.orders.view.OrdersFormController", {
  extend: "Core.form.FormController",

  init(view) {
    this.callParent(arguments);
    this.checkRecordOnDB(this.view.recordId);
  },

  setControls() {
    this.control({
      "[action=deposit]": {
        click: () => {
          this.depositForm();
        }
      },
      // "[action=withdrawal]": {
      //   click: () => {
      //     this.withdrawalForm();
      //   }
      // },
      "[action=send_pay_details]": {
        click: async () => {
          await this.sendPaymentDetails();
        }
      },
      "[name=merchant]": {
        change: (el, v) => {
          this.model.runOnServer(
            "getMerchantRealm",
            { id: el.valueCollection.items[0].data.id },
            (res) => {
              this.view.realmField.setValue(res.realm);
            }
          );
        }
      },
      "[action=currency_field]": {
        select: async (el, v) => {
          await this.changeDecimal(v);
        }
      },
      "[name=res_currency]": {
        change: async (e, v) => {
          await this.checkCurr(v);
        }
      },
      "[name=organisation]": {
        change: async (e, v) => {
          this.checkOrg(v);
        }
      },
      // "[action=bankcharges]": {
      //   click: () => {
      //     this.bankchargesForm();
      //   }
      // },
      "[action=inner_transfer]": {
        click: () => {
          this.innerTransfer();
        }
      },
      // "[action=get_advertising_report]": {
      //   click: () => {
      //     this.getAdvertisingReport();
      //   }
      // },
      // "[action=select_contractor]": {
      //   click: () => {
      //     this.createSelectContractor();
      //   }
      // },
      // "[action=invoice]": {
      //   click: () => {
      //     this.createInvoiceForm();
      //   }
      // },
      "[action=move_transfers]": {
        click: () => {
          this.moveTransfersForm();
        }
      },
      "[action=plan_transfer]": {
        click: () => {
          this.planTransfer();
        }
      },
      "[action=apply]": {
        click: async () => {
          await this.checkAndSaveOrder(false, () => {});
        }
      },
      "[action=save]": {
        click: async () => {
          await this.checkAndSaveOrder(true, () => {});
        }
      },
      "[action=formclose]": {
        click: () => {
          this.closeView();
        }
      },
      "[action=remove]": {
        click: () => {
          this.deleteRecord_do(true);
        }
      },
      "[name=date_from]": {
        change: (el, v) => {
          this.setLastDayOfCurrentMonth(v);
        }
      }
      // "[name=contract_id]": {
      //   change: (el) => {
      //     if (
      //       el &&
      //       el.lastSelection &&
      //       el.lastSelection[0] &&
      //       el.lastSelection[0].data &&
      //       el.lastSelection[0].data.id
      //     )
      //       this.setRealmOrganization(el.lastSelection[0].data.id);
      //   }
      // },
      // "[action=get_custom_advertising_report]": {
      //   click: () => {
      //     this.getCustomAdvertisingReport();
      //   }
      // }
    });
    this.view.on("beforeSave", () => {});
    this.view.on("save", () => {
      this.view.down("[action=transfers_panel]").setDisabled(false);
      // this.view.down("[action=send_pay_details]").setDisabled(false);
      // this.view.down("[action=select_contractor]").setDisabled(false);
      // this.view.down("[action=invoice]").setDisabled(false);
      // this.view.down("[action=get_advertising_report]").setDisabled(false);
      // this.view
      //   .down("[action=get_custom_advertising_report]")
      //   .setDisabled(false);
    });
    this.TransferModel = Ext.create(
      "Crm.modules.transfers.model.TransfersModel"
    );
    this.MerchantModel = Ext.create(
      "Crm.modules.merchants.model.MerchantsModel"
    );
    this.UserModel = Ext.create("Crm.modules.accountHolders.model.UsersModel");

    if (!this.view.down("[name=date_to]").getValue())
      this.setLastDayOfCurrentMonth(
        this.view.down("[name=date_from]").getValue()
      );
  },

  setLastDayOfCurrentMonth(date) {
    date = new Date(date);
    this.view
      .down("[name=date_to]")
      .setValue(new Date(date.getFullYear(), date.getMonth() + 1, 0));
  },

  // async setRealmOrganization(contract_id) {
  //   let organization_data = await this.model.getRealmOrganizationByContract(
  //     contract_id
  //   );
  //   return this.view
  //     .down("[name=realm_department]")
  //     .setValue(organization_data.realm_department_id);
  // },

  createSelectContractor() {
    const vals = this.view.down("form").getValues();
    Ext.create("Crm.modules.contractors.view.ContractorWindow", {
      scope: this,
      order_data: vals
    });
  },

  // async createInvoiceForm() {
  //   const vals = this.view.down("form").getValues();
  //   if (!(await this.checkContract(vals.contract_id))) {
  //     return D.a("Error", "You cannot create invoice. Contract terminated");
  //   }
  //   Ext.create("Crm.modules.orders.view.InvoiceWindow", {
  //     scope: this,
  //     order_data: vals
  //   });
  // },

  innerTransfer() {
    const form = Ext.create("Crm.modules.transfers.view.InnerTransferForm");
    const vals = this.view.down("form").getValues();

    const data = {
      user_id: vals.merchant,
      merchant: vals.organisation,
      ref_id: vals.id
      // realm_department: vals.realm_department
    };

    form.controller.setValues(data);
  },

  // bankchargesForm() {
  //   const form = Ext.create("Crm.modules.transfers.view.BankChargesForm");
  //   const vals = this.view.down("form").getValues();

  //   const data = {
  //     user_id: vals.merchant,
  //     realm_id: vals.realm_department,
  //     merchant_id: vals.organisation,
  //     ref_id: vals.id,
  //     to_currency: "EUR"
  //   };
  //   form.controller.setValues(data);
  // },

  // async checkContract(contract_id) {
  //   this.view.down("[action=invoice]").setDisabled(false);
  //   return await this.model.checkContract({ contract_id });
  // },

  async checkOrg(org_id) {
    if (!org_id) return 0;
    const Deposit = this.view.down("[action=deposit]");
    // const Withdrawal = this.view.down("[action=withdrawal]");
    // const Bankcharges = this.view.down("[action=bankcharges]");
    // const Exchange = this.view.down("[action=exchange]");
    const Merchant = this.view.down("[name=merchant]");
    const mw = this.view.down("[name=merchant_website]");
    const mow = this.view.down("[name=merchant_owebsites]");

    this.merchant = await this.MerchantModel.getMerchantById({ id: org_id });
    if (!mw.getValue()) mw.setValue(this.merchant.website);
    if (!mow.getValue()) mow.setValue(this.merchant.other_websites);

    if (this.merchant && this.merchant.id) {
      const res = await this.UserModel.getUserById({
        id: this.merchant.user_id
      });
      Merchant.setValue(res.id);
    }

    Deposit.setDisabled(!this.merchant.active);
    // Withdrawal.setDisabled(!this.merchant.active);
    if (this.checkStatus(this.status) == "COMPLETED") {
      // Withdrawal.setDisabled(true);
      Deposit.setDisabled(true);
      // Bankcharges.setDisabled(true);
      // Exchange.setDisabled(true);
    }
  },

  async buildWarning(message, cb) {
    Ext.Msg.show({
      title: "Warning",
      message,
      buttons: Ext.Msg.OKCANCEL,
      icon: Ext.Msg.WARNING,
      fn: cb
    });
  },

  async checkAndSaveOrder(closeWin, cb) {
    const formData = this.view
      .down("form")
      .getForm()
      .getValues();

    if (!this.merchant.active) {
      return cb(D.a("Merchant is not active", "Select an active Merchant"));
    }
    if (
      this.userGroup == "lawyers" &&
      this.view.down("[name=status]").getValue() !== 3
    ) {
      return cb(
        D.a(
          "Error",
          "You do not have permissions to save order with this status"
        )
      );
    }

    // if (
    //   !(await this.checkContract(formData.contract_id)) &&
    //   [1, 3].includes(formData.status)
    // ) {
    //   return cb(
    //     D.a(
    //       "Error",
    //       "You cannot save this order in this status. Contract terminated"
    //     )
    //   );
    // }

    if (await this.model.checkOngoingOrder(formData))
      await this.buildWarning(
        "Do you really want to create an ongoing order with this contract and recipient? This action will complete the existing order",
        async (order_result) => {
          if (
            order_result === "ok" &&
            (await this.model.checkOrderNumber(formData))
          )
            await this.buildWarning(
              "Do you really want to create an order with this number? This number is already in use",
              async (num_exist_result) => {
                if (num_exist_result === "ok") this.save(closeWin, cb);
              }
            );
          else if (order_result === "ok") this.save(closeWin, cb);
        }
      );
    else if (await this.model.checkOrderNumber(formData))
      await this.buildWarning(
        "Do you really want to create an order with this number? This number is already in use",
        async (num_exist_result) => {
          if (num_exist_result === "ok") this.save(closeWin, cb);
        }
      );
    else this.save(closeWin, cb);
  },

  save: async function(closewin, cb) {
    console.log("IM I CALLED??????")
    this.callParent(arguments);
  },

  async checkCurr(v) {
    let merchant_id = this.view.down("[name=organisation]").getValue();
    const externalWalletCrypto = this.view.down(
      "[name=external_wallet_crypto]"
    );
    const externalWalletIban = this.view.down("[name=external_wallet_iban]");
    if (!externalWalletCrypto || !externalWalletIban) {
      return 0;
    }
    externalWalletCrypto.store.exProxyParams.currency = v;
    externalWalletCrypto.store.exProxyParams.org = merchant_id;
    externalWalletCrypto.setValue("");

    let res = await this.TransferModel.getCurrency({
      abbr: v
    });

    if (res.crypto) {
      let wallet = await this.TransferModel.getWallet({
        merchant: merchant_id,
        currency: v
      });
      if (wallet && wallet.length) {
        externalWalletCrypto.setValue(wallet[0].num);
      }
      externalWalletIban.setHidden(1);
      externalWalletCrypto.setHidden(0);
    } else {
      let iban = await this.TransferModel.getIban({
        merchant: merchant_id,
        currency: v
      });
      if (iban && iban.length) {
        externalWalletIban.setValue(iban[0].name);
      }
      externalWalletCrypto.setHidden(1);
      externalWalletIban.setHidden(0);
    }
  },
  async changeDecimal(currency) {
    let old_currency = this.view.down("[action=old_currency]").getValue();
    if (old_currency !== currency.data.abbr) {
      let data = this.view
        .down("form")
        .getForm()
        .getValues();
      let el = await this.view.down("[action=amount_panel]");
      el.remove(0);
      await this.refreshAmountField(data, currency.data.abbr);
      this.view.down("[action=old_currency]").setValue(currency.data.abbr);
    }
  },

  depositForm() {
    const vals = this.view.down("form").getValues();
    const data = {
      user_id: vals.merchant,
      merchant: vals.organisation,
      ref_id: vals.id,
      amount: vals.amount,
      currency: vals.currency,
      description: ""
    };
    const form = Ext.create("Crm.modules.transfers.view.DepositForm", {
      orderData: data
    });
    form.controller.setValues(data);
  },

  moveTransfersForm() {
    const form = Ext.create("Crm.modules.transfers.view.MoveTransferForm", {
      scope: this
    });
    const vals = this.view.down("form").getValues();

    const data = {
      ref_id: vals.id,
      organisation: vals.organisation
    };
    form.controller.setValues(data);
  },

  // withdrawalForm() {
  //   const form = Ext.create("Crm.modules.transfers.view.WithdrawalForm");
  //   const vals = this.view.down("form").getValues();
  //   const data = {
  //     user_id: vals.merchant,
  //     merchant: vals.organisation,
  //     merchant_id: vals.organisation,
  //     ref_id: vals.id,
  //     description: `Order #${vals.id}`
  //   };
  //   form.controller.setValues(data);
  // },

  planTransfer() {
    const vals = this.view.down("form").getValues();
    const form = Ext.create("Crm.modules.accountsPlan.view.PaymentWin", {
      merchant_id: vals.organisation,
      client_id: vals.merchant,
      tag: "AD Order"
    });
    const data = {
      user_id: vals.merchant,
      merchant: vals.organisation,
      merchant_id: vals.organisation,
      ref_id: vals.id
    };
    form.controller.setValues(data);
  },

  checkRecordOnDB(id) {
    this.model.runOnServer("checkRecord", { id }, (res) => {
      if (res && res.id) {
        this.view.down("[action=transfers_panel]").setDisabled(false);
        // this.view.down("[action=send_pay_details]").setDisabled(false);
        // this.view.down("[action=select_contractor]").setDisabled(false);
        // this.view.down("[action=invoice]").setDisabled(false);
        // this.view.down("[action=get_advertising_report]").setDisabled(false);
        // this.view
        //   .down("[action=get_custom_advertising_report]")
        //   .setDisabled(false);
      }
    });
  },

  buildSetValuesData(crm_path) {
    let v = this.view.down("form").getValues();
    let out = {};
    Object.keys(v).forEach((k) => {
      out["order_" + k] = v[k];
    });
    return out;
  },

  openForm(crm_path) {
    let formData = this.buildSetValuesData(crm_path);
    let form = Ext.create(crm_path);
    form.show();
    form.controller.setValues(formData);
    return;
  },

  async refreshAmountField(data, currency) {
    let el = await this.view.down("[action=amount_panel]");
    let currencyList = await this.model.getCurrrencyList();
    let curr = currency ? currency : data.currency;
    if (data.amount) {
      data.amount = data.amount.replace(",", ".");
      data.amount = await this.model.roundCurrency(
        curr,
        data.amount,
        currencyList
      );
    }

    let thisCurr = currencyList.find((item) => item.abbr == data.currency);

    let amountField = new Ext.form.field.Number({
      name: "amount",
      allowDecimals: true,
      decimalPrecision: thisCurr ? thisCurr.decimal : null,
      action: "amount_field",
      minValue: 0,
      value: data ? data.amount : null,
      hideTrigger: true,
      keyNavEnabled: false,
      mouseWheelEnabled: false,
      margin: "0 10 0 0"
    });
    el.insert(0, amountField);
    return;
  },

  async setValues(data) {
    this.status = data.status;
    data.old_currency = data.currency;
    if (this.checkStatus(data.status) == "COMPLETED") {
      // this.view.down("[action=withdrawal]").setDisabled(true);
      this.view.down("[action=deposit]").setDisabled(true);
    }

    if (!this.status) this.view.down("[name=status]").setValue(3);

    // if (
    //   this.status == 2 ||
    //   (this.status == 3 &&
    //     new Date().setHours(0, 0, 0, 0) >
    //       new Date(data.date_to).setHours(0, 0, 0, 0))
    // )
    //   this.view.down("[action=invoice]").setDisabled(true);

    await this.refreshAmountField(data);
    this.callParent(arguments);
    // check user group 'lawyers' for denying some functionality
    this.userGroup = await this.model.getUserGroup();
    if (this.userGroup.includes("lawyers")) {
      let order_statuses = this.view.down("[name=status]");
      if (!order_statuses.getValue()) {
        order_statuses = order_statuses.getStore();
        order_statuses.removeAt(order_statuses.find("Ongoing", 0));
        order_statuses.removeAt(order_statuses.find("Completed", 1));
      }
    }

    const hasTransfers = await this.model.checkTransfers({ order_id: data.id });
    this.view.down("[action=remove]").setDisabled(hasTransfers);
  },

  checkStatus(status) {
    if (Number(status) === 2 || Number(status) === 3) {
      return "COMPLETED";
    }
  },

  async sendPaymentDetails() {
    let orderData = this.view.down("form").getValues();
    let payment_details = await this.prepareDetails(orderData);
    if (!payment_details)
      return D.a(D.t("Error"), D.t("Payment details not found"));
    let data = await this.prepareData(payment_details);
    let res = await this.model.callApi(
      "mail-service",
      "send",
      data,
      this.view.merchantCombo.displayTplData[0].realm.id
    );
  },
  async prepareData(payment_details) {
    return {
      to: this.view.merchantCombo.displayTplData[0].email,
      code: "payment-details",
      body: {
        payment_details: payment_details
      }
    };
  },

  async prepareDetails(orderData) {
    let collections = ["merchants", "users", "realms"];
    for (collection of collections) {
      let detailsObj = await this.model.findPaymentDetails({
        orderData,
        collection
      });
      if (detailsObj && detailsObj.payment_details) {
        return detailsObj.payment_details;
      }
    }
  },

  async getOrderDataForAdvertisingReport() {
    const orderData = this.view.down("form").getValues();
    let websites = orderData.merchant_website;
    if (orderData.merchant_owebsites)
      websites = websites + ", " + orderData.merchant_owebsites;
    return {
      ad_data: {
        websites: websites || "Not specified",
        order_id: orderData.id,
        merchant_id: orderData.organisation,
        report_name: "AdvertisingReport",
        format: "pdf"
      },
      orderData
    };
  },

  async getCustomAdvertisingReport() {
    const data = await this.getOrderDataForAdvertisingReport();
    Ext.create("Crm.modules.orders.view.CustomAdvertisingForm", {
      scope: this,
      order_data: data.ad_data,
      order_form_data: data.orderData
    });
  },

  async getAdvertisingReport() {
    const data = await this.getOrderDataForAdvertisingReport();
    Ext.create("Crm.modules.orders.view.AdvertisingForm", {
      scope: this,
      order_data: data.ad_data
    });
  }
});
