Ext.define("Crm.modules.tariffs.view.EasySettingsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Base tariff: {name}"),

  formMargin: 5,

  width: 550,
  height: 310,

  syncSize: function() {},

  //controllerCls: "Crm.modules.accounts.view.AccountsFormController",

  buildItems() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "name",
        fieldLabel: D.t("Title")
      },
      {
        name: "pcategory",
        fieldLabel: D.t("Payment category")
      },
      this.buildPurseCombo(),
      {
        xtype: "fieldset",
        title: D.t("Comissions"),
        layout: "anchor",
        defaults: {
          xtype: "fieldcontainer",
          layout: "hbox",
          anchor: "100%",
          defaults: {
            xtype: "numberfield",
            margin: "0 10 0 0",
            flex: 1
          }
        },
        items: [
          {
            items: [
              {
                name: "fee_withdrawal",
                fieldLabel: D.t("withdrawal")
              },
              {
                name: "fee_transfer",
                fieldLabel: D.t("send money")
              }
            ]
          },
          {
            items: [
              {
                name: "fee_masspayment",
                fieldLabel: D.t("mass payment")
              },
              {
                name: "fee_merchant",
                fieldLabel: D.t("merchant")
              }
            ]
          }
        ]
      },
      {
        xtype: "fieldset",
        title: D.t("Enabled"),
        layout: "hbox",
        defaults: {
          xtype: "checkbox",
          margin: "0 10 10 0",
          flex: 1
        },
        items: [
          {
            name: "enb_deposit",
            fieldLabel: D.t("deposit")
          },
          {
            name: "enb_withdrawal",
            fieldLabel: D.t("withdrawal")
          },
          {
            name: "enb_merchant",
            fieldLabel: D.t("merchant")
          }
        ]
      }
    ];
  },

  buildButtons: function() {
    return [
      {
        tooltip: D.t("Remove this record"),
        iconCls: "x-fa fa-trash-alt",
        action: "remove"
      },
      "->",
      {
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square",
        action: "save"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  },

  buildPurseCombo() {
    return {
      xtype: "combo",
      name: "ptype",
      fieldLabel: D.t("Purse type"),
      valueField: "key",
      displayField: "val",
      value: "electron",
      store: {
        fields: ["key", "val"],
        data: [
          {
            key: "electron",
            val: D.t("Electron money")
          },
          {
            key: "crypto",
            val: D.t("Crypto money")
          }
        ]
      }
    };
  }
});
