Ext.define("Crm.modules.transporters.view.TransporterForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Transporter: {host_transporter}"),
  requires: ["Desktop.core.widgets.GridField"],
  formLayout: "fit",

  formMargin: 0,

  width: 700,
  height: 280,

  syncSize: function() {},

  buildItems() {
    return {
      xtype: "panel",
      padding: 5,
      layout: "anchor",
      defaults: { xtype: "textfield", labelWidth: 150, anchor: "100%" },
      items: [
        {
          name: "id",
          hidden: true
        },
        {
          name: "name",
          fieldLabel: D.t("Service name")
        },
        {
          name: "host_transporter",
          fieldLabel: D.t("Host")
        },
        {
          name: "port_transporter",
          fieldLabel: D.t("Port")
        },
        {
          xtype: "checkbox",
          name: "secure_transporter",
          fieldLabel: D.t("Secure")
        },
        {
          name: "user_transporter",
          fieldLabel: D.t("User (Email)")
        },
        {
          name: "password_transporter",
          fieldLabel: D.t("Password")
        }
      ]
    };
  },

  buildButtons: function() {
    return [
      "->",
      {
        text: D.t("Save"),
        iconCls: "x-fa fa-check-square",
        scale: "medium",
        action: "save"
      },

      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
