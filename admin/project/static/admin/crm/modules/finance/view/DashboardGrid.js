Ext.define("Crm.modules.finance.view.DashboardGrid", {
  extend: "Admin.view.main.AbstractContainer",

  title: D.t("Finance dashboard"),

  requires: [
    "Ext.layout.container.Border",
    "Ext.form.field.ComboBox",
    "Ext.form.field.Number",
    "Ext.form.FieldContainer"
  ],

  initComponent() {
    this.model = Ext.create("Crm.modules.finance.model.DashboardModel");
    this.controller = Ext.create(
      "Crm.modules.finance.view.DashboardGridController"
    );
    this.tabPanel = Ext.create("Ext.tab.Panel", {
      title: this.title,
      iconCls: "x-fa fa-tachometer-alt",
      bbar: this.buildToolBar()
    });
    this.items = this.tabPanel;
    this.callParent(arguments);
  },

  buildToolBar() {
    return [
      {
        text: D.t("Add metric"),
        iconCls: "x-fa fa-plus",
        action: "addmetric"
      },
      "->",
      {
        text: D.t("Add dashboard"),
        iconCls: "x-fa fa-plus",
        action: "adddashboard"
      },
      "-",
      {
        text: D.t("Remove dashboard"),
        iconCls: "x-fa fa-trash-alt",
        action: "removedashboard"
      }
    ];
  }
});
