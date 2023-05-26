Ext.define("Crm.modules.kyc.view.ProfileForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Profile KYC",
  iconCls: "x-fa fa-list",
  controllerCls: "Crm.modules.kyc.view.ProfileFormController",

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
            fieldLabel: D.t("First name"),
            name: "first_name"
          },
          {
            fieldLabel: D.t("Middle name"),
            name: "middle_name"
          },
          {
            fieldLabel: D.t("Last name"),
            name: "last_name"
          },
          {
            fieldLabel: D.t("Document type"),
            name: "doc_type"
          },
          {
            fieldLabel: D.t("Document number"),
            name: "doc_num"
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
