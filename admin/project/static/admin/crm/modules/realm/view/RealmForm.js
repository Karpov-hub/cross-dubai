Ext.define("Crm.modules.realm.view.RealmForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "{name}",
  requires: ["Desktop.core.widgets.GridField"],
  formLayout: "fit",

  formMargin: 0,

  controllerCls: "Crm.modules.realm.view.RealmFormController",
  allowImportExport: true,

  buildItems: function() {
    return {
      xtype: "tabpanel",
      layout: "border",
      items: [
        this.buildGeneral(),
        this.buildCorsPanel(),
        this.buildDepartmentsPanel(),
        this.buildTariffPanel(),
        this.buildAccounts(),
        this.buildIBANS(),
        this.buildTransactions(),
        this.buildPermissionsGrid(),
        this.buildPaymentDetailsPanel()
      ]
    };
  },

  buildIBANS() {
    return {
      xtype: "panel",
      layout: "fit",
      title: D.t("IBANs"),
      items: Ext.create("Crm.modules.banks.view.IBANGrid", {
        scope: this,
        observe: [{ property: "owner", param: "id" }]
      })
    };
  },

  buildTransactions() {
    return {
      xtype: "panel",
      region: "east",
      cls: "grayTitlePanel",
      width: "40%",
      layout: "fit",
      split: true,
      title: D.t("Transactions"),
      items: Ext.create("Crm.modules.transactions.view.UserTransactionsGrid", {
        scope: this,
        observe: [{ property: "user_id", param: "id" }]
      })
    };
  },

  buildAccounts() {
    return {
      xtype: "panel",
      title: D.t("Accounts"),
      layout: "fit",
      items: Ext.create("Crm.modules.accounts.view.RealmAccountsGrid", {
        title: null,
        iconCls: null,
        scope: this,
        observe: [{ property: "owner", param: "id" }]
      })
    };
  },

  buildDepartmentsPanel() {
    return {
      xtype: "panel",
      title: D.t("Departments"),
      layout: "fit",
      items: Ext.create("Crm.modules.merchants.view.RealmDepartmentGrid", {
        title: null,
        iconCls: null,
        scope: this,
        observe: [{ property: "realm", param: "id" }]
      })
    };
  },

  buildTariffPanel() {
    return Ext.create("Crm.modules.tariffs.view.TariffSettingsPanel");
  },

  buildGeneral() {
    return {
      xtype: "panel",
      title: D.t("General"),

      padding: 5,
      layout: "anchor",
      style: "background:#ffffff",
      defaults: { xtype: "textfield", labelWidth: 150, anchor: "100%" },
      items: [
        {
          name: "id",
          hidden: true
        },
        Ext.create("Crm.modules.realm.view.RealmCombo", {
          name: "pid",
          //margin: "0 3 0 0",
          fieldLabel: D.t("Parent realm")
        }),
        {
          name: "name",
          fieldLabel: D.t("Realm name")
        },
        {
          name: "ip",
          fieldLabel: D.t("IP address")
        },
        {
          name: "domain",
          fieldLabel: D.t("Domain")
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          items: [
            {
              name: "token",
              xtype: "textfield",
              labelWidth: 150,
              flex: 1,
              fieldLabel: D.t("Access token")
            },
            {
              xtype: "button",
              action: "gentoken",
              width: 150,
              text: D.t("Generate token")
            }
          ]
        },
        {
          xtype: "checkbox",
          name: "admin_realm",
          fieldLabel: D.t("Admin realm")
        }
      ]
    };
  },

  buildPermissionsGrid() {
    return {
      xtype: "panel",
      title: D.t("Permissions"),
      //region: "center",
      layout: "fit",
      items: {
        xtype: "gridfield",
        name: "permiss",
        fields: ["service", "method", "description", "access"],
        buildTbar() {
          return null;
        },

        columns: [
          {
            text: D.t("Service"),
            flex: 1,
            sortable: true,
            dataIndex: "service"
          },
          {
            text: D.t("Method"),
            flex: 1,
            sortable: true,
            dataIndex: "method"
          },
          {
            text: D.t("Description"),
            flex: 1,
            sortable: true,
            dataIndex: "description"
          },
          {
            text: D.t("Access"),
            width: 70,
            dataIndex: "access",
            editor: {
              xtype: "checkbox",
              inputValue: true,
              uncheckedValue: false
            },
            action: "permissHeader",
            renderer(v) {
              return v ? "YES" : "";
            }
          }
        ]
      }
    };
  },

  buildCorsPanel() {
    return {
      xtype: "panel",
      title: D.t("CORS"),
      //region: "center",
      layout: "fit",
      items: {
        xtype: "gridfield",
        name: "cors",
        fields: ["option", "value"],
        columns: [
          {
            text: D.t("Option"),
            flex: 1,
            sortable: true,
            dataIndex: "option",
            editor: this.buildCorsOptions()
          },
          {
            text: D.t("Value"),
            flex: 1,
            sortable: true,
            dataIndex: "value",
            editor: { xtype: "textfield" }
          }
        ]
      }
    };
  },

  buildCorsOptions() {
    return {
      xtype: "combo",
      valueField: "option",
      displayField: "option",
      store: {
        fields: ["option"],
        data: [
          { option: "origin" },
          { option: "methods" },
          { option: "allowedHeaders" },
          { option: "exposedHeaders" },
          { option: "credentials" },
          { option: "maxAge" },
          { option: "preflightContinue" },
          { option: "optionsSuccessStatus" }
        ]
      }
    };
  },

  buildPaymentDetailsPanel() {
    return {
      xtype: "panel",
      title: D.t("Payment details"),
      layout: "fit",
      items: [
        {
          xtype: "textareafield",
          grow: true,
          name: "payment_details"
        }
      ]
    };
  }
});
