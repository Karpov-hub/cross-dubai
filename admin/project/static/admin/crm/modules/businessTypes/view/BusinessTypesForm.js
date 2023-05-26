Ext.define("Crm.modules.businessTypes.view.BusinessTypesForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Business type: {type}"),
  requires: ["Desktop.core.widgets.GridField"],
  formLayout: "fit",

  formMargin: 0,

  width: 800,

  syncSize: function() {},

  buildItems() {
    return {
      xtype: "panel",
      padding: 5,
      layout: "border",
      style: "background:#ffffff",
      items: [
        {
          xtype: "panel",
          region: "center",
          layout: "anchor",
          defaults: { xtype: "textfield", labelWidth: 120, anchor: "100%" },
          items: [
            {
              name: "id",
              hidden: true
            },
            {
              name: "realm",
              hidden: true
            },
            {
              name: "type",
              fieldLabel: D.t("Name")
            }
          ]
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
