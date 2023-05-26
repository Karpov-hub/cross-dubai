Ext.define("Crm.modules.contracts.view.RealmContractsForm", {
  extend: "Crm.modules.contracts.view.ContractsForm",
  model: "Crm.modules.contracts.model.ContractsModel",
  titleTpl: D.t("Contract: {name}"),

  controllerCls: "Crm.modules.contracts.view.RealmContractsFormController",

  buildMerchantCombo() {
    this.merchantId = Ext.create("Core.form.DependedCombo", {
      name: "merchant_id",
      fieldSet: "id,legalname",
      anchor: "100%",
      displayField: "legalname",
      valueField: "id",
      parentEl: this.realmId,
      parentField: "realm",
      dataModel: "Crm.modules.accountHolders.model.UsersModel",
      fieldLabel: D.t("Merchant")
    });
    return this.merchantId;
  },
  buildOrgCombo() {
    return {
      xtype: "dependedcombo",
      anchor: "100%",
      valueField: "id",
      displayField: "name",
      name: "merchant_organization",
      queryMode: "local",
      parentEl: this.merchantId,
      parentField: "user_id",
      dataModel: "Crm.modules.merchants.model.MerchantsModel",
      fieldSet: "id,user_id,name",
      fieldLabel: D.t("Organization")
    };
  }
});
