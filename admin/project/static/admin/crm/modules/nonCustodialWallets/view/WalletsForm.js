Ext.define("Crm.modules.nonCustodialWallets.view.WalletsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Create off-system address"),

  formLayout: "fit",
  formMargin: 0,

  autoShow: true,
  modal: true,
  closable: true,

  resizable: !Ext.platformTags.phone,
  draggable: !Ext.platformTags.phone,

  width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 550,
  height: Ext.platformTags.phone ? Ext.Element.getViewportHeight() : 250,

  syncSize: function() {},

  controllerCls: "Crm.modules.nonCustodialWallets.view.WalletsFormController",

  buildClientsCombo() {
    return Ext.create("Crm.modules.accountHolders.view.UsersCombo", {
      name: "user_id",
      fieldLabel: D.t("Client"),
      allowBlank: true
    });
  },

  buildMerchantsCombo() {
    return Ext.create("Crm.modules.merchants.view.MerchantsCombo", {
      name: "merchant_id",
      fieldLabel: D.t("Merchant"),
      allowBlank: true,
      disabled: true
    });
  },

  buildCurrencyCombo() {
    return Ext.create("Crm.modules.currency.view.CurrencyCombo", {
      name: "currency",
      currency_type: "part_crypto",
      fieldLabel: D.t("Currency"),
      allowBlank: false
    });
  },

  buildItems() {
    return {
      xtype: "panel",
      layout: "anchor",
      defaults: {
        anchor: "100%",
        xtype: "textfield",
        labelAlign: Ext.platformTags.phone ? "top" : "left",
        labelWidth: 130,
        margin: 5
      },
      items: [
        {
          name: "id",
          hidden: true
        },
        {
          name: "address",
          hidden: true
        },
        this.buildCurrencyCombo(),
        this.buildClientsCombo(),
        this.buildMerchantsCombo(),
        {
          fieldLabel: D.t("Memo"),
          name: "memo",
          xtype: "textareafield"
        }
      ]
    };
  },

  buildButtons: function() {
    return [
      {
        text: D.t("Save"),
        iconCls: "x-fa fa-check-square",
        action: "save"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
