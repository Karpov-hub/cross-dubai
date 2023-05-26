Ext.define("Crm.modules.tariffs.view.TriggersForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "{name}",
  requires: ["Desktop.core.widgets.GridField", "Core.form.DependedCombo"],
  formLayout: "border",

  formMargin: 0,

  controllerCls: "Crm.modules.tariffs.view.TriggersFormController",

  buildItems: function() {
    return [this.buildFormFields(), this.buildDataView()];
  },

  buildFormFields() {
    return {
      xtype: "panel",
      region: "north",
      height: 200,
      padding: 5,
      layout: "anchor",
      style: "background:#ffffff",
      defaults: { xtype: "textfield", labelWidth: 150, anchor: "100%" },
      items: [
        {
          name: "id",
          hidden: true
        },
        {
          name: "name",
          fieldLabel: D.t("Trigger name")
        },
        this.buildTriggerTypeCombo(),
        this.buildEventCombo(),
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          disabled: true,
          action: "cron",
          fieldLabel: D.t("Cron set"),
          items: [
            {
              name: "cron",
              xtype: "textfield",
              width: 150
            },
            {
              xtype: "dependedcombo",
              editable: false,
              fieldSet: "name",
              valueField: "name",
              displayField: "name",
              name: "tablename",
              width: 200,
              //fieldLabel: D.t("Collection"),
              emptyText: D.t("Table"),
              dataModel: "Crm.modules.tariffs.model.DbTablesModel"
            },
            {
              name: "conditions",
              emptyText: D.t("Where conditions"),
              xtype: "textfield",
              flex: 1
            },
            {
              action: "testcron",
              xtype: "button",
              text: D.t("Test"),
              width: 70
            }
          ]
        }
      ]
    };
  },

  buildTriggerTypeCombo() {
    return {
      xtype: "combo",
      fieldLabel: D.t("Trigger Type"),
      displayField: "name",
      valueField: "key",
      name: "ttype",

      store: {
        fields: ["key", "name"],
        data: [{ key: 1, name: "on event" }, { key: 2, name: "by cron" }]
      }
    };
  },

  buildEventCombo() {
    this.EventCombo = Ext.create("Ext.form.field.ComboBox", {
      xtype: "combo",
      store: {
        fields: ["service", "method", "description", "service_method"],
        data: []
      },

      fieldLabel: D.t("Event method"),
      valueField: "service_method",
      displayField: "service_method",
      queryMode: "local",
      tpl: [
        '<tpl for=".">',
        '<div class="x-boundlist-item" ><b>{service}: {method}</b><br>',
        "{description}",
        "</div></tpl>"
      ].join("")
    });
    return this.EventCombo;
  },

  buildDataView() {
    return {
      xtype: "panel",
      title: D.t("Data example"),
      region: "center",
      layout: "fit",
      items: {
        xtype: "textarea",
        name: "data"
      }
    };
  }
});
