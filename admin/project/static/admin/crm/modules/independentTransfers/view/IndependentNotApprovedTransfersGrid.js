Ext.define(
  "Crm.modules.independentTransfers.view.IndependentNotApprovedTransfersGrid",
  {
    extend: "Crm.modules.transfers.view.NotApprovedTransfersGrid",
    controllerCls:
      "Crm.modules.transfers.view.NotApprovedTransfersGridController",

    buildTbar() {
      return [
        {
          iconCls: "x-fa fa-exchange-alt",
          text: D.t("Inner transfer"),
          action: "createInnerTransferForm"
        },
        "-",
        {
          tooltip: this.buttonReloadText,
          iconCls: "x-fa fa-sync",
          action: "refresh"
        }
      ];
    }
  }
);
