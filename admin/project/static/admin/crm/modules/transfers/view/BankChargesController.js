Ext.define("Crm.modules.transfers.view.BankChargesController", {
  extend: "Crm.modules.transfers.view.NewTransferController",

  setControls() {
    this.callParent(arguments);
  },

  async bankcharge() {
    this.view.down("[action=bankcharge]").setDisabled(true);
    const data = this.prepareData(this.view.down("form").getValues());

    data.amount = parseFloat(data.amount.replace(",", "."));
    data.currency = data.to_currency;

    let res = await this.model.callApi(
      "account-service",
      "bankCharge",
      data,
      null,
      data.user_id
    );
    this.view.down("[action=bankcharge]").setDisabled(false);
    if (res) this.view.close();
  }
});
