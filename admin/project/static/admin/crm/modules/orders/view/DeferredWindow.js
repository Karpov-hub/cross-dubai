Ext.define("Crm.modules.orders.view.DeferredWindow", {
  extend: "Ext.window.Window",
  autoShow: true,
  modal: true,
  title: D.t("Deferred transfers"),
  layout: "fit",
  width: 1024,
  height: 400,
  modal: true,
  initComponent() {
    this.items = Ext.create("Crm.modules.transfers.view.DeferredGrid", {
      title: ""
    });

    this.model = this.items.model;
    this.store = this.items.store;

    this.controller = Ext.create(
      "Crm.modules.transfers.view.DeferredGridController"
    );

    this.buttons = this.buildButtons();
    this.callParent(arguments);
  },

  buildButtons() {
    return [
      {
        iconCls: "x-fa fa-check",
        text: D.t("Provide deferred"),
        action: "provide_deferred"
      },
      "->",
      {
        text: D.t("Close"),
        handler: () => {
          this.close();
        }
      }
    ];
  }
});
