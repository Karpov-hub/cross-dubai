Ext.define("Crm.modules.finance.view.ReportSettingsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Report: {name}"),

  requires: ["Crm.modules.finance.view.CustomGridField"],

  formLayout: "border",
  allowImportExport: true,

  controllerCls: "Crm.modules.finance.view.ReportSettingsFormController",

  formMargin: 0,

  buildItems() {
    return [
      {
        xtype: "panel",
        width: "50%",
        region: "west",
        split: true,
        layout: "border",
        style: "background:#ffffff",
        items: [
          {
            xtype: "panel",
            region: "north",
            split: true,
            padding: 5,
            height: 210,
            style: "background:#ffffff",
            layout: "anchor",
            defaults: { xtype: "textfield", labelWidth: 150, anchor: "100%" },
            items: [
              {
                name: "id",
                hidden: true
              },
              {
                name: "name",
                fieldLabel: D.t("Name")
              },
              {
                name: "description",
                fieldLabel: D.t("Description")
              },
              Ext.create("Crm.modules.currency.view.CurrencyCombo", {
                name: "currency",
                fieldLabel: D.t("Currency")
              }),
              {
                xtype: "combo",
                name: "gtype",
                store: {
                  fields: ["type", "name"],
                  data: [
                    { type: "Line", name: "Line chart" },
                    { type: "Diagram", name: "Diagram chart" },
                    //{ type: "Pie", name: "Pie chart" },
                    {
                      type: "TableTx",
                      name: "Table of transactions"
                    }
                    //{ type: "TableTrns", name: "Table of transfers" }
                  ]
                },
                valueField: "type",
                displayField: "name",
                fieldLabel: D.t("Graph type")
              },
              {
                name: "duration",
                xtype: "numberfield",
                fieldLabel: D.t("Duration (hours)")
              },
              {
                xtype: "fieldcontainer",
                layout: "hbox",
                fieldLabel: D.t("Transactions"),
                defaults: {
                  xtype: "checkbox",
                  flex: 1,
                  margin: "0 10 0 0"
                },
                items: [
                  {
                    name: "status_pending",
                    boxLabel: D.t("Pending")
                  },
                  {
                    name: "status_approved",
                    boxLabel: D.t("Approved")
                  },
                  {
                    name: "status_canceled",
                    boxLabel: D.t("Canceled")
                  },
                  {
                    name: "status_refund",
                    boxLabel: D.t("Refund")
                  }
                ]
              },
              {
                xtype: "checkbox",
                name: "separate_chart",
                fieldLabel: D.t("Extensions"),
                boxLabel: D.t("separate series for each accounts")
              }
            ]
          },
          this.buildAccounts()
        ]
      },
      this.previewBuild()
    ];
  },
  previewBuild() {
    this.previewPanel = Ext.create("Ext.panel.Panel", {
      cls: "grayTitlePanel",
      tbar: [{ text: D.t("Build preview"), action: "buildpreview" }],
      region: "center",
      layout: "fit"
    });
    return this.previewPanel;
  },
  buildAccounts() {
    return {
      xtype: "panel",

      region: "center",
      cls: "grayTitlePanel",
      title: D.t("Accounts"),
      layout: "fit",
      items: {
        name: "accounts",
        xtype: "customgridfield",
        fields: ["account", "dir"],
        columns: [
          {
            text: D.t("Account"),
            flex: 1,
            sortable: false,
            dataIndex: "account",
            menuDisabled: true,
            editor: Ext.create("Crm.modules.accounts.view.AccountsAllCombo")
          },
          {
            text: D.t("Direction"),
            flex: 1,
            sortable: false,
            dataIndex: "dir",
            menuDisabled: true,
            editor: {
              xtype: "combo",
              store: {
                fields: ["dir"],
                data: [
                  { dir: "income" },
                  { dir: "spending" },
                  { dir: "profit" }
                ]
              },
              editable: false,
              valueField: "dir",
              displayField: "dir"
            }
          }
        ]
      }
    };
  }
});
