Ext.define("Crm.modules.vat.view.VatLogsFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=find_log]": {
        click: (el, v) => {
          this.findLog();
        }
      }
    });

    this.callParent(arguments);
  },

  async findLog() {
    let data = this.view.down("form").getValues();
    let me = this;
    await this.model.runOnServer("findLog", data, async function(log) {
      me.view
        .down("[name=vat_log]")
        .setValue(JSON.stringify(log[log.length - 1], null, 4));
    });
  },

  setValues(data) {
    if (data && data.realm) data.realm = data.realm.id;
    this.callParent(arguments);
  }
});
