Ext.define("Crm.modules.invoiceTemplates.view.InvoiceTemplatesForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Template: {name}"),

  formLayout: "fit",

  allowImportExport: true,

  formMargin: 0,

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
          height: 60,
          layout: "anchor",
          defaults: { xtype: "textfield", labelWidth: 150, anchor: "100%" },
          items: [
            {
              name: "id",
              hidden: true
            },
            {
              name: "name",
              fieldLabel: D.t("Name")
            },
            {
              name: "def",
              xtype: "checkbox",
              fieldLabel: D.t("Default")
            }
            /*{
              xtype: "combo",
              name: "merchant",
              fieldLabel: D.t("Attached merchant"),
              valueField: "id",
              displayField: "name",
              queryMode: "local",
              flex: 1,
              store: Ext.create("Core.data.ComboStore", {
                dataModel: Ext.create(
                  "Crm.modules.merchants.model.MerchantsModel"
                ),
                fieldSet: ["id", "name"],
                scope: this
              })
            }*/
          ]
        },
        {
          xtype: "textarea",
          region: "center",
          name: "html",
          labelWidth: 150,
          style: "background:#ffffff",
          fieldLabel: D.t("Template")
        }
      ]
    };
  }
});
