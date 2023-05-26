Ext.define("Admin.view.main.NFPanel", {
  extend: "Ext.panel.Panel",
  xtype: "nfpanel",

  //width: 200,

  viewModel: Ext.create("Admin.view.main.NFModel"),

  layout: "hbox",
  margin: "3 0 5 0",
  bodyPadding: 0,

  initComponent() {
    this.items = [
      {
        xtype: "label",
        width: 40,
        margin: "3 0 0 0",
        text: D.t("NF:")
      },
      {
        iconCls: "x-fa fa-sync",
        xtype: "button",
        handler: () => {
          this.getViewModel().loadBlockchains();
        }
      }
    ];
    this.loadBlockchains();
    this.callParent(arguments);
  },

  async loadBlockchains() {
    await this.getViewModel().loadBlockchains();
    this.add({
      xtype: "combo",
      width: 200,
      tpl: `<tpl for=".">
        <div class="x-boundlist-item" >
          <b>{field1.fee}</b> {field1.abbr}<br>              
        </div>
      </tpl>`,
      displayTpl: `{[values[0].field1.fee]} {[values[0].field1.abbr]}`,
      queryMode: "local",
      bind: {
        store: `{blockchains}`,
        value: `{blockchains.0}`
      }
    });
  }
});
