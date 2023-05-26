Ext.define(
  "Crm.modules.independentTransfers.view.InnerTransferFormController",
  {
    extend: "Core.form.FormController",

    setControls() {
      this.control({
        "[action=create_payment_window]": {
          click: async (b) => {
            await this.createPaymentWin(b);
          }
        }
      });
      this.callParent(arguments);
    },

    createPaymentWin() {
      const merchantCombo = this.view.down("[name=merchant]");
      const merchantData = merchantCombo.valueCollection.items[0].data;

      const paymentWin = Ext.create(
        "Crm.modules.accountsPlan.view.PaymentWin",
        {
          merchant_id: merchantData.id,
          client_id: merchantData.user_id,
          scope: this,
          tag: "Inner transfer",
          cb: () => {
            this.view.close();
          }
        }
      );

      paymentWin.show();
      paymentWin.controller.setValues({
        merchant_id: merchantData.id,
        user_id: merchantData.user_id,
        ref_id: "2"
      });
    }
  }
);
