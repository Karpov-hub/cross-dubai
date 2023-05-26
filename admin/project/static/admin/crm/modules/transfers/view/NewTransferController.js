Ext.define("Crm.modules.transfers.view.NewTransferController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=deposit]": {
        click: () => {
          this.deposit();
        }
      },
      "[name=acc]": {
        change: (a, b, c) => {
          this.changeAccount(a, b, c);
        }
      },
      "[name=option_bank]": {
        change: (a, b, c) => {
          this.changeBank(a, b, c);
        }
      },
      "[action=withdrawal]": {
        click: async () => {
          await this.showWidget();
        }
      },
      "[action=transfer]": {
        click: () => {
          this.transfer();
        }
      },
      "[name=merchant]": {
        change: (e, v) => {
          if (v) this.onchangeMerchant(v);
        }
      },
      "[action=bankcharge]": {
        click: () => {
          this.bankcharge();
        }
      },
      "[action=adjust_deposit]": {
        click: () => {
          this.adjustDeposit();
        }
      }
    });
    this.IbanModel = Ext.create("Crm.modules.banks.model.IBANModel");
    this.userModel = Ext.create("Crm.modules.accountHolders.model.UsersModel");
    this.merchantModel = Ext.create(
      "Crm.modules.merchants.model.MerchantsNoaccModel"
    );
    this.setMerchantTariff();
    this.callParent(arguments);
  },

  prepareData(data) {
    let out = { options: {} };
    Object.keys(data).forEach((k) => {
      if (k.substr(0, 7) == "option_") {
        out.options[k.substr(7)] = data[k];
      } else if (k == "acc") {
        out.acc_no = data[k];
      } else if (/^combobox/.test(k)) {
      } else {
        out[k] = data[k];
      }
    });
    return out;
  },

  async transfer() {
    const data = this.prepareData(this.view.down("form").getValues());

    const res = await this.view.model.callApi(
      "account-service",
      "realmtransfer",
      {
        acc_src: data.acc_src,
        acc_dst: data.acc_dst,
        amount: data.amount,
        description: data.description
      },
      data.realm,
      this.selectedUser
    );
    if (res && res.id) {
      await this.view.model.refreshData({
        modelName: this.view.model.$className
      });
      this.view.close();
    }
  },

  getAccIdByAccNo(acc_no) {
    let res;
    this.view
      .down("[name=acc]")
      .getStore()
      .each((item) => {
        if (item.data.acc_no == acc_no) res = item.data.id;
      });
    return res;
  },

  async changeAccount(elm, value) {
    this.selectedUser = null;
    const acc_id = this.getAccIdByAccNo(value);
    if (!acc_id) return;
    const { data } = elm.getStore().getById(acc_id);
    if (!data) return;
    this.setAccData(data);
  },

  async setAccData(data) {
    this.selectedUser = data.owner;
    this.view.down("[name=realm]").setValue(data.realm);
    this.view.down("[name=currency]").setValue(data.currency);

    this.view.down("[name=option_country]").setValue(data.country);
    const ibanCombo = this.view.down("[name=option_iban]");
    if (ibanCombo.getValue()) return;
    this.view
      .down("[name=option_full_name]")
      .setValue(`${data.first_name} ${data.last_name}`);
    const ibans = await this.IbanModel.getIbansByUserId(data.owner);
    if (ibans && ibans.list && ibans.list.length) {
      ibanCombo.getStore().loadData(ibans.list);
      ibanCombo.setValue(ibans.list[0].iban);
      this.view
        .down("[name=option_iban_currency]")
        .setValue(ibans.list[0].currency);
      this.view.down("[name=option_bank]").setValue(ibans.list[0].bank_id);
    }
  },

  changeBank(elm, value) {
    if (!/^[a-z0-9\-]{36}$/.test(value)) return;
    const { data } = elm.store.getById(value);
    if (!data) return;
    this.view.down("[name=option_swift]").setValue(data.swift);
    this.view.down("[name=option_corr_bank]").setValue(data.corr_bank);
    this.view.down("[name=option_corr_swift]").setValue(data.corr_swift);
    this.view.down("[name=option_corr_acc]").setValue(data.corr_acc);
  },

  setMerchantTariff() {
    this.tariffField = this.view.down("[name=tariff]");
    if (this.tariffField) this.tariffField.setReadOnly(true);
  },

  afterDataLoad(data, cb) {
    this.setTariffByUser();
    cb(data);
  },

  setTariffByUser() {
    const user_id = this.view.down("[name=user_id]").getValue();
    this.userModel.readRecord(user_id, async (merchant) => {
      if (merchant && merchant.tariff && this.tariffField) {
        this.tariffField.setValue(merchant.tariff);
        this.view.down("[name=variables]").setValue(merchant.variables);
        this.tariffOwnerModel = null;
        this.ownerId = null;
      }
    });
  },

  updateMerchantVariables(merchant) {
    return new Promise((res, rej) => {
      const vars = this.view.down("[name=variables]").getValue();
      const data = Ext.clone(merchant);
      data.variables = vars;

      const model = this.tariffOwnerModel || this.userModel;
      model.write(data, (data, err) => {
        if (data) {
          res(true);
        } else {
          res(false);
        }
      });
    });
  },

  restoreMerchantVariables(oldMerchant) {
    return new Promise((res, rej) => {
      const model = this.tariffOwnerModel || this.userModel;
      model.write(oldMerchant, (data, err) => {
        if (data) {
          res(true);
        } else {
          res(false);
        }
      });
    });
  },

  async onchangeMerchant(merchant_id) {
    this.merchantModel.readRecord(merchant_id, async (merchant) => {
      if (merchant && merchant.tariff) {
        this.tariffField.setValue(merchant.tariff);
        this.view.down("[name=variables]").setValue(merchant.variables);
        this.tariffOwnerModel = this.merchantModel;
        this.ownerId = merchant_id;
      } else {
        this.setTariffByUser();
      }
    });
  },

  getMerchantRecord() {
    return new Promise((res, rej) => {
      if (this.tariffOwnerModel) {
        this.tariffOwnerModel.readRecord(this.ownerId, (merchant) => {
          res(merchant);
        });
      } else {
        res(null);
      }
    });
  }
});
