Ext.define("Admin.view.main.MasterPanel", {
  extend: "Ext.panel.Panel",
  xtype: "masterpanel",

  //width: 200,

  viewModel: Ext.create("Admin.view.main.MasterModel"),

  layout: "hbox",
  margin: 0,
  bodyPadding: 0,

  initComponent() {
    this.items = [
      {
        xtype: "label",
        width: 40,
        margin: "3 0 0 0",
        text: D.t("SK:")
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
          <b>{field1.balance}</b> {field1.abbr}<br>              
        </div>
      </tpl>`,
      queryMode: "local",
      displayTpl: `{[values[0].field1.balance]} {[values[0].field1.abbr]}`,
      bind: {
        store: `{blockchains}`,
        value: `{blockchains.0}`
      }
    });
  }
});
