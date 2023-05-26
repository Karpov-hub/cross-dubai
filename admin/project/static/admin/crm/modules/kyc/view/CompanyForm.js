Ext.define("Crm.modules.kyc.view.CompanyForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Company KYC",
  iconCls: "x-fa fa-list",
  controllerCls: "Crm.modules.kyc.view.CompanyFormController",

  syncSize: function() {
    var width = Ext.Element.getViewportWidth(),
      height = Ext.Element.getViewportHeight();

    this.setSize(Math.floor(width * 0.25), Math.floor(height * 0.4));
    this.setXY([Math.floor(width * 0.05), Math.floor(height * 0.05)]);
  },
  formMargin: 0,

  buildItems: function() {
    return [
      {
        xtype: "panel",
        margin: { left: 10 },
        layout: "vbox",
        defaults: {
          xtype: "textfield",
          width: 430,
          readOnly: true,
          labelWidth: 120
        },
        items: [
          {
            name: "id",
            hidden: true
          },
          {
            fieldLabel: D.t("Name"),
            name: "name"
          },
          {
            fieldLabel: D.t("Registrar name"),
            name: "registrar_name"
          },
          {
            fieldLabel: D.t("Tax number"),
            name: "tax_number"
          },
          {
            fieldLabel: D.t("Registration number"),
            name: "registration_number"
          },
          {
            fieldLabel: D.t("Registration date"),
            xtype: "xdatefield",
            name: "registration_date"
          },
          {
            fieldLabel: D.t("Incorporation form"),
            name: "incorporation_form"
          },
          {
            fieldLabel: D.t("Beneficial owner"),
            name: "beneficial_owner"
          },
          {
            fieldLabel: D.t("Phone"),
            name: "phone"
          },
          {
            fieldLabel: D.t("Verification status"),
            name: "verified",
            xtype: "combo",
            valueField: "code",
            displayField: "name",
            queryMode: "local",
            store: Ext.create("Ext.data.ArrayStore", {
              fields: ["code", "name"],
              data: [["1", "Pending"], ["2", "Resolved"], ["3", "Rejected"]]
            })
          }
        ]
      }
    ];
  },
  buildButtons: function() {
    return [
      {
        text: D.t("Resolve"),
        iconCls: "x-fa fa-check-square",
        action: "resolve_kyc"
      },
      "-",
      {
        text: D.t("Reject"),
        iconCls: "x-fa fa-check-square",
        action: "reject_kyc"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
