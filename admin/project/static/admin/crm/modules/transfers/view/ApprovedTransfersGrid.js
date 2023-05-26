Ext.define("Crm.modules.transfers.view.ApprovedTransfersGrid", {
  extend: "Crm.modules.transfers.view.NotApprovedTransfersGrid",

  title: D.t("Data on approved transfers"),
  iconCls: "x-fa fa-check-circle",

  controllerCls: "Core.grid.GridController",

  buildColumns() {
    let columns = this.callParent(arguments);
    columns.splice(5, 1);
    return columns;
  },

  buildButtonsColumns() {
    let buttons = this.callParent(arguments);
    buttons[0].items[0].isDisabled = null;
    buttons[0].items = [buttons[0].items[0]];
    return buttons;
  }
});
