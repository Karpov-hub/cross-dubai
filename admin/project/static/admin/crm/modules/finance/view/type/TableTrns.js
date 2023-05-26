Ext.define("Crm.modules.finance.view.type.TableTrns", {
  extend: "Crm.modules.transfers.view.TransfersGrid",

  title: "",
  iconCls: "",

  buildTbar() {},

  initComponent() {
    this.model = Ext.create("Crm.modules.finance.model.TransfersModel", {
      settings: this.settings
    });
    this.callParent(arguments);
  }
});
