Ext.define("Crm.modules.chainOfWallets.view.WalletsFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=deactivate_chain]": {
        click: async () => {
          await this.deactivateChain();
        }
      }
    });
    this.callParent(arguments);
  },

  async buildWarning(message, cb) {
    Ext.Msg.show({
      title: D.t("Confirm action"),
      message,
      buttons: Ext.Msg.OKCANCEL,
      icon: Ext.Msg.WARNING,
      fn: cb
    });
  },

  setValues(data) {
    if (data.merchant_id) {
      data.merchant_name = data.merchant_id.name;
      data.merchant_id = data.merchant_id.id;
    }

    this.view.down("[action=deactivate_chain]").setDisabled(data.status);

    this.callParent(arguments);
  },

  async deactivateChain() {
    const chain_id = this.view.down("[name=id]").getValue();

    await this.buildWarning(
      "This action is irreversible. Proceed?",
      async (action) => {
        if (action === "ok") {
          await this.model.deactivateChain(chain_id);
          await this.model.refreshData({ modelName: this.model.$className });
          this.closeView();
        }
      }
    );

    return;
  }
});
