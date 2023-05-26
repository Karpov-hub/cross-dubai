Ext.define("Crm.modules.accounts.view.RealmAccountsFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[name=type]": {
        change: (el, v) => {
          this.typeChange(v);
        }
      }
    });
    this.ibanField = this.view.down("[name=iban_id]");
    this.view.on("save", async (view, data) => {
      await this.model.refreshData({ modelName: this.model.$className });

      if (!data.success) {
        return D.a("Error", "An account with this number already exists");
      }

      return this.onSaveFin(data);
    });
    this.callParent(arguments);
  },

  async setValues(data) {
    if (!data.acc_no) {
      this.view.down("[name=acc_no]").setReadOnly(false);
    }

    this.callParent(arguments);
  },

  typeChange(type) {
    //this.ibanField.setDisabled(type != 1);
  },

  onSaveFin(data) {
    console.log("data:", data);
    return false;
  }
});
