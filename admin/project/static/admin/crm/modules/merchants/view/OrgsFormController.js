Ext.define("Crm.modules.merchants.view.OrgsFormController", {
  extend: "Core.form.FormController",

  setControls: function() {
    this.control({
      "[action=formclose]": {
        click: () => {
          this.closeView();
        }
      },
      "[action=save]": {
        click: () => {
          this.save(true);
        }
      }
    });

    this.view.on("save", async (view, data) => {
      data.record.address = JSON.parse(view.originalFormData).address;
      this.view.callback(data.record);
    });
  }
});
