Ext.define("Crm.modules.settings.view.SettingsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Settings"),
  iconCls: "x-fa fa-list",

  formLayout: "fit",

  width: 550,
  height: 200,

  syncSize: function() {},

  buildItems() {
    return [
      {
        xtype: "panel",
        margin: { left: 10 },
        layout: "vbox",
        defaults: {
          xtype: "textfield",
          width: 500,
          labelWidth: 110
        },
        items: [
          {
            name: "id",
            hidden: true
          },
          {
            fieldLabel: D.t("Key"),
            name: "key"
          },
          {
            fieldLabel: D.t("Value"),
            name: "value"
          }
        ]
      }
    ];
  }
});
