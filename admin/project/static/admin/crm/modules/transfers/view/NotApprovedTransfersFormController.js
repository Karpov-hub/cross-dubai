Ext.define("Crm.modules.transfers.view.NotApprovedTransfersFormController", {
  extend: "Core.form.FormController",

  mixins: ["Crm.modules.accountsPlan.view.PaymentFunctions"],

  setControls() {
    this.control({
      "[action=approve]": {
        click: async () => {
          await this.checkAmountsAndSendTransfer();
        }
      },
      "[action=reject]": {
        click: async () => {
          this.rejectTransfer();
        }
      },
      "[action=delete]": {
        click: async () => {
          this.deleteRecord_do(true);
        }
      }
    });

    this.callParent(arguments);
  },

  rejectTransfer() {
    const me = this,
      reject_form = Ext.create("Ext.window.Window", {
        title: D.t("Reject Transfer"),
        width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 500,
        height: Ext.platformTags.phone ? Ext.Element.getViewportHeight() : 500,
        layout: "fit",
        modal: true,
        resizable: false,
        items: [
          {
            xtype: "textarea",
            name: "reason",
            emptyText: D.t("Enter reason here")
          }
        ],
        buttons: [
          {
            text: D.t("Send"),
            action: "send_rejection_message",
            handler: async (el) => {
              el.setDisabled(true);
              await me.model.callApi(
                "account-service",
                "rejectTransferForApproval",
                {
                  id: me.view.down("[name=id]").getValue(),
                  rejection_reason: reject_form.down("[name=reason]").getValue()
                }
              );

              el.setDisabled(false);
              reject_form.close();
              me.model.callServerMethod("updateGridData", {
                model_name: [
                  "Crm.modules.independentTransfers.model.IndependentNotApprovedTransfersModel",
                  "Crm.modules.transfers.model.NotApprovedTransfersModel"
                ]
              });
              me.view.close();
              Ext.toast("Transfer rejected");
            }
          },
          {
            text: D.t("Cancel"),
            handler: () => {
              reject_form.close();
            }
          }
        ]
      });
    reject_form.show();
  },

  deleteRecord_do: function(store, rec) {
    var me = this;
    D.c("Removing", "Delete the record?", [], function() {
      var data = me.view
        .down("form")
        .getForm()
        .getValues();
      me.model.remove([data[me.model.idField]], function() {
        me.view.fireEvent("remove", me.view);
        me.view.config.cb("deleted");
        me.view.close();
      });
    });
  },

  async setValues(data) {
    if (this.view.gridCfg && this.view.gridCfg.from_calc)
      this.view.down("[action=approve]").setVisible(false);
    if (data.plan_id) {
      data.plan_name = data.plan_id.name;
      data.plan_id = data.plan_id.id;
    }
    if (data.merchant_id) {
      data.merchant_name = data.merchant_id.name;
      data.merchant_id = data.merchant_id.id;
    }
    if (data.tariff) {
      data.tariff_name = data.tariff.name;
      data.tariff = data.tariff.id;
    }
    if (data.currency) {
      this.setCurrency("currency", data.currency);
      this.setCurrency("fees_currency", data.currency);
      this.setCurrency("netto_currency", data.currency);
      this.setCurrency("rate_currency", data.currency);
    }
    if (data.result_currency)
      this.setCurrency("result_currency", data.result_currency);

    const admin = await this.model.callServerMethod("getAdminProfile");

    if (admin.other_configs && admin.other_configs.need_checker_widget)
      for (let btn_act of ["approve", "reject", "delete"])
        this.view.down(`[action=${btn_act}]`).setDisabled(false);

    this.getNetworkFees(data.currency);
    setInterval(() => {
      this.getNetworkFees(data.currency);
    }, 60000);

    this.callParent(arguments);
  },
  setCurrency(field_name, value) {
    return this.view.down(`[name=${field_name}]`).setText(value);
  },

  compareAmounts() {
    let amount = Number(this.view.down("[name=amount]").getValue());
    let confirmation_amount = Number(
      this.view.down("[name=confirmation_amount]").getValue()
    );
    return amount === confirmation_amount;
  },

  async checkAmountsAndSendTransfer() {
    let b = this.view.down("[action=approve]");
    b.setDisabled(true);
    let valid = this.view
      .down("form")
      .getForm()
      .isValid();
    if (!valid) return b.setDisabled(false);
    if (!this.compareAmounts()) {
      b.setDisabled(false);
      return D.a("Error", "Amounts are not equal");
    }
    await this.sendPlanTransfer(b);
  },

  async sendPlanTransfer(b) {
    const data = await this.preparePaymentData();
    const res = await this.model.sendPayment(data);
    if (b) b.setDisabled(false);
    if (res && res.transfer && res.transfer.id) {
      await this.model.setApprover({
        id: this.view.down("[name=id]").getValue()
      });
      if (this.view.cb) this.view.cb(res.transfer.plan_transfer_id);
      return this.view.close();
    } else {
      Ext.create("Crm.modules.accountsPlan.view.ErrorWin").showText(
        JSON.stringify(res, null, 4)
      );
      if (b) b.setDisabled(true);
    }
    return this.view.close();
  },

  addTextToPanel(text, bold) {
    const style = bold ? "font-size:13px;font-weight:bold;" : "font-size:13px;";

    this.view.nfPanel.add({
      xtype: "label",
      style,
      text
    });
  },

  async getNetworkFees(currency) {
    // this.view.nfPanel.removeAll();

    const currencyAlias = {
      USDT: "ETH",
      USDC: "ETH",
      USTR: "TRX"
    };

    const networkFee = await this.model.getNetworkFees({ currency: currency });

    while (this.view.nfPanel.items.items[0]) {
      this.view.nfPanel.remove(this.view.nfPanel.items.items[0]);
    }

    if (networkFee) {
      this.addTextToPanel("Estimated network fee: ", false);
      this.addTextToPanel(
        `${networkFee[currencyAlias[currency] || currency] ||
          "-"} ${currencyAlias[currency] || currency}`,
        true
      );
      this.addTextToPanel(
        " per transaction. Number of transactions depends on the selected plan",
        false
      );
    } else {
      this.addTextToPanel("Estimated network fee: -", false);
    }
  }
});
