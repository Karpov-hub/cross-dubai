Ext.define("Crm.modules.kyc.view.AddressForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Address KYC",
  iconCls: "x-fa fa-list",

  controllerCls: "Crm.modules.kyc.view.AddressFormController",

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
          labelWidth: 110
        },
        items: [
          {
            name: "id",
            hidden: true
          },
          {
            name: "realm_id",
            hidden: true
          },
          {
            fieldLabel: D.t("Country"),
            name: "country"
          },
          {
            fieldLabel: D.t("State"),
            name: "state"
          },
          { fieldLabel: D.t("City"), name: "city" },
          {
            fieldLabel: D.t("ZIP Code"),
            name: "zip_code"
          },
          {
            fieldLabel: D.t("Address type"),
            name: "address_type"
          },
          {
            fieldLabel: D.t("Document type"),
            name: "doc_type"
          },
          {
            fieldLabel: D.t("Issue date"),
            xtype: "xdatefield",
            name: "issue_date"
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
