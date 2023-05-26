Ext.define("Crm.modules.nonCustodialWallets.view.MerchantWalletsGrid", {
  extend: "Crm.modules.nonCustodialWallets.view.WalletsGrid",

  controllerCls: "Crm.modules.nonCustodialWallets.view.WalletsGridController",
  model: "Crm.modules.nonCustodialWallets.model.MerchantWalletsModel",

  buildColumns() {
    const columns = this.callParent(arguments);

    columns.splice(2, 2);

    return columns;
  }
});
