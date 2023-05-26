Ext.define("Crm.modules.accounts.view.ExportTransactionsForm", {
  extend: "Ext.window.Window",
  requires: ["Core.form.DependedCombo"],

  modal: true,
  autoShow: true,
  width: 530,
  title: D.t("Export transactions"),
  layout: "fit",

  initComponent() {
    this.buttons = this.buildButtons();
    this.items = {
      xtype: "form",
      layout: "fit",
      items: this.buildItems()
    };

    this.model = Ext.create("Crm.modules.accounts.model.AccountsModel");
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

            format: D.t("d/m/Y"),
            value: new Date(Date.now() - 86400000),
            emptyText: D.t("Date from"),
            fieldLabel: D.t("Date from")
          },
          {
            xtype: "xdatefield",
            name: "date_to",
            submitFormat: "Y-m-d",
            format: D.t("d/m/Y"),
            format: D.t("d/m/Y"),
            allowBlank: false,
            value: new Date(Date.now()),
            emptyText: D.t("Date To"),
            fieldLabel: D.t("Date to")
          }
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
          Ext.getCmp("export_btn").setDisabled(true);
          const data = {
            date_from: this.down("[name=date_from]").getValue(),
            date_to: this.down("[name=date_to]").getValue(),
            report_name: "allAccountsTransactionsReport"
          };

          const report = await this.model.callApi(
            "report-service",
            "generateReport",
            data
          );
          if (report && report.success) {
            let link = document.createElement("a");

            link.setAttribute(
              "href",
              `${__CONFIG__.downloadFileLink}/${report.code}`
            );
            link.click();
            return this.close();
          } else return D.a("Error", report.error);
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
  }
});
