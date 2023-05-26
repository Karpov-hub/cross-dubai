const FunctionsList = [
  { name: "sum" },
  { name: "max" },
  { name: "min" },
  { name: "average" },
  { name: "getSumAmout", params: ["data", "currency"] }
];

Ext.define("Crm.modules.tariffs.view.RulesGrid", {
  extend: "Desktop.core.widgets.GridField",

  layout: "fit",
  fields: [
    "custom_function",
    "render_function",
    "value_field",
    "ne",
    "operator",
    "value",
    "action",
    "result",
    "stop"
  ],
  requires: ["Core.form.TreePicker", "Ext.form.field.Tag"],

  initComponent() {
    this.controller = Ext.create(
      "Crm.modules.tariffs.view.RulesGridController"
    );
    this.columns = [
      {
        xtype: "actioncolumn",
        width: 25,
        menuDisabled: true,
        editor: {
          xtype: "button",
          iconCls: "x-fa fa-edit",
          handler: (el) => {
            this.fireEvent("editrule", el.ownerCt.context.record);
          }
        },
        items: [
          {
            iconCls: "x-fa fa-edit",
            tooltip: D.t("Custom rule"),
            handler: (grid, indx) => {
              this.fireEvent("editrule", grid.getStore().getAt(indx));
            }
          }
        ]
      },
      {
        text: D.t("Function"),
        width: 100,
        sortable: false,
        dataIndex: "render_function",
        menuDisabled: true,
        editor: this.buildFunctionsCombo()
      },
      {
        text: D.t("Value field"),
        flex: 1,
        sortable: false,
        dataIndex: "value_field",
        menuDisabled: true,
        editor: this.buildValueditor()
      },
      {
        text: D.t("Ne."),
        width: 50,
        sortable: false,
        dataIndex: "ne",
        menuDisabled: true,
        renderer: (v) => {
          return v ? "NE" : "";
        },
        editor: {
          xtype: "checkbox",
          inputValue: true,
          uncheckedValue: false
        }
      },
      {
        text: D.t("Operator"),
        width: 100,
        sortable: false,
        dataIndex: "operator",
        menuDisabled: true,
        editor: {
          xtype: "combo",
          valueField: "op",
          displayField: "op",
          value: "=",
          store: {
            fields: ["op"],
            data: [
              { op: "=" },
              { op: ">" },
              { op: ">=" },
              { op: "<" },
              { op: "<=" },
              { op: "in" },
              { op: "like" },
              { op: "regexp" },
              { op: "empty" }
            ]
          }
        }
      },
      {
        text: D.t("Value"),
        flex: 1,
        sortable: false,
        dataIndex: "value",
        menuDisabled: true,
        editor: {
          xtype: "treecombo",
          store: this.dataField.store
        }
      },
      {
        text: D.t("Action"),
        flex: 1,
        sortable: false,
        dataIndex: "action",
        menuDisabled: true,
        editor: {
          xtype: "tagfield",
          valueField: "name",
          displayField: "name",
          queryMode: "local",
          store: this.actionsField.down("grid").getStore()
        }
      },
      {
        text: D.t("Result Ok"),
        width: 80,
        sortable: false,
        dataIndex: "result",
        menuDisabled: true,
        renderer: (v) => {
          return v ? "YES" : "";
        },
        editor: {
          xtype: "checkbox",
          inputValue: true,
          uncheckedValue: false
        }
      },
      {
        text: D.t("Stop rules"),
        width: 100,
        sortable: false,
        dataIndex: "stop",
        menuDisabled: true,
        renderer: (v) => {
          return v ? "YES" : "";
        },
        editor: {
          xtype: "checkbox",
          inputValue: true,
          uncheckedValue: false
        }
      }
    ];
    this.callParent(arguments);
  },

  buildFunctionsCombo() {
    this.functionsCombo = Ext.create("Ext.form.field.ComboBox", {
      action: "functions",
      valueField: "name",
      displayField: "name",
      store: {
        fields: ["name", "params"],
        data: FunctionsList
      }
    });
    return this.functionsCombo;
  },

  buildValueditor() {
    this.valueEditor = Ext.create("Crm.modules.tariffs.view.RulesValueEditor", {
      store: this.dataField.store
    });
    return this.valueEditor;
  }
});

Ext.define("Crm.modules.tariffs.view.RulesValueEditor", {
  extend: "Ext.form.FieldContainer",

  mixins: {
    field: "Ext.form.field.Field"
  },
  border: false,
  bodyBorder: true,
  layout: "anchor",

  /*
  initComponent() {
    this.items = Ext.create("Core.form.TreePicker", {
      store: this.store,
      anchor: "100%"
    });
    return this.callParent(arguments);
  },
*/
  setValue(value) {
    if (!value) value = "";
    this.value = value;

    if (Ext.isArray(value)) {
      this.items.items.forEach((item, i) => {
        item.setValue(value[i]);
      });
    } else {
      this.items.items[0].setValue(value);
    }
    this.fireEvent("change", this, value);
  },

  getValue() {
    let out = [];
    this.items.items.forEach((item, i) => {
      out.push(item.getValue());
    });
    this.value = out.length == 1 ? out[0] : out;
    return this.value;
  },

  getSubmitData() {
    return this.getValue();
  },

  clear() {
    this.removeAll();
  },

  addParamField(label) {
    const cfg = { store: this.store, anchor: "100%" };
    if (label) cfg.fieldLabel = label;
    this.add(Ext.create("Core.form.TreePicker", cfg));
  }
});
