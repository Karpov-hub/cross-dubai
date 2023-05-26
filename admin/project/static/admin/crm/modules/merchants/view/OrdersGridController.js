Ext.define("Crm.modules.merchants.view.OrdersGridController", {
  extend: "Crm.modules.orders.view.OrdersGridController",

  generateDetailsCls() {
    return "Crm.modules.orders.view.OrdersForm";
  },
  
});
