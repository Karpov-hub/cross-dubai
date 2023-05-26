Ext.define("Crm.modules.nil.view.TXHistoryGrid", {
  extend: "Core.grid.GridContainer",
  title: D.t("Transactions History"),

  filterable: true,
  filterbar: true,
  fields: [
    "transaction_id",
    "created",
    "reference",
    "currency",
    "amount",
    "type",
    "group"
  ],
  detailsInDialogWindow: true,
  controllerCls: "Crm.modules.nil.view.TXHistoryGridController",

  pagingToolbar: Ext.create("Crm.modules.nil.view.CursorPaginationToolbar"),

  buildPaging: function() {
    this.pagingToolbar.setScope(this);
    return this.pagingToolbar;
  },

  buildColumns: function() {
    this.balancesPanel = Ext.create("Ext.panel.Panel", {});
    return [
      {
        xtype: "datecolumn",
        text: D.t("Created"),
        width: 150,
        sortable: true,
        format: "d.m.Y H:i:s",
        filter: {
          xtype: "datefield",
          format: "d.m.Y",
          submitFormat: "Y-m-d"
        },
        dataIndex: "created"
      },
      {
        text: D.t("Transaction ID"),
        flex: 1,
        filter: true,
        sortable: true,
        dataIndex: "transaction_id"
      },
      {
        text: D.t("Reference"),
        flex: 1,
        filter: true,
        sortable: true,
        dataIndex: "reference"
      },
      {
        text: D.t("Amount"),
        flex: 1,
        filter: true,
        sortable: true,
        dataIndex: "amount"
      },
      {
        text: D.t("Currency"),
        flex: 1,
        filter: this.buildCurrencyCombo(),
        sortable: true,
        dataIndex: "currency"
      }
    ];
  },

  buildCurrencyCombo() {
    return {
      name: "currency",
      xtype: "combo",
      editable: false,
      queryMode: "local",
      displayField: "abbr",
      valueField: "abbr",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.currency.model.CurrencyModel"),
        fieldSet: ["abbr"],
        scope: this,
        sorters: [{ property: "abbr", direction: "asc" }]
      })
    };
  },

  buildTbar: function() {
    this.item = [];

    this.item.push(
      {
        text: "Falcon Balances Report",
        iconCls: "x-fa fa-download",
        action: "get_balances_report"
      },
      "-",
      {
        text: "Transactions History Report",
        iconCls: "x-fa fa-download",
        action: "tx_history_form"
      },
      "-",
      {
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-sync",
        action: "refresh"
      },
      this.balancesPanel
    );

    return this.item;
  },

  buildButtonsColumns() {}
});
