Ext.define("Admin.view.main.NRPanel", {
  extend: "Ext.panel.Panel",
  xtype: "nrpanel",

  viewModel: Ext.create("Admin.view.main.NRModel"),

  layout: "hbox",
  margin: 0,
  bodyPadding: 0,

  initComponent() {
    this.items = [
      {
        xtype: "label",
        width: 80,
        margin: "3 0 0 0",
        text: D.t("NIL RATES:")
      },
      {
        iconCls: "x-fa fa-sync",
        xtype: "button",
        handler: () => {
          this.getViewModel().loadNilRates();
        }
      }
    ];
    this.loadNilRates();
    this.callParent(arguments);
  },

  async loadNilRates() {
    await this.getViewModel().loadNilRates();
    this.add({
      xtype: "combo",
      width: 200,
      tpl: `<tpl for=".">
        <div class="x-boundlist-item" >
           {field1.alias} <b>{field1.rate}</b><br>              
        </div>
      </tpl>`,
      displayTpl: `{[values[0].field1.alias]} {[values[0].field1.rate]}`,
      queryMode: "local",
      bind: {
        store: `{nil_rates}`,
        value: `{nil_rates.0}`
      }
    });
  }
});
