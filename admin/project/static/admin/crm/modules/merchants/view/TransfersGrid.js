Ext.define("Crm.modules.merchants.view.TransfersGrid", {
  extend: "Crm.modules.transfers.view.TransfersGrid",

  controllerCls: "Crm.modules.merchants.view.TransfersGridController",

  // buildTbar() {
  //   let items = this.callParent();
  //   let transferMenu = [
  //     {
  //       text: D.t("Reconciliation act"),
  //       iconCls: "x-fa fa-download",
  //       menu: [
  //         {
  //           text: D.t("Reconciliation act"),
  //           iconCls: "x-fa fa-download",
  //           action: "reconciliation-act-1"
  //         },
  //         {
  //           text: D.t("Reconciliation act (invoice)"),
  //           iconCls: "x-fa fa-download",
  //           action: "reconciliation-act-2"
  //         },
  //         {
  //           iconCls: "x-fa fa-download",
  //           text: D.t("Export transfers by plan"),
  //           action: "exportPlanTransfers"
  //         }
  //       ]
  //     },
  //     "-"
  //   ];

  //   items.find((el, i) => {
  //     if (el.action == "exportTransfers") {
  //       items[i] = {
  //         iconCls: "x-fa fa-download",
  //         text: D.t("Non-plan transfers export"),
  //         action: "merchantsExportTransfers"
  //       };
  //       return true;
  //     }
  //   });

  //   items.unshift(transferMenu[0], transferMenu[1]);
  //   return items;
  // }
});
