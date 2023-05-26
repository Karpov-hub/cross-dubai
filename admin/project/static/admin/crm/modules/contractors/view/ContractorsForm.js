Ext.define("Crm.modules.contractors.view.ContractorsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Contractor: {name}"),

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
        fieldLabel: D.t("Company Name")
      },
      {
        name: "reg_num",
        fieldLabel: D.t("Reg. №")
      },
      {
        name: "country",
        fieldLabel: D.t("City, Country")
      },
      {
        name: "tax_id",
        fieldLabel: D.t("TAX ID")
      },
      {
        name: "vat",
        fieldLabel: D.t("VAT №")
      },
      {
        name: "legal_address",
        fieldLabel: D.t("Legal Address")
      },
      {
        name: "office_address",
        fieldLabel: D.t("Office Address")
      },
      {
        name: "phone",
        fieldLabel: D.t("Phone")
      },
      {
        name: "email",
        fieldLabel: D.t("E-mail")
      },
      {
        name: "agreement_num",
        fieldLabel: D.t("Agreement №")
      },
      {
        xtype: "xdatefield",
        format: D.t("d/m/Y"),
        submitFormat: "Y-m-d",
        name: "agreement_date",
        fieldLabel: D.t("Agreement Date")
      },
      {
        name: "report_name",
        fieldLabel: D.t("Template name")
      }
    ];
  }
});
