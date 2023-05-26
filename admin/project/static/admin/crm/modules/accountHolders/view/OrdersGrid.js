Ext.define("Crm.modules.accountHolders.view.OrdersGrid", {
  extend: "Crm.modules.orders.view.OrdersGrid",

  title: null,

  detailsInDialogWindow: true,

  controllerCls: "Crm.modules.accountHolders.view.OrdersGridController",
  model: Ext.create("Crm.modules.orders.model.OrdersModel")
});
