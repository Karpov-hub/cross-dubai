Ext.define("Crm.modules.accountsPlan.view.MerchPlansGrid", {
  extend: "Core.grid.GridContainer",

  filterable: true,
  filterbar: true,

  detailsInDialogWindow: true,

  fields: ["id", "plan_id", "name"],

  buildColumns: function() {
    return [
      {
        text: D.t("Plan name"),
        flex: 2,
        sortable: false,
        dataIndex: "plan_id",
        filter: false,
        menuDisabled: true,
        renderer: (v, m, r) => {
          return r.data.name || (v ? v.name || "" : "");
        }
      }
    ];
  }
});
