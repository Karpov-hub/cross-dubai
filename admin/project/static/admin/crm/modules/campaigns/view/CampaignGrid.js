Ext.define("Crm.modules.campaigns.view.CampaignGrid", {
  extend: "Core.grid.GridContainer",

//   title: D.t("Campaigns"),
  //   iconCls: "x-fa fa-list",

  detailsInDialogWindow: true,

  filterable: true,
  filterbar: true,

  buildColumns: function() {
    return [
      {
        name: "merchant_id",
        hidden: true
      },
      {
        text: D.t("Caption"),
        flex: 2,
        sortable: true,
        dataIndex: "caption",
        filter: true
      },
      {
        text: D.t("External ID (API)"),
        flex: 2,
        sortable: true,
        dataIndex: "external_id",
        filter: true
      }
    ];
  }
});
