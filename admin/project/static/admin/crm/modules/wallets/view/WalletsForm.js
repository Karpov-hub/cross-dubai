Ext.define("Crm.modules.wallets.view.WalletsForm", {
  extend: "Core.form.FormWindow",

  model: "Crm.modules.wallets.model.WalletsModel",

  titleTpl: D.t("Wallet: {name}"),

  syncSize: function() {},

  width: 810,
  height: 600,

  formLayout: "fit",

  controllerCls: "Crm.modules.wallets.view.WalletsFormController",
  requires: ["Core.form.DependedCombo"],

  buildItems() {
    return {
      xtype: "panel",
      items: [this.WalletFormComponent(), this.buildMerchantsWalletGrid()]
    };
  },

  WalletFormComponent() {
    this.cryptoFilter = Ext.create("Ext.form.field.Checkbox", {
      name: "ctypto",
      value: true
    });
    return {
      xtype: "panel",
      height: 145,
      split: true,
      defaults: { width: "100%", xtype: "textfield" },
      items: [
        { name: "id", hidden: true },
        { name: "user_id", hidden: true },
        { name: "name", fieldLabel: D.t("Name") },
        {
          name: "num",
          fieldLabel: D.t("Address"),
          allowBlank: false
        },
        {
          xtype: "checkbox",
          name: "status",
          flex: 1,
          margin: "0 0 10 0",
          fieldLabel: D.t("Active")
        },
        {
          xtype: "checkbox",
          name: "send_via_chain_required",
          flex: 1,
          fieldLabel: D.t("Chain of wallets required")
        }
      ]
    };
  },

  buildMerchantsWalletGrid() {
    return {
      xtype: "panel",
      title: D.t("Merchant's crypto wallets"),
      layout: "fit",
      height: 375,
      items: {
        bodyPadding: 20,
        scrollHorizontal: true,
        xtype: "gridfield",
        name: "walletAccess",
        fields: ["name", "activeWallet"],
        buildTbar() {
          return null;
        },
        columns: [
          {
            text: D.t("Merchant"),
            flex: 1,
            sortable: true,
            dataIndex: "name"
          },
          {
            text: D.t("Active"),
            width: 70,
            dataIndex: "activeWallet",
            editor: {
              xtype: "checkbox",
              inputValue: true,
              uncheckedValue: false
            },
            filter: true,
            action: "bindingHeader",
            renderer(v) {
              return v ? "YES" : "";
            }
          }
        ]
      }
    };
  },

  buildButtons: function() {
    return [
      {
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square",
        action: "check_and_save"
      },
      "-",
      {
        text: D.t("Save"),
        iconCls: "x-fa fa-check",
        action: "check_and_apply"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
