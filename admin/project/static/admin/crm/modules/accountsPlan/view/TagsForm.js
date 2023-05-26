Ext.define("Crm.modules.accountsPlan.view.TagsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Tag: {name}"),

  formLayout: "fit",

  formMargin: 5,

  onActivate() {},
  onClose() {},
  syncSize() {},
  width: 500,
  height: 400,

  buildItems() {
    return {
      xtype: "panel",
      layout: "anchor",
      defaults: {
        xtype: "textfield",
        anchor: "100%",
        labelWidth: 130
      },
      items: [
        {
          name: "id",
          hidden: true
        },
        {
          name: "name",
          fieldLabel: D.t("Name")
        },
        {
          xtype: "textarea",
          grow: true,
          name:"description",
          fieldLabel: D.t("Description")
        }
      ]
    };
  }
});
