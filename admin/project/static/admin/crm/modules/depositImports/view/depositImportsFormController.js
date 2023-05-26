Ext.define("Crm.modules.depositImports.view.depositImportsFormController", {
  extend: "Core.form.FormController",

  async setControls() {
    this.control({
      "[name=merchant_combo]": {
        change: (el, v) => {
          this.onMerchantChange(v);
        }
      },
      "[action=provide_deposit]": {
        click: () => {
          this.provide();
        }
      },
      "[action=remember_bn]": {
        click: () => {
          this.rememberBankName();
        }
      },
      "[action=mark_resolved]": {
        click: () => {
          this.markAsResolved();
        }
      }
    });
    this.callParent(arguments);
  },

  async setValues(data) {
    if (data.status == 1) {
      this.view.down("[action=mark_resolved]").setDisabled(true);
      this.view.down("[action=remember_bn]").setDisabled(true);
      this.view.down("[action=provide_deposit]").setDisabled(true);
    }
    this.callParent(arguments);
  },

  async markAsResolved() {
    let form = this.view.down("form").getValues();
    let resolved = await this.model.markAsResolved({
      data: form
    });

    if (resolved) {
      await this.model.refreshData({ modelName: this.model.$className });
      this.closeView(true);
    }
  },

  async rememberBankName() {
    let form = this.view.down("form").getValues();
    let resolved = await this.model.rememberBankName({
      data: form
    });

    if (resolved) {
      await this.model.refreshData({ modelName: this.model.$className });
      return D.a("Success", "Bank name is successfully saved");
      // this.closeView(true);
    }
  },

  async onMerchantChange(v) {
    const Order = this.view.down("[name=order_id]");

    let orders = await this.model.getOrders({
      organisation: v
    });

    if (orders && orders.length) {
      Order.getStore().loadData(orders);
      if (orders.length == 1) Order.setValue(orders[0].iban);
    }
  },

  async provide() {
    let form = this.view.down("form").getValues();
    let orders = await this.model.sendDeposit({
      data: form
    });

    if (orders) {
      await this.model.refreshData({ modelName: this.model.$className });
      this.closeView(true);
    }
  }
});
