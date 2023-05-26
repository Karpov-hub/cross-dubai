Ext.define("Crm.modules.orders.view.orderTypes.BaseTypesContainer", {
  extend: "Ext.form.FieldContainer",

  controllerCls: null,

  requires: ["Crm.modules.orders.view.PaymentButtons"],

  initComponent() {
    this.controller = Ext.create(
      this.controllerCls ||
        "Crm.modules.orders.view.orderTypes.BaseTypesController"
    );
    this.model = Ext.create("Crm.modules.orders.model.WCNOrderModel");
    this.items = this.buildItems();
    this.callParent(arguments);
  },

  buildItems() {
    return [];
  },
  updateGeneralOrderData(){
    this.controller.updateGeneralOrderData()
  },
  calculateTrancheData() {
    this.controller.calculateTrancheData();
  },
  getEmptyTrancheData() {
    return this.controller.getEmptyTrancheData();
  },
  setCurrenciesFieldsValues(currencies) {
    return this.controller.setCurrenciesFieldsValues(currencies);
  },
  disableAdditionalOrderFields() {
    return this.controller.disableAdditionalOrderFields(
      this.getAdditionalFields().concat(this.getTrancheFields())
    );
  },
});
