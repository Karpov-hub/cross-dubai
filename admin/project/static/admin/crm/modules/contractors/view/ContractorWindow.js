Ext.define("Crm.modules.contractors.view.ContractorWindow", {
  extend: "Ext.window.Window",

  modal: true,
  autoShow: true,

  width: 350,
  height: 150,

  syncSize: function() {},

  title: D.t("Select contractor"),

  initComponent() {
    this.buttons = this.buildButtons();
    this.items = {
      xtype: "form",
      layout: "fit",
      items: this.buildItems()
    };

    this.model = Ext.create("Crm.modules.contractors.model.ContractorsModel");
    this.callParent(arguments);
  },

  buildItems: function() {
    this.contractors_combo = Ext.create("Ext.form.ComboBox", {
      xtype: "combo",
      name: "contractor",
      fieldLabel: D.t("Contractor"),
      valueField: "id",
      allowBlank: false,
      displayField: "name",
      margin: 5,
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: "Crm.modules.contractors.model.ContractorsModel",
        fieldSet: "id,name",
        scope: this
      })
    });
    return [this.contractors_combo];
  },

  buildButtons() {
    return [
      "->",
      {
        text: "Confirm",
        id: "confirm_btn",
        handler: async () => {
          const confirmBtn = Ext.getCmp("confirm_btn");
          confirmBtn.setDisabled(true);
          // let data = {
          //   ...this.order_data,
          //   contractor: this.contractors_combo.value,
          //   report_name: "invoiceAdmin"
          // };

          this.order_data.contractor = this.contractors_combo.value;
          this.order_data.report_name = "invoiceAdmin";

          let link = document.createElement("a");
          let realm_id = await this.model.getDefaultRealm();

          let invoice = await this.model.callApi(
            "report-service",
            "generateReport",
            this.order_data,
            realm_id,
            this.order_data.merchant
          );

          if (invoice && !invoice.success) {
            confirmBtn.setDisabled(false);
            return D.a(
              "Error",
              invoice.error && typeof invoice.error !== "object"
                ? invoice.error
                : "Something went wrong, please try again or contact admin"
            );
          }

          link.setAttribute(
            "href",
            `${__CONFIG__.downloadFileLink}/${invoice.code}`
          );
          link.click();

          if (invoice && invoice.code) {
            this.close();
          }
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
