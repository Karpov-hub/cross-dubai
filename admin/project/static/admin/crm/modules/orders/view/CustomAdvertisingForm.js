Ext.define("Crm.modules.orders.view.CustomAdvertisingForm", {
  extend: "Crm.modules.orders.view.AdvertisingForm",

  requires: ["Crm.modules.orders.view.CustomAdvertisingFormController"],

  title: D.t("Custom Advertising Report"),
  controller: "CustomAdvertisingFormController",

  buildItems: function() {
    let items = this.callParent(arguments);
    let date_from = new Date(this.order_form_data.date_from),
      date_to = new Date(this.order_form_data.date_to),
      one_day_in_milliseconds = 24 * 60 * 60 * 1000;

    date_from.setTime(date_from.getTime() - one_day_in_milliseconds * 14);
    date_to.setTime(date_to.getTime() + one_day_in_milliseconds * 14);

    let from = new Date(this.order_form_data.date_from),
      to = new Date(this.order_form_data.date_to);
    let order_date_from = new Date(
      new Date(from.getFullYear(), from.getMonth(), 1).getTime() -
        from.getTimezoneOffset() * 60000
    );
    let order_date_to = new Date(
      new Date(to.getFullYear(), to.getMonth() + 1, 0).getTime() -
        to.getTimezoneOffset() * 60000
    );

    items[0].items[2].value = new Date(date_from);
    items[0].items[2].fieldLabel = D.t("Fetch data from");
    items[0].items[3].value =
      new Date().getTime() < date_to.getTime() ? new Date() : new Date(date_to);
    items[0].items[3].fieldLabel = D.t("Fetch data to");
    items[0].items.splice(
      4,
      0,
      {
        xtype: "xdatefield",
        name: "order_date_from",
        fieldLabel: D.t("Report period from"),
        value: order_date_from,
        submitFormat: "Y-m-d",
        format: D.t("d/m/Y"),
        allowBlank: false
      },
      {
        xtype: "xdatefield",
        name: "order_date_to",
        fieldLabel: D.t("Report period to"),
        value: order_date_to,
        submitFormat: "Y-m-d",
        format: D.t("d/m/Y"),
        allowBlank: false
      },
      {
        xtype: "checkbox",
        name: "use_custom_dates",
        fieldLabel: D.t("Use custom report periods")
      },
      {
        xtype: "textfield",
        name: "websites",
        fieldLabel: D.t("Web sites"),
        value: this.order_data.websites
      }
    );
    return items;
  },

  initComponent() {
    this.callParent(arguments);
    this.model = Ext.create(
      "Crm.modules.orders.model.CustomGridsAdvertisingModel"
    );
  },

  buildButtons() {
    let me = this;
    return [
      "->",
      {
        text: "Show custom report data",
        handler: async () => {
          if (!this.down("form").isValid()) return;
          let mask = new Ext.LoadMask({
            msg: D.t("Loading..."),
            target: me
          });
          mask.show();
          const data = {
            use_custom_dates: this.down("[name=use_custom_dates]").getValue(),
            websites:
              this.down("[name=websites]").getValue() || "Not specified",
            order_id: this.order_data.order_id || "",
            date_from: this.down("[name=date_from]").getValue(),
            date_to: this.down("[name=date_to]").getValue(),
            order_date_from: this.down("[name=order_date_from]").getValue(), //this.order_form_data.date_from,
            order_date_to: this.down("[name=order_date_to]").getValue(), // this.order_form_data.date_to,
            campaignID: this.down("[name=campaign]").getValue(),
            report_name: "AdvertisingReport",
            format: "pdf",
            service: "report-service",
            method: "generateReport",
            report_description: "Advertising Report",
            merchant_id: this.order_data.merchant_id
          };

          let grids_data = await this.controller.loadAllStoresData(data);
          mask.hide();
          if (
            (grids_data.api_data.hasOwnProperty("success") &&
              grids_data.api_data.success !== true) ||
            (Array.isArray(grids_data.api_data) && !grids_data.api_data.length)
          )
            return D.a("Error", "Data hasn't been loaded");

          let form = Ext.create(
            "Crm.modules.orders.view.CustomGridsAdvertisingForm",
            {
              ad_data: data,
              general_stats: grids_data.api_data,
              withdrawal_list: grids_data.withdrawal_list
            }
          );
          form.show();
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
