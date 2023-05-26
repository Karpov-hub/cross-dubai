Ext.define("Crm.modules.finance.view.type.TableTx", {
  extend: "Crm.modules.transactions.view.TransactionsGrid",

  title: "",
  iconCls: "",

  buildTbar() {},
  filterbar: false,
  filterable: false,

  initComponent(cfg) {
    this.model = Ext.create("Crm.modules.finance.model.TransactionsModel", {
      settings: this.settings
    });
    this.on("refresh", () => {
      this.store.reload();
    });
    this.callParent(arguments);
  },

  getStoreConfig() {
    const cfg = this.callParent();
    cfg.exProxyParams = this.settings;
    return cfg;
  }
});
