Ext.define("Crm.modules.accounts.view.AccountsFormController", {
  extend: "Core.form.FormControllerWithConfirmActive",

  setControls() {
    this.control({
      "[action=mwallet]": {
        click: () => {
          this.bindMonitoringWallet();
        }
      },
      "[action=custom_save]": {
        click: async () => {
          let me = this;
          let data = this.view
            .down("form")
            .getForm()
            .getValues();

          if (data.address && data.currency) {
            let res = await this.model.callApi(
              "ccoin-service",
              "validateAddress",
              {
                address: data.address,
                currency: data.currency,
              }
            )
            if (!res.valid) {
              D.a(
                "Error",
                "Invalid crypto address.",
              );
              return;
            }
          };

          this.model.bindMonitoringWallet(
            this.view
              .down("form")
              .getForm()
              .getValues(),
            async () => {
              if (!data.status || data.status != 1)
                await this.rebindAccount(data);
              me.save(true);
            }
          );
        }
      }
    });

    // this.view.on("beforesave", async (view, data) => {
    // });
    this.callParent(arguments);
  },

  crypto_address: null,

  async setValues(data) {
    if (window.__CB_REC__) {
      Ext.apply(data, __CB_REC__);
      window.__CB_REC__ = null;
      this.view.s = true;
    }
    data.balance = await this.model.roundCurrency(
      data.currency,
      data.balance,
      await this.model.getCurrrencyList()
    );
    this.crypto_address = data.crypto_address;
    data.address = data.crypto_address;

    this.view.currentData = data;
    var form = this.view.down("form");
    this.view.fireEvent("beforesetvalues", form, data);
    form.getForm().setValues(data);
    this.view.fireEvent("setvalues", form, data);
  },

  bindMonitoringWallet() {
    this.model.bindMonitoringWallet(
      this.view.down("form").getValues(),
      (res) => {
        this.copyToClipboard(res.address);
        D.a(
          "Monitoring wallet",
          "Copied to clipboard<br>%s",
          [res.address],
          () => { }
        );
      }
    );
  },

  copyToClipboard(str) {
    const el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  },

  async rebindAccount(form_data) {
    let data = Object.assign({}, form_data);
    data.crypto_address = this.crypto_address;
    let rebinding_result = await this.model.findAccountForRebind(data);
    if (
      rebinding_result.status == "MERCH_NOT_FOUND" ||
      rebinding_result.status == "ACCOUNT_ALREADY_DEACTIVATED"
    ){return};

    if (rebinding_result.status == "MERCHANT_DONT_HAVE_ANY_ACCOUNTS") {
      return await this.addNewAccount(
        rebinding_result,
        "Merchant dont have any accounts. Do you want to create new?",
        data
      );
    };
    
    if (rebinding_result.success){return};
  },

  async addNewAccount(rebinding_result, msg, data) {
    let res = await this.addAccount(
      msg,
      data.owner,
      rebinding_result.merchant_id,
      data.currency
    );
    return await this.model.rebindAccount({
      old_acc: {
        id: data.id,
        acc_no: data.acc_no,
        owner: data.owner,
        crypto_address: this.crypto_address
      },
      new_acc: {
        id: res.acc_data.id,
        acc_no: res.acc_data.acc_no,
        crypto_address: res.acc_data.crypto_address
      }
    });
  },

  addAccount(msg, client, merchant, currency) {
    return new Promise((resolve) => {
      D.c("Account not exist", msg, [], () => {
        let form = Ext.create(
          "Crm.modules.merchants.view.OrgsUserAccountsForm",
          {
            callback: async (added_acc) => {
              let new_acc_data = await this.model.bindAccToMerchant({
                id: added_acc.id,
                merchant
              });
              return resolve(new_acc_data);
            }
          }
        );
        form.show();
        form.controller.setValues({ owner: client, currency });
      });
    });
  }
});
