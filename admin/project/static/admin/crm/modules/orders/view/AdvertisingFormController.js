Ext.define("Crm.modules.orders.view.AdvertisingFormController", {
  extend: "Core.form.FormController",

  alias:"controller.AdvertisingFormController",
  
  setControls() {
    this.callParent(arguments);
    this.control({
      "[name=date_from]": {
        change: (el, v) => {
          this.view.down("[name=date_to]").setMinValue(v);
        }
      }
    });
    this.view
      .down("[name=date_to]")
      .setMinValue(this.view.down("[name=date_from]").getValue());
  }
});
