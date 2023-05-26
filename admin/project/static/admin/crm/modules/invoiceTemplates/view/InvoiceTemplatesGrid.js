Ext.define("Crm.modules.invoiceTemplates.view.InvoiceTemplatesGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Invoice Templates"),
  iconCls: "x-fa fa-list",

  //filterable: true,
  //filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Name"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "name"
      },
      {
        text: D.t("Default"),
        width: 100,
        sortable: true,
        filter: true,
        dataIndex: "def"
      }
    ];
  }
});
