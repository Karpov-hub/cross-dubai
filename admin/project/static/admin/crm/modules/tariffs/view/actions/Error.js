Ext.define("Crm.modules.tariffs.view.actions.Error", {
  extend: "Ext.form.FieldContainer",

  layout: "anchor",

  defaults: {
    anchor: "100%",
    labelWidth: 150
  },

  initComponent() {
    this.items = [
      {
        fieldLabel: D.t("Code"),
        aname: "code",
        xtype: "textfield"
      },
      {
        fieldLabel: D.t("Message"),
        aname: "message",
        xtype: "textarea",
        height: 120
      }
    ];
    this.callParent(arguments);
  }
});
