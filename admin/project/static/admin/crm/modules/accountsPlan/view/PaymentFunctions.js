Ext.define("Crm.modules.accountsPlan.view.PaymentFunctions", {
  async preparePaymentData() {
    const MerchPlansModel = Ext.create(
      "Crm.modules.accountsPlan.model.MerchPlansModel"
    );
    const data = {
      plan_transfer_id: this.view.down("[name=plan_transfer_id]").getValue(),
      merchant_id: this.view.down("[name=merchant_id]").getValue(),
      amount: this.view.down("[name=amount]").getValue(),
      plan_id: this.view.down("[name=plan_id]").getValue(),
      ref_id: this.view.down("[name=ref_id]").getValue(),
      tariff: this.view.down("[name=tariff]").getValue(),
      variables: this.view.down("[name=variables]").getValue(),
      description: this.view.down("[name=description]").getValue(),
      order_id: this.view.down("[name=ref_id]").getValue()
    };

    if (data.variables && data.variables.length)
      for (const variable of data.variables) {
        variable.value = variable.value
          ? variable.value.trim()
          : variable.value;
      }
    let address = await MerchPlansModel.validateCryptoAccounts({
      variables: data.variables,
      currency: this.view.down("[name=currency]").text,
      result_currency: this.view.down("[name=result_currency]").text
    });
    if (!address.valid) return address.valid;
    return data;
  }
});
