Ext.define("Crm.modules.tariffs.view.PlansForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Tariffs plan: {name}",
  iconCls: "x-fa fa-list",
  requires: ["Desktop.core.widgets.GridField", "Core.form.MultiCombo"],
  formLayout: "border",

  formMargin: 0,

  controllerCls: "Crm.modules.tariffs.view.PlansFormController",
  allowImportExport: true,

  buildItems: function() {
    return {
      xtype: "tabpanel",
      region: "center",
      layout: "fit",
      items: [
        this.buildDescriptionPanel(),
        this.buildTariffsPanel(),
        this.buildVariablesPanel(),
        this.buildTestsPanel()
      ]
    };
  },

  buildDescriptionPanel() {
    return {
      xtype: "panel",
      title: D.t("General"),
      padding: 5,
      layout: "border",
      style: "background:#ffffff",
      items: [
        {
          xtype: "panel",
          region: "north",
          height: 40,
          layout: "anchor",
          defaults: { xtype: "textfield", labelWidth: 150, anchor: "100%" },
          items: [
            {
              name: "id",
              hidden: true
            },
            {
              name: "name",
              fieldLabel: D.t("Tariff title")
            }
          ]
        },
        {
          xtype: "textarea",
          region: "center",
          name: "description",
          labelWidth: 150,
          style: "background:#ffffff",
          fieldLabel: D.t("Description")
        }
      ]
    };
  },

  buildTariffsPanel() {
    return {
      xtype: "panel",
      title: D.t("Tariffs"),
      layout: "fit",
      padding: 10,
      items: {
        xtype: "multicombo",
        name: "tariffs",
        valueField: "id",
        fieldSet: "id,name",
        dataModel: "Crm.modules.tariffs.model.TariffsModel"
      }
    };
  },

  buildVariablesPanel() {
    return Ext.create("Crm.modules.tariffs.view.VariablesInTariffPanel", {
      title: D.t("Variables"),
      buildTbar: function() {
        var me = this;
        me.toolBar = Ext.create("Ext.toolbar.Toolbar", {
          items: [
            {
              text: D.t("Insert"),
              iconCls: "fa fa-plus",
              activity: "add",
              handler: function() {
                me.insertRow();
              }
            },
            "-",
            {
              text: D.t("Import from tariffs"),
              iconCls: "x-fa fa-chevron-down",
              activity: "importfromtariff"
            },
            "->",
            {
              text: D.t("Clean"),
              activity: "remove",
              handler: function() {
                me.cleanAll();
              }
            }
          ]
        });
        return me.toolBar;
      }
    });
  },

  buildTestsPanel() {
    return {
      xtype: "panel",
      title: D.t("Tests"),
      layout: "fit",
      padding: 10,
      items: {
        xtype: "panel",
        layout: "fit",
        region: "center",
        cls: "grayTitlePanel",
        items: Ext.create("Crm.modules.tariffs.view.TestsGrid", {
          scope: this
        })
      }
    };
  }
});
