Ext.define("Crm.modules.tariffs.view.actions.Tag", {
  extend: "Ext.form.FieldContainer",

  layout: "anchor",

  defaults: {
    anchor: "100%",
    labelWidth: 150
  },

  initComponent() {
    this.items = [
      {
        fieldLabel: D.t("Key field"),
        aname: "entity",
        xtype: "treecombo",
        store: this.scope.id_store
      },
      {
        fieldLabel: D.t("Tag name"),
        aname: "tag",
        xtype: "textfield"
      }
    ];
    this.callParent(arguments);
  }
});
