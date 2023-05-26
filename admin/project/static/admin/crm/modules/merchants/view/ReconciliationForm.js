Ext.define("Crm.modules.merchants.view.ReconciliationForm", {
  extend: "Ext.window.Window",
  requires: ["Core.form.DependedCombo"],

  modal: true,
  autoShow: true,
  width: 530,
  title: D.t("Reconciliation Act"),
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
    this.merchantCombo = Ext.create("Core.form.DependedCombo", {
      valueField: "id",
      displayField: "name",
      name: "merchant",
      dataModel: "Crm.modules.merchants.model.MerchantsModel",
      fieldSet: "id,user_id,name",
      allowBlank: false,
      fieldLabel: D.t("Merchant"),
      value: this.merchantData.id,
      hidden: true
    });
    this.contractCombo = Ext.create("Core.form.DependedCombo", {
      valueField: "id",
      displayField: "contract_subject",
      name: "contract",
      dataModel: "Crm.modules.contracts.model.ContractsModel",
      fieldSet: "id,contract_subject,memo,status",
      parentEl: this.merchantCombo,
      parentField: "owner_id",
      allowBlank: false,
      fieldLabel: D.t("Contract"),
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">{contract_subject}{[values.memo ? " ("+values.memo+")" : ""]} - {[["Pending","Approved","Terminated"][values.status]]}</tpl>'
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        `<ul class="x-list-plain"><tpl for=".">
        <li role="option" class="x-boundlist-item">{contract_subject}{[values.memo ? " ("+values.memo+")" : ""]} - {[["Pending","Approved","Terminated"][values.status]]}</li>
        </tpl></ul>`
      )
    });
    return [
      {
        xtype: "panel",
        layout: "anchor",

        padding: 10,
        defaults: { width: 500 },
        items: [
          this.merchantCombo,
          this.contractCombo,
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
        text: "Confirm",
        handler: async () => {
          const data = {
            merchant_id: this.merchantData.id,
            contract_id: this.down("[name=contract]").getValue(),
            date_from: this.down("[name=date_from]").getValue(),
            date_to: this.down("[name=date_to]").getValue(),
            report_name: this.merchantData.type
              ? "reconciliation_act_invoice"
              : "reconciliation_act",
            format: "docx"
          };
          for (const item in data) {
            if (data[item] === null)
              return D.a("Error", "Please fill all fields");
          }
          const res = await this.model.callApi(
            "report-service",
            "generateReport",
            data
          );
          if (res && res.success) {
            let link = document.createElement("a");

            link.setAttribute(
              "href",
              `${__CONFIG__.downloadFileLink}/${res.code}`
            );
            link.click();
            return this.close();
          } else return D.a("Error", res.error);
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
