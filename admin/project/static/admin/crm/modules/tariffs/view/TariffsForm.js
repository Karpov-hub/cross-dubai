Ext.define("Crm.modules.tariffs.view.TariffsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Tariff: {name}",
  iconCls: "x-fa fa-list",
  requires: ["Desktop.core.widgets.GridField", "Ext.form.field.FileButton"],
  formLayout: "border",

  formMargin: 0,

  controllerCls: "Crm.modules.tariffs.view.TariffsFormController",
  allowImportExport: true,

  buildItems: function() {
    return {
      xtype: "tabpanel",
      region: "center",
      layout: "fit",
      items: [
        this.buildProfilePanel(),
        this.buildDataPanel(),
        this.buildVariablesPanel(),
        this.buildActionsPanel(),
        this.buildRulesPanel()
      ]
    };
  },

  buildProfilePanel() {
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
          height: 90,
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
            },
            this.buildTriggerCombo()
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

  buildTriggerCombo() {
    return {
      xtype: "combo",
      name: "trigger",
      fieldLabel: D.t("Trigger"),
      valueField: "id",
      displayField: "name",
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.tariffs.model.TriggersModel"),
        fieldSet: ["id", "name"],
        scope: this
      })
    };
  },

  buildDataPanel() {
    this.dataField = Ext.create("Crm.modules.tariffs.view.DataBuilder", {
      name: "data"
    });
    return {
      xtype: "panel",
      title: D.t("Data"),
      layout: "fit",
      tbar: [
        {
          text: D.t("Add object"),
          action: "addobject"
        },
        "-",
        {
          text: D.t("Synchronize data with a trigger"),
          action: "datafromtrigger"
        }
      ],

      items: this.dataField
    };
  },

  buildVariablesPanel() {
    return Ext.create("Crm.modules.tariffs.view.VariablesInTariffPanel", {
      title: D.t("Variables")
    });
  },

  buildActionsPanel() {
    this.actionsField = Ext.create("Crm.modules.tariffs.view.ActionsGrid", {
      title: D.t("Actions"),
      hideLabel: true,
      dataField: this.dataField,
      region: "center",
      name: "actions"
    });
    return this.actionsField;
  },

  buildRulesPanel() {
    return {
      xtype: "panel",
      title: D.t("Rules"),
      region: "center",
      layout: "border",
      items: [
        {
          xtype: "fieldcontainer",
          region: "north",
          height: 40,
          margin: 5,
          items: {
            xtype: "checkbox",
            name: "stop_on_rules",
            labelWidth: 250,
            fieldLabel: D.t("Stop if rules return result true")
          }
        },
        Ext.create("Crm.modules.tariffs.view.RulesGrid", {
          title: null,
          hideLabel: true,
          dataField: this.dataField,
          actionsField: this.actionsField,
          region: "center",
          name: "rules",
          scope: this
        })
      ]
    };
  }
});
