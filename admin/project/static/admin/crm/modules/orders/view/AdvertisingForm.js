Ext.define("Crm.modules.orders.view.AdvertisingForm", {
  extend: "Ext.window.Window",

  closeAction: "close",
  modal: true,
  autoShow: true,
  width: 530,
  requires: [
    "Core.form.DependedCombo",
    "Crm.modules.orders.view.AdvertisingFormController"
  ],

  title: D.t("Advertising Report"),
  layout: "fit",
  controller: "AdvertisingFormController",
  initComponent() {
    this.buttons = this.buildButtons();
    this.items = {
      xtype: "form",
      layout: "fit",
      items: this.buildItems()
    };
    this.model = Ext.create("Crm.modules.orders.model.OrdersModel");
    this.callParent(arguments);
  },

  buildItems: function() {
    this.merchantId = Ext.create("Ext.form.field.Text", {
      name: "merchant_id",
      hidden: true,
      value: this.order_data.merchant_id
    });
    this.campaignCombo = Ext.create("Core.form.DependedCombo", {
      valueField: "external_id",
      displayField: "caption",
      name: "campaign",
      queryMode: "local",
      parentEl: this.merchantId,
      parentField: "merchant_id",
      dataModel: "Crm.modules.campaigns.model.CampaignModel",
      fieldSet: "id,external_id,caption",
      allowBlank: false,
      fieldLabel: D.t("Campaign")
    });
    return [
      {
        xtype: "panel",
        layout: "anchor",

        padding: 10,
        defaults: { width: 500 },
        items: [
          this.merchantId,
          {
            name: "order_id",
            value: this.order_data.order_id,
            xtype: "textfield",
            hidden: true
          },
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
          this.campaignCombo
        ]
      }
    ];
  },

  buildButtons() {
    return [
      "->",
      {
        text: "Download Report",
        id: "getReport",
        handler: async () => {
          const confirmBtn = Ext.getCmp("getReport");
          confirmBtn.setDisabled(true);
          const data = {
            websites: this.order_data.websites || "Not specified",
            order_id: this.order_data.order_id || "",
            date_from: this.down("[name=date_from]").getValue(),
            date_to: this.down("[name=date_to]").getValue(),
            campaignID: this.down("[name=campaign]").getValue(),
            merchant_id: this.down("[name=merchant_id]").getValue(),
            report_name: "AdvertisingReport",
            format: "pdf",
            service: "report-service",
            method: "generateReport",
            report_description: "Advertising Report"
          };

          for (const item in data) {
            if (data[item] === null) {
              confirmBtn.setDisabled(false);
              return D.a("Error", "Please fill all fields");
            }
          }

          const res = await this.model.callApi(
            "report-service",
            "requestReport",
            data
          );

          this.close();
          return D.a("Report", "Report generation in process");
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
