Ext.define("Crm.modules.merchants.view.SubprojectsGrid", {
  extend: "Crm.modules.merchants.view.MerchantsGrid",

  detailsInDialogWindow: true,

  model: "Crm.modules.merchants.model.MerchantsModel",

  buildColumns: function() {
    return [
      {
        text: D.t("Name"),
        flex: 1,
        sortable: true,
        dataIndex: "name",
        filter: true
      },
      {
        text: D.t("Active"),
        width: 120,
        sortable: true,
        dataIndex: "active",
        filter: true,
        renderer: (v) => {
          return v ? "Yes" : "No";
        }
      }
    ];
  }
});
