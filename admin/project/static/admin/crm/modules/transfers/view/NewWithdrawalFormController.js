Ext.define("Crm.modules.transfers.view.NewWithdrawalFormController", {
  extend: "Crm.modules.transfers.view.NewTransferController",

  setControls() {
    this.control({
      "[name=to_currency]": {
        select: (el, v) => {
          v.data.key == "crypto"
            ? this.view.down("[name=wallet]").setVisible(true) &&
              this.view.down("[name=iban]").setVisible(false)
            : v.data.key == "fiat"
            ? this.view.down("[name=iban]").setVisible(true) &&
              this.view.down("[name=wallet]").setVisible(false)
            : null;
          this.computeResult();
        }
      },
      "[name=account]": {
        select: (el, v) => {
          this.view
            .down("[name=amount]")
            .setValue(el.displayTplData[0].balance);
          this.view
            .down("[name=currency]")
            .setValue(el.displayTplData[0].currency);
          this.computeResult();
        }
      },
      "[name=amount]": {
        change: (el, v) => {
          this.computeResult();
        }
      },
      "[name=wallet]": {
        select: (el, v) => {
          this.computeResult();
        }
      },
      "[name=iban]": {
        select: (el, v) => {
          this.computeResult();
        }
      }
    });
    this.callParent(arguments);
  },
  checkTechAcc(data, cb) {
    this.model.runOnServer(
      "checkTechAcc",
      {
        val: data.val,
        realm: this.view.down("[name=merchant]").displayTplData[0].realm,
        currency:
          this.view.down("[name=to_currency]").getValue() == "crypto"
            ? this.view.down("[name=wallet]").displayTplData[0].curr_name
            : this.view.down("[name=to_currency]").getValue() == "fiat"
            ? this.view.down("[name=iban]").displayTplData[0].currency
            : null
      },
      cb
    );
  },
  computeResult() {
    if (
      this.view.down("[name=merchant]").getValue() &&
      this.view.down("[name=amount]").getValue() > 0 &&
      ((this.view.down("[name=wallet]").getValue() &&
        this.view.down("[name=to_currency]").getValue() == "crypto") ||
        (this.view.down("[name=iban]").getValue() &&
          this.view.down("[name=to_currency]").getValue() == "fiat"))
    )
      this.model.runOnServer(
        "calculateResult",
        {
          amount: this.view.down("[name=amount]").getValue(),
          from_curr: this.view.down("[name=currency]").getValue(),
          to_curr:
            this.view.down("[name=to_currency]").getValue() == "crypto"
              ? this.view.down("[name=wallet]").displayTplData[0].curr_name
              : this.view.down("[name=to_currency]").getValue() == "fiat"
              ? this.view.down("[name=iban]").displayTplData[0].currency
              : null
        },
        (res) => {
          this.view.down("[name=res_amount]").setValue(res.result_amount);
        }
      );
    else this.view.down("[name=res_amount]").setValue(0);
  }
});
