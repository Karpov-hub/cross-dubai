Ext.define("Crm.modules.vat.view.VatLogsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("VAT Logs Finder"),

  formLayout: "fit",

  formMargin: 0,

  width: 650,
  height: 400,

  onActivate: function() {},
  onClose: function() {},
  syncSize: function() {},

  controllerCls: "Crm.modules.vat.view.VatLogsFormController",

  buildItems() {
    return {
      xtype: "panel",
      padding: 5,
      layout: "border",
      style: "background:#ffffff",
      items: [
        {
          xtype: "panel",
          region: "north",
          height: 90,
          layout: "anchor",
          defaults: { xtype: "textfield", labelWidth: 150, anchor: "100%" },
          items: [
            {
              xtype: "dependedcombo",
              name: "country",
              fieldLabel: D.t("Country"),
              valueField: "abbr2",
              displayField: "name",
              dataModel: "Crm.modules.settings.model.CountriesModel",
              fieldSet: "abbr2,name"
            },
            {
              name: "vat_num",
              fieldLabel: D.t("VAT Number")
            },
            {
              name: "ctime",
              fieldLabel: D.t("Date"),
              xtype: "xdatefield",
              submitFormat: "Y-m-d",
              format: D.t("d/m/Y"),
              flex: 1
            }
          ]
        },
        {
          xtype: "textarea",
          region: "center",
          name: "vat_log",
          labelWidth: 150,
          style: "background:#ffffff",
          fieldLabel: D.t("Log"),
          readOnly: true
        }
      ]
    };
  },
  buildButtons: function() {
    return [
      "-",
      { text: D.t("Search"), iconCls: "x-fa fa-search", action: "find_log" },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
