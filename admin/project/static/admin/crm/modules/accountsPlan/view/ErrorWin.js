Ext.define("Crm.modules.accountsPlan.view.ErrorWin", {
  extend: "Ext.window.Window",

  autoShow: true,
  modal: true,

  layout: "fit",

  width: 500,
  height: 500,
  title: D.t("Error"),

  initComponent() {
    this.items = {
      xtype: "textarea",
      readOnly: true
    };
    this.buttons = [
      {
        text: D.t("Close"),
        handler: () => {
          this.close();
        }
      }
    ];
    this.callParent(arguments);
  },

  showText(text) {
    this.down("textarea").setValue(text);
  }
});
