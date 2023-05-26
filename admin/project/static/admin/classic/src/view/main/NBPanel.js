Ext.define("Admin.view.main.NBPanel", {
  extend: "Ext.panel.Panel",
  xtype: "nbpanel",

  viewModel: Ext.create("Admin.view.main.NBModel"),

  layout: "hbox",
  margin: "3 0 5 0",
  bodyPadding: 0,

  initComponent() {
    this.items = [
      {
        xtype: "label",
        width: 80,
        margin: "3 0 0 0",
        text: D.t("NIL:")
      },
      {
        iconCls: "x-fa fa-sync",
        xtype: "button",
        handler: () => {
          this.getViewModel().loadNilBalances();
        }
      }
    ];
    this.loadNilBalances();
    this.callParent(arguments);
  },

  async loadNilBalances() {
    await this.getViewModel().loadNilBalances();
    this.add({
      xtype: "combo",
      width: 200,
      tpl: `<tpl for=".">
        <div class="x-boundlist-item" >
           {field1.abbr} <b>{field1.balance}</b><br>              
        </div>
      </tpl>`,
      displayTpl: `{[values[0].field1.abbr]} {[values[0].field1.balance]}`,
      queryMode: "local",
      bind: {
        store: `{nil_balances}`,
        value: `{nil_balances.0}`
      }
    });
  }
});
