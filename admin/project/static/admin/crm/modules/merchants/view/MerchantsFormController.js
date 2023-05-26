Ext.define("Crm.modules.merchants.view.MerchantsFormController", {
  extend: "Core.form.FormControllerWithConfirmActive",

  setControls() {
    this.control({
      "[action=update_btn]": {
        click: () => {
          this.fillAccounts();
        }
      },
      "[action=add_accounts]": {
        click: () => {
          let mask = new Ext.LoadMask({
            msg: D.t("Loading..."),
            target: this.view
          });
          let data = this.view.down("form").getValues();
          this.buildAddForm(
            { owner: data.user_id },
            "Crm.modules.merchants.view.OrgsUserAccountsForm",
            async (res) => {
              mask.show();
              data.accounts = this.getAccountsFromGrid();
              data.accounts.push(res.id);
              data.address = res.address;
              await this.model.attachAccountToMerchant(data);
              this.fillAccounts();
              mask.hide();
            }
          );
        }
      },
      "[action=gentoken]": {
        click: () => {
          this.genToken("token");
        }
      },
      "[action=gensecret]": {
        click: () => {
          this.genToken("secret");
        }
      },
      "[action=checkVAT]": {
        click: () => {
          this.checkVAT();
        }
      },
      "[name=user_id]": {
        change: async () => {
          await this.setAccs();
        }
      }
    });

    this.view.on("beforeSave", (el, data) => {
      data.accounts = this.getAccountsFromGrid();
    });

    this.callParent(arguments);
    
    this.realmModel = Ext.create("Crm.modules.realm.model.RealmModel");
  },

  async checkVAT() {
    let form = this.view.down("form").getValues();
    let cb = Ext.getCmp("circle_btn");
    let data = {
      country_code: form.country,
      vat_num: form.vat
    };

    if (data.country_code && data.vat_num) {
      let res = {};
      try {
        res = await this.model.callApi(
          "auth-service",
          "checkVAT",
          data,
          null,
          null
        );
      } catch (error) {}

      if (res.valid) {
        cb.removeCls("red_circle_btn");
        cb.removeCls("orange_circle_btn");
        cb.addCls("green_circle_btn");
      } else {
        cb.removeCls("green_circle_btn");
        cb.removeCls("orange_circle_btn");
        cb.addCls("red_circle_btn");
      }
    } else cb.addCls("orange_circle_btn");
  },

  buildAddForm(data, form, cb) {
    let addForm = Ext.create(form, {
      callback: async (res) => {
        cb(res);
      }
    });
    addForm.show();
    addForm.controller.setValues(data);
  },

  setViewButtons(flag) {
    this.view.down("[action=apply]").setDisabled(flag);
    this.view.down("[action=save]").setDisabled(flag);
  },

  async setAccs() {
    this.setViewButtons(1);
    Promise.all([this.fillAccounts()]).then((values) => {
      if (values.every((el) => el.success)) {
        setTimeout(() => {
          this.model.getPermissions((permis) => {
            if (!permis.modify && !permis.add) {
              el = this.view.down("[action=apply]");
              if (el) el.setDisabled(true);
              el = this.view.down("[action=save]");
              if (el) el.setDisabled(true);
            } else this.setViewButtons(false);
          });
        }, 500);
      }
    });
  },

  updateAccountsAndAddressesGridData(tab, newItem) {
    newItem.items.items[0].store.reload();
    return true;
  },

  setValues(data) {
    //технические поля для фильтрации гридов на вкладке Accounts & Addresses
    data.user_wallets = 0;
    data.monitor_wallets = 1;

    this.callParent(arguments);
    this.view.down("[name=merchants_tabpanel]").setActiveTab(0);
    this.view.down("[name=accounts_and_addresses_panel]").setActiveTab(0);
    this.view
      .down("[name=accounts_and_addresses_panel]")
      .on("tabchange", this.updateAccountsAndAddressesGridData);
    if (
      window.location.hash.substring(
        window.location.hash.lastIndexOf("#") + 1,
        window.location.hash.lastIndexOf("~")
      ) == "Crm.modules.accountHolders.view.UsersForm"
    )
      this.view.merchantCombo.setReadOnly(true);
    this.checkVAT();
  },

  genToken(name) {
    this.realmModel.generateToken((token) => {
      if (token) {
        this.view.down(`[name=${name}]`).setValue(token);
      }
    });
  },

  async fillAccounts() {
    const el = this.view.down("grid");
    let currencyList = await this.model.getCurrrencyList();
    el.getStore().removeAll();
    return new Promise((resolve) => {
      this.model.getAccounts(
        this.view.down("[name=user_id]").getValue(),
        this.view.down("[name=id]").getValue(),
        async (accounts) => {
          for (const acc of accounts) {
            acc.balance = await this.model.roundCurrency(
              acc.currency,
              acc.balance,
              currencyList
            );
          }
          el.getStore().loadData(accounts);
          accounts.forEach(async (acc, i) => {
            if (!!acc.id_merchant) el.getSelectionModel().select(i, true);
          });

          resolve({ success: true });
        }
      );
    });
  },
  getAccountsFromGrid() {
    const out = [];
    this.view
      .down("grid")
      .getStore()
      .each((item) => {
        out.push(item.data.id);
      });
    return out;
  },

  copyAddressToClibboard(grid, rowIdx, colIdx, item, e, record) {
    navigator.clipboard.writeText(record.data.address);
    Ext.toast(D.t("Address copied to clipboard"));
  }
});
