Ext.define("Crm.modules.tariffs.view.EasySettingsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Base tariffs"),
  iconCls: "x-fa fa-list",

  filterbar: true,
  filterable: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Title"),
        flex: 1,
        sortable: true,
        dataIndex: "name",
        filter: true
      },
      {
        text: D.t("Payment category"),
        flex: 1,
        sortable: true,
        dataIndex: "pcategory",
        filter: true
      },
      {
        text: D.t("Purse type"),
        flex: 1,
        sortable: true,
        dataIndex: "ptype",
        filter: true
      },
      {
        text: D.t("Comission withdrawal"),
        flex: 1,
        sortable: true,
        dataIndex: "fee_withdrawal"
      },
      {
        text: D.t("Comission send money"),
        flex: 1,
        sortable: true,
        dataIndex: "fee_transfer"
      },
      {
        text: D.t("Comission mass payment"),
        flex: 1,
        sortable: true,
        dataIndex: "fee_masspayment"
      },
      {
        text: D.t("Comission merchant"),
        flex: 1,
        sortable: true,
        dataIndex: "fee_merchant"
      },
      {
        text: D.t("Enabled deposit"),
        flex: 1,
        sortable: true,
        dataIndex: "enb_deposit",
        filter: true
      },
      {
        text: D.t("Enabled withdrawal"),
        flex: 1,
        sortable: true,
        dataIndex: "enb_withdrawal",
        filter: true
      },
      {
        text: D.t("Enabled merchant"),
        flex: 1,
        sortable: true,
        dataIndex: "enb_merchant",
        filter: true
      }
    ];
  }
});
