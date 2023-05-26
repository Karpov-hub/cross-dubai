Ext.define("Crm.modules.banks.view.RealmDepartmentIBANGrid", {
  extend: "Core.grid.GridContainer",

  requires: ["Core.grid.ComboColumn"],

  detailsInDialogWindow: true,

  model: "Crm.modules.banks.model.IBANModel",

  buildColumns: function() {
    return [
      {
        hidden: true,
        dataIndex: "owner"
      },
      {
        hidden: true,
        dataIndex: "bank_id"
      },
      {
        text: D.t("Bank"),
        flex: 1,
        sortable: true,
        dataIndex: "bank_name"
      },
      {
        text: D.t("IBAN/Account №"),
        flex: 1,
        sortable: true,
        dataIndex: "iban"
      },
      {
        text: D.t("Currency"),
        flex: 1,
        sortable: true,
        dataIndex: "currency"
      }
    ];
  }
});
