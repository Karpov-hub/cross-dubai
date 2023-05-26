Ext.define("Crm.modules.transfers.view.ExportTransfersForm", {
  extend: "Ext.window.Window",
  requires: ["Core.form.DependedCombo"],

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
            xtype: "combo",
            valueField: "id",
            displayField: "name",
            name: "merchant_id",
            queryMode: "local",
            value: this.merchant_id,
            fieldLabel: D.t("Merchant"),
            store: Ext.create("Core.data.ComboStore", {
              dataModel: Ext.create(
                "Crm.modules.merchants.model.MerchantsModel"
              ),
              fieldSet: "id,name",
              scope: this,
              sorters: [{ property: "name", direction: "asc" }]
            }),
            hidden: this.merchant_id ? false : true
          },
          {
            xtype: "combo",
            valueField: "id",
            displayField: "legalname",
            name: "user_id",
            value: this.user_id,
            fieldLabel: D.t("Group"),
            queryMode: "local",
            store: Ext.create("Core.data.ComboStore", {
              dataModel: Ext.create(
                "Crm.modules.accountHolders.model.UsersModel"
              ),
              fieldSet: "id,legalname",
              scope: this,
              sorters: [{ property: "legalname", direction: "asc" }]
            }),
            hidden: this.user_id ? false : true
          },
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
          this.doExport("export_btn");
        }
      },
      "-",
      {
        text: "Export all",
        id: "export_all_btn",
        handler: async () => {
          this.doExport("export_all_btn");
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
    Ext.getCmp(btn).setDisabled(true);
    const data = {
      merchant_id: this.down("[name=merchant_id]").getValue() || "",
      user_id: this.down("[name=user_id]").getValue() || "",
      date_from: this.down("[name=date_from]").getValue(),
      date_to: this.down("[name=date_to]").getValue(),
      ref_id: this.ref_id || "",
      report_name: this.report_name,
      format: "csv",
      all: btn == "export_all_btn" ? true : false
    };
    for (const item in data) {
      if (data[item] === null) return D.a("Error", "Please fill all fields");
    }
    const res = await this.model.callApi(
      "report-service",
      "generateReport",
      data
    );
    if (res && res.success) {
      let link = document.createElement("a");

      link.setAttribute("href", `${__CONFIG__.downloadFileLink}/${res.code}`);
      link.click();
      return this.close();
    } else return D.a("Error", res.error);
  }
});
