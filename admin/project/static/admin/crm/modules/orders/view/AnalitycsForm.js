Ext.define("Crm.modules.orders.view.AnalitycsForm", {
  extend: "Core.form.FormContainer",

  title: D.t("Analitycs"),

  controllerCls: "Crm.modules.orders.view.AnalitycsFormController",

  buildButtons() {},

  buildItems() {
    return {
      xtype: "panel",
      layout: "fit",
      items: [this.buildFilterPanel(), this.buildGridPanel()]
    };
  },

  buildFilterPanel() {
    return {
      xtype: "panel",
      layout: "hbox",
      cls: "grayTitlePanel",
      bodyPadding: 5,
      title: null,
      defaults: { flex: 1, labelWidth: 70, margin: "0 10 0 0" },
      items: [
        {
          name: "from_date",
          fieldLabel: D.t("From date"),
          xtype: "xdatefield"
        },
        {
          name: "to_date",
          fieldLabel: D.t("To date"),
          xtype: "xdatefield"
        },
        {
          xtype: "button",
          text: D.t("Build analytics"),
          action: "get_analitycs"
        }
      ]
    };
  },
  buildGridPanel() {
    this.analyticsGrid = Ext.create("Ext.grid.Panel", {
      scrollable: true,
      height: Ext.Element.getViewportHeight() * 0.6
    });
    return {
      xtype: "panel",
      layout: "fit",
      items: this.analyticsGrid
    };
  }
});
