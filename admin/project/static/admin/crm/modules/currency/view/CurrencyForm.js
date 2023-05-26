Ext.define("Crm.modules.currency.view.CurrencyForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Currency: {abbr}"),

  formMargin: 5,

  width: 550,
  height: 440,

  syncSize: function() {},

  buildItems() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "name",
        fieldLabel: D.t("Currency Name")
      },
      {
        name: "abbr",
        fieldLabel: D.t("Abbreviation")
      },
      {
        name: "code",
        fieldLabel: D.t("Code")
      },
      {
        name: "decimal",
        xtype: "numberfield",
        fieldLabel: D.t("Display decimals")
      },
      {
        name: "ui_decimal",
        xtype: "numberfield",
        fieldLabel: D.t("UI display decimals")
      },
      {
        name: "withdrawal_decimal",
        xtype: "numberfield",
        fieldLabel: D.t("Nil withdrawal decimal")
      },
      {
        name: "min_quote",
        xtype: "numberfield",
        value: 1,
        fieldLabel: D.t("Nil min. quote")
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          xtype: "checkbox",
          inputValue: true,
          uncheckedValue: false,
          flex: 1,
          margin: "0 0 10 0"
        },
        items: [
          {
            name: "crypto",
            listeners: {
              change: (el, v) => {
                this.down("[name=api]").setDisabled(!v);
                this.down("[name=apitoken]").setDisabled(!v);
                this.down("[name=provider_address]").setDisabled(!v);
                this.down("[name=explorer_url]").setDisabled(!v);
              }
            },
            fieldLabel: D.t("Crypto")
          },
          {
            name: "ap_active",
            fieldLabel: D.t("AP Active")
          },
          {
            name: "ui_active",
            fieldLabel: D.t("UI Active")
          }
        ]
      },
      {
        name: "api",
        disabled: true,
        fieldLabel: D.t("API URL")
      },
      {
        name: "apitoken",
        disabled: true,
        fieldLabel: D.t("API token")
      },
      {
        name: "provider_address",
        disabled: true,
        fieldLabel: D.t("Provider address")
      },
      {
        name: "explorer_url",
        disabled: true,
        fieldLabel: D.t("Explorer url")
      }
    ];
  },

  buildButtons: function() {
    return [
      "->",
      {
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square",
        action: "save"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
