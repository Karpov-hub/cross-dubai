Ext.define("Crm.modules.tariffs.view.AddObjectWindow", {
  extend: "Ext.window.Window",

  autoShow: true,
  modal: true,

  iconCls: "x-fa fa-cloud-download",
  layout: "border",

  padding: 0,
  width: 700,
  height: 500,

  requires: ["Core.form.TreePicker", "Core.form.DependedCombo"],

  title: D.t("Adding extended object"),

  initComponent() {
    this.buttons = this.buildButtons();
    this.items = this.buildItems();
    this.fieldModel = Ext.create(
      "Crm.modules.tariffs.model.DbTablesFieldsModel"
    );
    this.callParent(arguments);
  },

  buildItems() {
    return [
      {
        xtype: "form",
        padding: 5,
        height: 130,
        layout: "anchor",
        region: "north",
        style: "background: #ffffff",
        defaults: { anchor: "100%" },
        items: [
          {
            xtype: "textfield",
            name: "name",
            fieldLabel: D.t("Object name")
          },
          this.buildKeyField(),
          this.buildSourceFields(),
          this.buildPeriodField()
        ]
      },
      {
        xtype: "panel",
        style: "background: #ffffff",
        region: "center",
        layout: "fit",
        padding: 5,
        items: {
          xtype: "textarea",
          name: "data",
          readOnly: true,
          fieldLabel: D.t("Fields in new object")
        }
      }
    ];
  },

  buildKeyField() {
    return {
      xtype: "treecombo",
      name: "keyfield",
      store: this.scope.store,
      fieldLabel: D.t("Key field")
    };
  },

  buildSourceFields() {
    return {
      xtyle: "fieldcontainer",
      layout: "hbox",
      defaults: {
        xtype: "dependedcombo",
        editable: false,
        fieldSet: "name",
        valueField: "name",
        displayField: "name",
        flex: 1
      },
      margin: "0 0 5 0",
      items: [
        {
          margin: "0 5 0 0",
          name: "collection",
          fieldLabel: D.t("View name"),
          emptyText: "Select table in the data base",
          dataModel: "Crm.modules.tariffs.model.DbTablesModel"
        },
        {
          xtype: "dependedcombo",
          margin: "0 0 0 5",
          name: "field",
          fieldLabel: D.t("Field"),
          emptyText: "Select key field",
          parentEl: "collection",
          parentField: "name",
          dataModel: "Crm.modules.tariffs.model.DbTablesFieldsModel",
          listeners: {
            change: (el, v) => {
              this.resetObjectExample(el, v);
            }
          }
        }
      ]
    };
  },

  resetObjectExample(combo, val) {
    let out = [];
    if (val) {
      combo.getStore().each(r => {
        out.push(r.data.name);
      });
    }
    this.down("[name=data]").setValue(out.join("\n"));
  },

  buildPeriodField() {
    return {
      xtype: "textfield",
      anchor: "100%",
      name: "conditions",
      fieldLabel: D.t("Conditions")
    };
  },

  buildButtons() {
    return [
      "->",
      {
        text: D.t("Add object"),
        handler: () => {
          this.addObject();
        }
      },
      "-",
      {
        text: D.t("Close"),
        handler: () => {
          this.close();
        }
      }
    ];
  },

  addObject() {
    const name = this.down("[name=name]").getValue();
    const keyfield = this.down("[name=keyfield]").getValue();
    const collection = this.down("[name=collection]").getValue();
    const field = this.down("[name=field]").getValue();
    const conditions = this.down("[name=conditions]").getValue();
    if (!name) return false;
    if (!keyfield) return false;
    if (!collection) return false;
    if (!field) return false;

    this.getFields(fields => {
      let object = this.scope.getValue();
      object[name] = [fields];
      if (!object.__conf) object.__conf = {};
      object.__conf[name] = {
        keyfield,
        collection,
        field,
        conditions
      };
      this.scope.setValue(object);
      this.close();
    });
  },

  getFields(cb) {
    this.fieldModel.runOnServer(
      "getExampleRecord",
      { table: this.down("[name=collection]").getValue() },
      cb
    );
  }
});
