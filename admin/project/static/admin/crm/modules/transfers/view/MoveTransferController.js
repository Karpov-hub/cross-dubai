Ext.define("Crm.modules.transfers.view.MoveTransferController", {
  extend: "Core.form.FormController",

  setControls() {
    this.exchange_data = {};
    this.control({
      "[action=move_txs]": {
        click: () => {
          this.exchange();
        }
      }
    });
    this.model = Ext.create("Crm.modules.transfers.model.TransfersModel");
    this.callParent(arguments);
  },

  async exchange() {
    this.view.down("[action=move_txs]").setDisabled(true);
    let form = this.view
      .down("form")
      .getForm()
      .getValues();

    let res = await this.model.moveTransfers(form);
    if (res) {
      await this.model.refreshData({
        modelName: this.model.$className
      });
      this.view.close();
    }
    this.view.down("[action=move_txs]").setDisabled(false);
  }
});
