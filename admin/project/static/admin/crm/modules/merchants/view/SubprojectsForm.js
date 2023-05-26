Ext.define("Crm.modules.merchants.view.SubprojectsForm", {
  extend: "Crm.modules.merchants.view.MerchantsForm",

  titleTpl: D.t("Subproject: {name}"),

  model: "Crm.modules.merchants.model.MerchantsModel",
  controllerCls: "Crm.modules.merchants.view.SubprojectsFormController",
  buildItems() {
    return {
      name: "merchants_tabpanel",
      xtype: "tabpanel",
      layout: "fit",
      items: [
        this.buildGeneral(),
        this.buildAccountsPanel(),
        this.buildTariffPanel(),
        this.buildTransfers(),
        this.buildOrders(),
        this.buildNonCustodialWalletsPanel()
      ]
    };
  },
  buildGeneral() {
    return {
      xtype: "panel",
      title: D.t("General"),
      layout: "anchor",
      scrollable: true,
      horizontal: true,
      defaults: {
        xtype: "textfield",
        anchor: "100%",
        margin: 5,
        labelWidth: 150
      },
      items: [
        {
          name: "id",
          hidden: true
        },
        {
          name: "user_id",
          hidden: true
        },
        { name: "user_wallets", hidden: true },
        {
          name: "monitor_wallets",
          hidden: true
        },
        {
          name: "name",
          fieldLabel: D.t("Merchant name")
        },
        this.buildAccountsGrid(),
        {
          name: "active",
          xtype: "checkbox",
          fieldLabel: D.t("Activated")
        }
      ]
    };
  },
  buildButtons: function() {
    let buttons = this.callParent(arguments);
    for (let btn of buttons) {
      if (typeof btn == "object") btn.disabled = false;
    }
    return buttons;
  }
});
