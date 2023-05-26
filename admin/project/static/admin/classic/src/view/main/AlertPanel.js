Ext.define("Admin.view.main.AlertPanel", {
  extend: "Ext.toolbar.Toolbar",
  xtype: "alertpanel",

  //width: 200,

  viewModel: Ext.create("Admin.view.main.AlertModel"),

  layout: "hbox",

  initComponent() {
    this.setHidden(true);
    this.items = [
      {
        iconCls: "x-fa fa-check",
        handler: async () => {
          let res = await this.getViewModel().checkAlert({ hide_label: true });
          if (!res.message) this.setHidden(true);
        }
      },
      {
        xtype: "label",
        text: D.t("Warning:"),
        style: "font-weight:bold;color: orange;"
      }
    ];
    this.checkAlert();
    this.callParent(arguments);
  },

  async checkAlert() {
    const res = await this.getViewModel().checkAlert();

    if (res.message) {
      this.setHidden(false);
      this.add({
        value: `${res.message}`,
        xtype: "displayfield",
        margin: "0 10 -4 0"
      });
    }
  }
});
