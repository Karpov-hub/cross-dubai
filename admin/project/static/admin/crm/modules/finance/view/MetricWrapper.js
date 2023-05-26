Ext.define("Crm.modules.finance.view.MetricWrapper", {
  extend: "Ext.panel.Panel",

  layout: "fit",

  requires: ["Crm.modules.finance.view.type.Line"],

  initComponent() {
    const innerEl = Ext.create(
      "Crm.modules.finance.view.type." + this.settings.gtype,
      {
        settings: this.settings
      }
    );

    this.items = innerEl;

    this.on("refresh", () => {
      innerEl.fireEvent("refresh", innerEl);
    });

    this.header = {
      titlePosition: 0,
      title: this.settings.name,
      items: [
        {
          xtype: "button",
          margin: "0 10 0 0",
          tooltip: D.t("Edit dashboard"),
          iconCls: "x-fa fa-edit",
          handler: () => {
            this.scope.fireEvent("changemetric", this);
          }
        }
      ]
    };

    this.callParent(arguments);
  }
});
