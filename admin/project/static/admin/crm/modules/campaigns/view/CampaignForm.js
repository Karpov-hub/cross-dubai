Ext.define("Crm.modules.campaigns.view.CampaignForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Campaign: {caption}"),

  formMargin: 5,

  width: 550,
  height: 180,

  syncSize: function() {},

  //controllerCls: "Crm.modules.accounts.view.AccountsFormController",

  buildItems() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "merchant_id",
        hidden: true, 
      },
      {
        name: "external_id",
        fieldLabel: D.t("External ID (API)")
      },
      {
        name: "caption",
        fieldLabel: D.t("Caption")
      }
    ];
  }
});
