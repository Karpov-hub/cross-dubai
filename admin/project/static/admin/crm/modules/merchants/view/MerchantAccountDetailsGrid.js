Ext.define("Crm.modules.merchants.view.MerchantAccountDetailsGrid", {
  extend: "Core.grid.GridContainer",

  //title: D.t("Companies"),
  //iconCls: "x-fa fa-users",

  detailsInDialogWindow: true,

  //filterable: true,
  //filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Account Number"),
        flex: 2,
        sortable: true,
        dataIndex: "account_number",
        filter: true
      },
      {
        text: D.t("Bank"),
        flex: 2,
        sortable: true,
        dataIndex: "bank",
        filter: true
      },
      {
        text: D.t("SWIFT"),
        flex: 2,
        sortable: true,
        dataIndex: "swift",
        filter: true
      },
      {
        text: D.t("Currency"),
        flex: 2,
        sortable: true,
        dataIndex: "contract_acc_currency",
        filter: true
      },
      {
        text: D.t("Correspondent Currency"),
        flex: 2,
        sortable: true,
        dataIndex: "correspondent_currency",
        filter: true
      },
      {
        text: D.t("Correspondent Account"),
        flex: 2,
        sortable: true,
        dataIndex: "correspondent_account",
        filter: true
      },
      {
        text: D.t("Contract"),
        flex: 1,
        sortable: true,
        dataIndex: "contract_subject",
        filter: true
      }
    ];
  },

  buildButtonsColumns: function() {
    return [];
  },

  buildTbar: function() {
    var items = [];
    if (this.importButton) {
      items.push("-", {
        text: this.buttonImportText,
        iconCls: "x-fa fa-cloud-download",
        action: "import"
      });
    }
    if (this.exportButton) {
      items.push("-", {
        text: this.buttonExportText,
        iconCls: "x-fa fa-cloud-upload",
        action: "export"
      });
    }

    items.push("-", {
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-sync",
      action: "refresh"
    });

    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  }
});
