Ext.define("Crm.modules.merchants.view.MerchantsGrid", {
  extend: "Core.grid.GridContainer",

  //title: D.t("Companies"),
  //iconCls: "x-fa fa-users",

  detailsInDialogWindow: true,

  //filterable: true,
  //filterbar: true,

  fields: [
    "id",
    "name",
    "country",
    "vat",
    "email",
    "phone",
    "active",
    "categories_grid",
    "categories"
  ],

  buildColumns: function() {
    return [
      {
        text: D.t("Merchant name"),
        flex: 2,
        sortable: true,
        dataIndex: "name",
        filter: true
      },
      {
        text: D.t("Registration country"),
        width: 100,
        sortable: true,
        dataIndex: "country",
        filter: true
      },
      {
        text: D.t("VAT"),
        width: 200,
        sortable: true,
        dataIndex: "vat",
        filter: true
      },
      {
        text: D.t("Email"),
        flex: 2,
        sortable: true,
        dataIndex: "email",
        filter: true
      },
      {
        text: D.t("Phone"),
        width: 150,
        sortable: true,
        dataIndex: "phone",
        filter: true
      },
      {
        text: D.t("Category"),
        flex: 1,
        sortable: true,
        dataIndex: "category_grid",
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
