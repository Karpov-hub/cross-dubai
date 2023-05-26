Ext.define("Crm.modules.tariffs.view.TariffSettingsPanel", {
  extend: "Ext.panel.Panel",
  title: D.t("Tariff"),
  layout: "border",
  initComponent() {
    this.tariiPlanCombo = this.buildTariffCombo();
    this.items = [
      {
        xtype: "panel",
        region: "north",
        height: Ext.platformTags.phone ? 100 : 50,
        layout: "hbox",
        defaults: {
          margin: "9 5 5 5"
        },
        items: [
          this.tariiPlanCombo,
          {
            xtype: "button",
            width: 150,
            iconCls: "x-fa fa-chevron-down",
            handler: () => {
              this.importVariables();
            },
            text: D.t("Import Variables")
          }
        ]
      },
      {
        xtype: "panel",
        region: "center",
        title: D.t("Variables"),
        cls: "grayTitlePanel",
        layout: "fit",
        items: Ext.create("Crm.modules.tariffs.view.VariablesPanel", {
          tariiPlanCombo: this.tariiPlanCombo,
          merchant_accs_search_params: this.config.merchant_accs_search_params,
          client_accs_search_params: this.config.client_accs_search_params
        })
      }
    ];
    this.callParent(arguments);
  },

  buildTariffCombo() {
    return Ext.create("Ext.form.ComboBox", {
      xtype: "combo",
      name: "tariff",
      fieldLabel: D.t("Tariffs plan"),
      labelAlign: Ext.platformTags.phone ? "top" : "left",
      editable: false,
      valueField: "id",
      displayField: "name",
      queryMode: "local",
      flex: 1,

      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.tariffs.model.PlansValuesModel"),
        fieldSet: ["id", "name", "variables"],
        scope: this
      })
    });
  },

  importVariables() {
    const tariffEl = this.down("[name=tariff]");
    const tariff = tariffEl.getValue();
    if (!tariff) {
      return D.a("", "Select tariff", []);
    }
    const variablesEl = this.down("[name=variables]");
    const f = () => {
      tariffEl.getStore().each((item) => {
        if (item.data.id == tariff) {
          variablesEl.setValue(Ext.clone(item.data.variables));
        }
      });
    };
    if (variablesEl.getValue().length) {
      D.c("", "Replace previously entered variables?", [], () => {
        f();
      });
    } else f();
  }
});
