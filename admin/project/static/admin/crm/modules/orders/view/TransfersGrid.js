Ext.define("Crm.modules.orders.view.TransfersGrid", {
  extend: "Crm.modules.transfers.view.TransfersGrid",

  controllerCls: "Crm.modules.orders.view.TransfersGridController",
  buildTbar() {
    let items = this.callParent();
    items[0] = items[1] = items[2] = null;
    return items;
  },

  buildButtonsColumns() {
    let items = this.callParent();
    items[0].width = 120;
    if (this.config && this.config.from_calc)
      for (let i = 1; i < items[0].items.length; i++)
        items[0].items[i].isDisabled = () => {
          return true;
        };
    // items[0].items.push({
    //   iconCls: "x-fa fa-ban",
    //   tooltip: D.t("Delete"),
    //   handler: (g, index) => {
    //     this.fireEvent("deletePermanent", g, g.store.getAt(index).data);
    //   }
    // });
    return items;
  }
});
