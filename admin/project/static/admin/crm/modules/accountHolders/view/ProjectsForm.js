Ext.define("Crm.modules.accountHolders.view.ProjectsForm", {
  extend: "Crm.modules.accountHolders.view.UsersForm",

  titleTpl: D.t(
    "Project: {legalname} ({[values.blocked ? 'Blocked':'Active']})"
  ),

  onClose: function(me) {
    if (me.noHash) return;
    if (me.closeHash)
      location.hash = "Crm.modules.accountHolders.view.ActiveUsersGrid";
  },

  model: "Crm.modules.accountHolders.model.ActiveUsersModel",

  buildItems() {
    return {
      xtype: "tabpanel",
      layout: "fit",
      items: [
        this.buildGeneral(),
        this.buildMerchants(),
        this.buildTariffPanel(),
        this.buildAccountsAndAddressesPanel(),
        this.buildCryptoWallets(),
        this.buildOrders(),
        this.buildNonCustodialWalletsPanel(),
        this.buildNotificationSettings(),
        this.buildTelegramAppsPanel()
      ]
    };
  },

  buildGeneral() {
    let items = this.callParent(arguments);
    items.items[0].items[2].items[1].fieldLabel = D.t("Project name");
    items.items[0].items[2].items[2].fieldLabel = D.t("Project role");
    return items;
  },

  buildMerchants() {
    return {
      xtype: "panel",
      layout: "fit",
      title: D.t("Subprojects"),
      items: Ext.create("Crm.modules.merchants.view.SubprojectsGrid", {
        scope: this,
        observe: [{ property: "user_id", param: "id" }]
      })
    };
  }
});
