Ext.define("Crm.modules.nil.view.ExportTransactionsForm", {
  extend: "Ext.window.Window",

  modal: true,
  autoShow: true,
  width: 530,
  title: D.t("Export transfers"),
  layout: "fit",

  initComponent() {
    this.buttons = this.buildButtons();
    this.items = {
      xtype: "form",
      layout: "fit",
      items: this.buildItems()
    };

    this.model = Ext.create("Crm.modules.transfers.model.TransfersModel");
    this.callParent(arguments);
  },

  buildItems: function() {
    return [
      {
        xtype: "panel",
        layout: "anchor",

        padding: 10,
        defaults: { width: 500 },
        items: [
          {
            xtype: "xdatefield",
            name: "date_from",
            submitFormat: "Y-m-d",
            format: D.t("d/m/Y"),
            allowBlank: false,
            value: new Date(Date.now() - 86400000),
            emptyText: D.t("Date from"),
            fieldLabel: D.t("Date from")
          },
          {
            xtype: "xdatefield",
            name: "date_to",
            submitFormat: "Y-m-d",
            format: D.t("d/m/Y"),
            allowBlank: false,
            value: new Date(Date.now()),
            emptyText: D.t("Date To"),
            fieldLabel: D.t("Date to")
          },
          Ext.create("Crm.modules.currency.view.CurrencyCombo", {
            name: "currency",
            fieldLabel: D.t("Currency")
          })
        ]
      }
    ];
  },

  buildButtons() {
    return [
      "->",
      {
        text: "Export",
        id: "export_btn",
        handler: async () => {
          this.doExport();
        }
      },
      "-",
      {
        text: D.t("Close"),
        handler: () => {
          this.close();
        }
      }
    ];
  },

  async doExport(btn) {
    Ext.getCmp("export_btn").setDisabled(true);

    const me = this;
    const mask = new Ext.LoadMask({
      msg: D.t("Loading..."),
      target: me
    });
    mask.show();

    const data = {
      date_from: this.down("[name=date_from]").getValue(),
      date_to: this.down("[name=date_to]").getValue(),
      report_name: "nilTransactionsHistory",
      currency: this.down("[name=currency]").getValue()
    };

    const res = await this.model.callApi(
      "report-service",
      "generateReport",
      data
    );

    if (res && res.success) {
      let link = document.createElement("a");
      link.setAttribute("href", `${__CONFIG__.downloadFileLink}/${res.code}`);
      link.click();
      mask.hide();
      return this.close();
    } else {
      mask.hide();
      Ext.getCmp("export_btn").setDisabled(false);
      return D.a("Error", res.error);
    }
  }
});
