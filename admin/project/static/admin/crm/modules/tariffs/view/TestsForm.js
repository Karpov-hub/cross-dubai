Ext.define("Crm.modules.tariffs.view.TestsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Test: {name}",
  iconCls: "x-fa fa-wrench",

  requires: ["Core.form.DependedCombo", "Core.form.AceEditor"],

  controllerCls: "Crm.modules.tariffs.view.TestsFormController",
  formLayout: "border",
  formMargin: 0,

  buildItems() {
    return [
      {
        xtype: "panel",
        region: "west",
        layout: "border",
        width: "50%",
        split: true,
        items: [this.buildFormFields(), this.buildCheckList()]
      },
      {
        xtype: "panel",
        region: "center",
        layout: "border",
        items: [
          this.buildInputDataEditor(),
          {
            xtype: "tabpanel",
            region: "center",
            layout: "fit",
            items: [this.buildOutputDataEditor(), this.consoleLogPanel()]
          }
        ]
      }
    ];
  },

  buildFormFields() {
    let plan_id = this.scope.scope.currentData.id;
    const planField = Ext.create("Ext.form.field.Text", {
      name: "plan_id",
      value: plan_id,
      hidden: true
    });
    this.realm = Ext.create("Crm.modules.realm.view.RealmCombo", {
      parentEl: planField,
      parentField: "tariff",
      name: "realm_id"
    });
    return {
      xtype: "panel",
      region: "north",
      height: 300,
      layout: "anchor",
      split: true,
      scrollable: true,
      defaults: {
        anchor: "100%",
        margin: 5,
        xtype: "textfield"
      },
      items: [
        { name: "id", hidden: true },
        {
          name: "name",
          fieldLabel: D.t("Name")
        },
        planField,
        this.buildTriggerCombo(),
        this.realm,
        {
          xtype: "dependedcombo",
          valueField: "id",
          displayField: "last_name",
          displayTpl: Ext.create(
            "Ext.XTemplate",
            '<tpl for=".">',
            "{first_name} {last_name}",
            "</tpl>"
          ),
          parentEl: this.realm,
          parentField: "realm",
          tpl: Ext.create(
            "Ext.XTemplate",
            '<ul class="x-list-plain"><tpl for=".">',
            '<li role="option" class="x-boundlist-item">{first_name} {last_name}</li>',
            "</tpl></ul>"
          ),
          name: "user_id",
          dataModel: "Crm.modules.accountHolders.model.UsersModel",
          fieldSet: "id,first_name,last_name,email,realm",
          fieldLabel: D.t("User")
        },
        {
          xtype: "textareafield",
          name: "description",
          height: 80,
          fieldLabel: D.t("Description")
        }
      ]
    };
  },

  buildCheckList() {
    return Ext.create("Crm.modules.tariffs.view.TestsChecksGrid", {
      title: D.t("Expected result"),
      scope: this,
      region: "center",
      cls: "grayTitlePanel",
      observe: [{ property: "test_id", param: "id" }]
    });
  },

  buildInputDataEditor() {
    return {
      cls: "grayTitlePanel",
      xtype: "panel",
      layout: "fit",
      title: D.t("Input data"),
      region: "north",
      height: 300,
      split: true,
      items: {
        xtype: "aceeditortextarea",
        name: "data"
      }
    };
  },

  consoleLogPanel() {
    return {
      cls: "grayTitlePanel",
      xtype: "panel",
      layout: "fit",
      title: D.t("Console log"),
      items: {
        xtype: "textarea",
        name: "consolelog",
        readOnly: true
      }
    };
  },

  buildOutputDataEditor() {
    this.dataField = Ext.create("Crm.modules.tariffs.view.DataBuilder", {
      name: "result",
      listeners: {
        celldblclick: (record) => {
          this.insertIntoExpectedResult(
            record.data._id.replace(/^root:data:/, "").replace(/:/g, "."),
            record.data.example
          );
        }
      }
    });

    return {
      cls: "grayTitlePanel",
      xtype: "panel",
      layout: "fit",
      title: D.t("Result data"),
      items: this.dataField
    };
  },

  buildTriggerCombo() {
    return {
      xtype: "fieldcontainer",
      layout: "hbox",
      items: [
        {
          xtype: "combo",
          name: "trigger",
          fieldLabel: D.t("Trigger"),
          valueField: "id",
          flex: 1,
          displayField: "name",
          queryMode: "local",
          store: Ext.create("Core.data.ComboStore", {
            dataModel: Ext.create("Crm.modules.tariffs.model.TriggersModel"),
            fieldSet: ["id", "name"],
            scope: this
          })
        },
        {
          xtype: "button",
          action: "set_data",
          width: 150,
          text: D.t("Set Data")
        }
      ]
    };

    return;
  },

  buildEventCombo(me) {
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
      ].join(""),
      listeners: {
        change(el, newV) {
          let val = newV ? newV.split(":") : null;
          me.down("[name=service]").setValue(val[0]);
          me.down("[name=method]").setValue(val[1]);
        }
      }
    });
    return this.EventCombo;
  },

  buildButtons: function() {
    var btns = [
      {
        tooltip: D.t("Remove this record"),
        iconCls: "x-fa fa-trash-alt",
        action: "remove"
      },
      "->",
      {
        text: D.t("Run test"),
        iconCls: "x-fa fa-check",
        scale: "medium",
        action: "run_test"
      },
      {
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square",
        scale: "medium",
        action: "save"
      },
      { text: D.t("Save"), iconCls: "x-fa fa-check", action: "apply" },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];

    return btns;
  },

  insertIntoExpectedResult(parameter, value) {
    this.fireEvent("insert_checks", parameter, value, this.currentData.id);
  }
});
