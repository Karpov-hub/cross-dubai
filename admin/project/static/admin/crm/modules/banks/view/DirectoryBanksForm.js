Ext.define("Crm.modules.banks.view.DirectoryBanksForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Bank: {bank_name}"),

  formMargin: 5,

  width: 550,

  syncSize: function() {},

  buildItems() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "bank_name",
        fieldLabel: D.t("Bank Name")
      },
      {
        name: "skip_rows",
        xtype: "numberfield",
        fieldLabel: D.t("Rows to skip")
      },
      {
        name: "parse_code",
        xtype: "numberfield",
        fieldLabel: D.t("Parse code")
      },
      {
        xtype: "numberfield",
        name: "fee_percent",
        fieldLabel: D.t("Fee %")
      }
    ];
  }
});
