Ext.define("Crm.modules.orders.view.InvoiceWindow", {
  extend: "Ext.window.Window",

  modal: true,
  autoShow: true,

  width: 850,
  height: 320,

  syncSize: function() {},

  title: D.t("Details"),

  requires: ["Desktop.core.widgets.GridField"],

  initComponent() {
    this.buttons = this.buildButtons();

    this.items = {
      xtype: "panel",
      layout: "anchor",
      defaults: {
        xtype: "textfield",
        anchor: "100%"
      },
      items: this.buildItems()
    };

    this.model = Ext.create("Crm.modules.orders.model.OrdersModel");
    this.callParent(arguments);

    this.down("grid")
      .getStore()
      .add({
        service: `Contractor Insertion Order Nr.${
          this.order_data.order_num
        } from ${new Date(this.order_data.order_date).toLocaleDateString()}`,
        amount: this.order_data.amount
      });
  },

  buildItems: function() {
    this.realm_department = Ext.create("Ext.form.field.Text", {
      hidden: true,
      name: "realm_department",
      value: this.order_data.realm_department
    });
    return [this.realm_department, this.buildGrid(), this.buildBanksCombo()];
  },

  buildBanksCombo() {
    return {
      xtype: "dependedcombo",
      name: "iban",
      fieldLabel: D.t("Falcon IBAN"),
      valueField: "id",
      margin: 5,
      displayField: "iban",
      parentEl: this.realm_department,
      parentField: "owner",
      dataModel: "Crm.modules.banks.model.IBANModel",
      fieldSet: "id, iban, bank_shortname, currency",
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        "{bank_shortname} - {iban} ({currency})",
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{bank_shortname} - {iban} ({currency})</li>',
        "</tpl></ul>"
      )
    };
  },

  buildGrid() {
    return {
      xtype: "gridfield",
      region: "center",
      name: "services",
      layout: "fit",
      split: true,
      fields: ["service", "amount"],

      height: 200,

      store: Ext.create("Ext.data.Store", {
        fields: ["service", "amount"],
        data: []
      }),

      columns: [
        {
          text: D.t("Service descriprion"),
          flex: 1,
          sortable: false,
          dataIndex: "service",
          menuDisabled: true,
          editor: true
        },
        {
          text: D.t("Amount"),
          width: 150,
          sortable: false,
          dataIndex: "amount",
          menuDisabled: true,
          editor: {
            xtype: "numberfield"
            // allowBlank: false
          }
        }
      ]
    };
  },

  currencyCombo() {
    this.currencyCombo = Ext.create("Crm.modules.currency.view.CurrencyCombo", {
      name: "currency",
      fieldLabel: null
    });
    return this.currencyCombo;
  },

  buildButtons() {
    return [
      "->",
      {
        text: "Confirm",
        id: "confirm_btn",
        handler: () => {
          this.buildWarning(
            "Are you sure you want to create this invoice? You could not reverse this action",
            (result) => {
              if (result === "ok") this.createInvoice();
            }
          );
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

  buildWarning(message, cb) {
    Ext.Msg.show({
      title: "Warning",
      message,
      buttons: Ext.Msg.OKCANCEL,
      icon: Ext.Msg.WARNING,
      fn: cb
    });
  },

  async createInvoice() {
    const services = [];
    this.down("grid")
      .getStore()
      .each((item) => {
        services.push({
          service: item.data.service,
          amount: item.data.amount
        });
      });

    this.down("[id=confirm_btn]").setDisabled(true);

    this.order_data.iban = this.down("[name=iban]").getValue();
    this.order_data.services = services;
    this.order_data.report_name = "ittechnologieInvoice";

    let link = document.createElement("a");
    let realm_id = await this.model.getDefaultRealm();
    let orderData = this.order_data;

    //check for empty values
    for (const item in orderData) {
      if (orderData[item] === null) {
        this.down("[id=confirm_btn]").setDisabled(false);
        return D.a("Error", "Please fill all fields");
      }
    }

    //check for emtpy amounts in services
    let amounts = services.map((item) => item.amount);
    if (amounts.includes(null)) {
      this.down("[id=confirm_btn]").setDisabled(false);
      return D.a("Error", "Please fill amount for each service");
    }

    let invoice = await this.model.callApi(
      "report-service",
      "generateReport",
      orderData,
      realm_id,
      this.order_data.merchant
    );
    if (invoice && !invoice.success) {
      this.down("[id=confirm_btn]").setDisabled(false);
      return D.a(
        "Error",
        invoice.error ||
          "Something went wrong, please try again or contact admin"
      );
    }
    link.setAttribute("href", `${__CONFIG__.downloadFileLink}/${invoice.code}`);
    link.click();
    if (invoice && invoice.code) {
      this.close();
    }
  }
});
