Ext.define("Crm.modules.nil.view.TXHistoryGridController", {
  extend: "Core.grid.GridController",

  async init(view) {
    this.callParent(arguments);
    let res = await this.model.callApi("falcon-service", "getBalance", {});

    view.balancesPanel.add({
      xtype: "label",
      style: "font-size:13px;font-weight:bold;",
      text: "Balances: "
    });
    for (let key in res) {
      if (res.hasOwnProperty(key)) {
        view.balancesPanel.add({
          xtype: "label",
          style: "font-size:13px;font-weight:bold;",
          text: `${key}: ${res[key]}, `
        });
      }
    }
    let me = this.view.down("grid");
    let mask = new Ext.LoadMask({
      msg: D.t("Loading..."),
      target: me,
      height: 1000
    });

    this.view.store.on("beforeload", (el, data) => {
      mask.show();
    });
    this.view.store.on("load", (el, data) => {
      mask.hide();
    });

    await this.loadGridStore();
  },

  getGridFilters() {
    const gridFilters = this.view.store.getFilters();
    const filters = [];
    for (let filter of gridFilters.items) {
      filters.push(filter);
    }
    return filters;
  },

  async loadGridStore(link = null) {
    const filters = await this.getGridFilters();
    const ledgerData = await this.view.model.readNilData(filters, 50, link);
    if (ledgerData.code) return D.a("Cannot load data from NIL", "Try later");
    this.view.store.setData(ledgerData.list);

    if (ledgerData.links.previous)
      this.view.pagingToolbar.down("[action=go_cursor_left]").enable();
    if (ledgerData.links.next)
      this.view.pagingToolbar.down("[action=go_cursor_right]").enable();
    if (!ledgerData.links.previous)
      this.view.pagingToolbar.down("[action=go_cursor_left]").disable();
    this.view.pagingToolbar.setLink_next(ledgerData.links.next);
    if (!ledgerData.links.next)
      this.view.pagingToolbar.down("[action=go_cursor_right]").disable();
    this.view.pagingToolbar.setLink_previous(ledgerData.links.previous);
  },

  setControls() {
    this.control({
      "[action=get_balances_report]": {
        click: () => {
          this.getReport();
        }
      },
      "[action=tx_history_form]": {
        click: () => {
          this.exportTx();
        }
      }
    });
    this.callParent();
  },

  gotoRecordHash() {},

  async getReport() {
    let reportData = {
      report_name: "falconBalancesReport"
    };

    this.view.down("[action=get_balances_report]").setDisabled(true);

    let report = await this.model.callApi(
      "report-service",
      "generateReport",
      reportData
    );

    if (report && !report.success) {
      return D.a(
        "Error",
        report.error ||
          "Something went wrong, please try again or contact admin"
      );
    } else {
      let link = document.createElement("a");
      link.setAttribute(
        "href",
        `${__CONFIG__.downloadFileLink}/${report.code}`
      );
      link.click();
      this.view.down("[action=get_balances_report]").setDisabled(false);
    }
  },

  exportTx() {
    Ext.create("Crm.modules.nil.view.ExportTransactionsForm", {
      scope: this.view
    });
  }
});
