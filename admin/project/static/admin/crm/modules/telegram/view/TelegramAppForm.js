Ext.define("Crm.modules.telegram.view.TelegramAppForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Telegram app"),

  formLayout: "fit",
  formMargin: 0,

  width: 550,
  height: 250,

  syncSize: function() {},

  controllerCls: "Crm.modules.telegram.view.TelegramAppFormController",

  buildItems() {
    return {
      xtype: "panel",
      layout: "anchor",
      defaults: {
        anchor: "100%",
        xtype: "textfield",
        labelWidth: 130,
        margin: 5
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
        {
          name: "session",
          hidden: true
        },
        {
          name: "phone",
          xtype: "textfield",
          fieldLabel: D.t("Phone number"),
          allowBlank: false
        },
        {
          name: "app_id",
          xtype: "numberfield",
          fieldLabel: D.t("API ID"),
          allowBlank: false
        },
        {
          name: "api_hash",
          xtype: "textfield",
          fieldLabel: D.t("API Hash"),
          allowBlank: false
        },
        {
          xtype: "checkbox",
          name: "active",
          fieldLabel: D.t("Active")
        }
      ]
    };
  },

  buildButtons: function() {
    return [
      {
        text: D.t("Login"),
        action: "login",
        hidden: true
      },
      {
        text: D.t("Logout"),
        action: "logout",
        hidden: true
      },
      "->",
      {
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square",
        action: "save"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
