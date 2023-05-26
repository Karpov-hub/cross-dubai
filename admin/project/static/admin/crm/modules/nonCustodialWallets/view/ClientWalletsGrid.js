Ext.define("Crm.modules.nonCustodialWallets.view.ClientWalletsGrid", {
  extend: "Crm.modules.nonCustodialWallets.view.WalletsGrid",

  controllerCls: "Crm.modules.nonCustodialWallets.view.WalletsGridController",
  model: "Crm.modules.nonCustodialWallets.model.ClientWalletsModel",

  buildColumns() {
    const columns = this.callParent(arguments);

    columns[2].hidden = true

    return columns;
  }
});
