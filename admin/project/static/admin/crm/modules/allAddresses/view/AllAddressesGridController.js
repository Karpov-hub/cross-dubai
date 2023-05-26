Ext.define("Crm.modules.allAddresses.view.AllAddressesGridController", {
  extend: "Core.grid.GridController",

  setControls: function() {
    this.control({
      "[action=check-address]": {
        click: () => {
          this.checkAddressForm();
        }
      }
    });
  },

  gotoRecordHash() {},

  async checkAddressForm() {
    Ext.create("Crm.modules.allAddresses.view.CheckAddressWindow", {});
  }
});
