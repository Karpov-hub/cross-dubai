Ext.define("Crm.modules.depositImports.view.depositImportsGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=download-report]": {
        click: () => {
          this.downloadReport();
        }
      },
      "[action=deposits-load]": {
        click: () => {
          this.loadDepositsFromXls();
        }
      },
      "[action=provide-selected]": {
        click: () => {
          this.provide();
        }
      },
      "[action=delete-selected]": {
        click: () => {
          this.remove();
        }
      }
    });

    this.view.down("[action=provide-selected]").setDisabled(true);
    this.view.down("grid").on("selectionchange", async (a, b, c) => {
      await this.checkSelected(a);
    });

    this.callParent();
  },

  async checkSelected(record) {
    const selected = this.view
      .down("grid")
      .getSelectionModel()
      .getSelected().items;

    if (selected && selected.length) {
      this.view.down("[action=provide-selected]").setDisabled(false);
    } else {
      this.view.down("[action=provide-selected]").setDisabled(true);
    }

    let lastSelectedStatus = record.lastSelected.data.status;

    if (lastSelectedStatus == 1)
      this.view
        .down("grid")
        .getSelectionModel()
        .deselect(record.lastSelected);
  },

  getGridFilters() {
    let gridFilters = this.view.store.getFilters();
    let filters = {};
    for (let filter of gridFilters.items) {
      filters[filter._id] = filter._value;
    }
    return filters;
  },

  async downloadReport() {
    let filters = await this.getGridFilters();

    let data = await this.model.getDataForExport(filters);
    let out = {
      report_name: "depositImportsReport",
      format: "pdf",
      list: data
    };

    const res = await this.model.callApi(
      "report-service",
      "generateReport",
      out,
      null,
      null
    );

    if (res && res.code) {
      let link_url = `${__CONFIG__.downloadFileLink}/${res.code}`;
      let link = document.createElement("a");
      link.setAttribute("href", link_url);
      link.click();
    }
  },

  loadDepositsFromXls() {
    Ext.create("Crm.modules.transfers.view.ImportWindow", {
      model: Ext.create("Crm.modules.transfers.model.TransfersModel")
    });
  },

  async provide() {
    const sel = this.view
      .down("grid")
      .getSelectionModel()
      .getSelected()
      .items.map((i) => i);

    let data = [];
    for (const rec of sel) {
      data.push({
        id: rec.data.id,
        merchant_name: rec.data.deposit_to,
        currency: rec.data.currency,
        amount: rec.data.amount,
        status: rec.data.status,
        deposit_date: rec.data.deposit_date,
        bank: rec.data.bank
      });
    }

    let orders = await this.model.sendDeposit({
      data,
      rescan: true
    });

    Ext.create(
      "Crm.modules.depositImports.view.ImportResultWindow",
      {}
    ).fillData(orders);

    this.view
      .down("grid")
      .getSelectionModel()
      .clearSelections();

    this.reloadData();
  },

  async remove() {
    const sel = this.view
      .down("grid")
      .getSelectionModel()
      .getSelected()
      .items.map((i) => i.id);

    await this.model.removeSelected({ ids: sel });

    this.reloadData();
  }
});

Ext.define("Crm.modules.depositImports.view.ImportResultWindow", {
  extend: "Ext.window.Window",

  modal: true,
  autoShow: true,

  width: 600,
  height: 400,

  tpl: `
  <div style="padding: 10px">
  <p>
  Complited: <span class="provided">{provided}</span>; 
  Skipped: <span class="skipped">{skipped}</span>; 
  Errors: <span class="deposit_errors">{deposit_errors}</span>
  </p>
  <tpl if="existsRows.length">
  <h3>Exists transfers</h3>
  <tpl for="existsRows">
  <p>
    Merchant: <b>{merchant_name}</b><br>
    Amount: <b>{amount}</b><br>
    Currency: <b>{currency}</b><br>
  </p>
  </tpl></tpl>
  <tpl if="noOrderRows.length">
  <h3>Orders are not found for transfers</h3>
  <tpl for="noOrderRows">
  <p>
    Merchant: <b>{merchant_name}</b><br>
    Amount: <b>{amount}</b><br>
    Currency: <b>{currency}</b><br>
  </p>
  </tpl></tpl>
  <tpl if="depositErrorRows.length">
  <h3>Errors on deposit</h3>
  <tpl for="depositErrorRows">
  <p>
    Merchant: <b>{merchant_name}</b><br>
    Amount: <b>{amount}</b><br>
    Currency: <b>{currency}</b><br>
  </p>
  </tpl></tpl>
  </div>
  `,

  title: D.t("Rescan data result"),
  layout: "fit",

  initComponent() {
    this.buttons = this.buildButtons();
    this.items = {
      xtype: "form",
      layout: "fit",

      items: this.buildItems()
    };
    this.callParent(arguments);
  },

  fillData(data) {
    this.down("[action=datapanel]").setData(data);
  },

  buildItems: function() {
    return [
      {
        xtype: "panel",
        //padding: 10,
        action: "datapanel",
        cls: "details-panel printcontent",
        scrollable: true,
        listeners: {
          boxready: function() {
            Ext.select(
              ".x-autocontainer-innerCt"
            ).selectable(); /*To enable user selection of text*/
          }
        },
        tpl: this.tpl
      }
    ];
  },

  buildButtons() {
    return [
      {
        text: D.t("Close"),
        handler: () => {
          this.close();
        }
      }
    ];
  }
});
