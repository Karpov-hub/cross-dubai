Ext.define("Crm.modules.finance.view.DashboardForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Metrica"),

  formLayout: "anchor",

  formMargin: 5,

  width: 400,
  height: 200,

  syncSize() {},
  onActivate() {},

  buildItems() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "pid",
        value: this.dashboard ? this.dashboard._id : null,
        hidden: true
      },
      {
        name: "indx",
        labelWidth: 80,
        xtype: "numberfield",
        helpText: D.t("Dashboard Metric Sort Index"),
        fieldLabel: D.t("Index")
      },
      {
        name: "width",
        labelWidth: 80,
        helpText: D.t("Examples:\n200\n55%\nbig-50 small-100"),
        fieldLabel: D.t("Width")
      },
      {
        name: "height",
        labelWidth: 80,
        fieldLabel: D.t("Height")
      },
      this.buildSettingsCombo()
    ];
  },

  buildSettingsCombo() {
    return {
      xtype: "combo",
      labelWidth: 80,
      fieldLabel: D.t("Metric"),
      name: "settings",
      valueField: "id",
      displayField: "name",
      queryMode: "local",
      editable: false,
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.finance.model.ReportSettingsModel"),
        fieldSet: ["id", "name"],
        scope: this
      })
    };
  },

  buildButtons: function() {
    return [
      {
        tooltip: D.t("Remove this record"),
        iconCls: "x-fa fa-trash-alt",
        action: "remove"
      },
      "->",
      {
        text: D.t("Save"),
        iconCls: "x-fa fa-check-square",
        action: "save"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
