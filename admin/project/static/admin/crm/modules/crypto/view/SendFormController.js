Ext.define("Crm.modules.crypto.view.SendFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=sendtransfer]": {
        click: async (b) => {
          await this.sendTransfer(b);
        }
      }
    });
    this.callParent(arguments);
  },

  async sendTransfer(b) {
    b.setDisabled(true);
    const data = this.view.down("form").getValues();
    const res = await this.view.model.callApi(
      "ccoin-service",
      "sendCustom",
      data
    );
    b.setDisabled(false);
    if (res && res.success) {
      D.a("", "Transfer was sent", [], () => {
        this.view.close();
      });
    } else D.a("", "Transfer was not sent", []);
  }
});
