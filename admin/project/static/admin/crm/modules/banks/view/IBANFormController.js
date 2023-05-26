Ext.define("Crm.modules.banks.view.IBANFormController", {
  extend: "Core.form.FormController",

  setControls: function() {
    this.callParent(arguments);
    this.control({
      "[action=formclose]": {
        click: () => {
          this.closeView();
        }
      },
      "[action=apply]": {
        click: () => {
          this.saveBankData().then(() => {
            this.save(false)
          });
        }
      },
      "[action=save]": {
        click: () => {
          this.saveBankData().then(() => {
            this.save(true)
          });
        }
      },
      "[action=change_bank]": {
        change: async (el, newV) => {
          await this.setNewData(el, newV);
        }
      }
    });
  },
  async setNewData(el, newV) {
    let data = el.store.data.map[newV].data;
    this.view.down("[name=swift]").setValue(data.swift);
    this.view.down("[name=address1]").setValue(data.address1);
    this.view.down("[name=country]").setValue(data.country);
    return;
  },
  setValues(data) {
    data.acc_holder_name = data.first_name && data.last_name ?
      `${data.first_name} ${data.last_name}` :
      data.name ? data.name : `—`;
    this.callParent(arguments);
  },
  async saveBankData() {
    return new Promise((resolve, reject) => {
      let data = this.view
        .down("form")
        .getForm()
        .getValues();
      this.model.runOnServer("saveBankData", data, (res) => {
        resolve(res);
      });
    });
  }
});
