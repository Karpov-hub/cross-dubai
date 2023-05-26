Ext.define("Crm.modules.tariffs.view.CustomFunctionEditor", {
  extend: "Core.window.Window",
  layout: "border",
  noHash: true,

  title: D.t("Rule editor"),

  requires: [
    "Ext.tab.Panel",
    "Ext.layout.container.Border",
    "Ext.form.field.ComboBox",
    "Ext.form.field.Number",
    "Ext.form.FieldContainer"
  ],

  initComponent() {
    this.buttons = this.buildButtons();
    this.items = [this.buildForm(), this.buildDataPanel()];
    this.callParent(arguments);

    let me = this;
    this.on("render", () => {
      me.custom_code = ace.edit("custom_code", {
        mode: "ace/mode/javascript",
        selectionStyle: "text"
      });
      me.custom_code.setValue(me.codeField.value);
    });
  },

  buildButtons() {
    var btns = [
      {
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square",
        scale: "medium",
        handler: () => {
          this.save();
          this.close();
        }
      },
      {
        text: D.t("Save"),
        iconCls: "x-fa fa-check",
        handler: () => {
          this.save();
        }
      },
      "-",
      {
        text: D.t("Close"),
        iconCls: "x-fa fa-ban",
        handler: () => {
          this.close();
        }
      }
    ];

    return btns;
  },

  save() {
    if (!!this.onEdit) {
      this.onEdit(this.custom_code.getValue());
    }
  },

  buildForm() {
    this.codeField = Ext.create("Ext.form.field.TextArea", {
      region: "center",
      emptyText: D.t("Write JS code"),
      value: this.functionCode,
      height: 240,
      id: "custom_code"
    });

    return this.codeField;
  },

  buildDataPanel() {
    this.dataField = Ext.create("Crm.modules.tariffs.view.DataBuilder", {
      name: "data",
      region: "center",
      listeners: {
        celldblclick: record => {
          this.insertIntoTextarea(
            record.data._id.replace(/:/g, ".").replace(/^root/, "apiData")
          );
        }
      }
    });

    this.dataField.setValue(this.scope.scope.dataField.getValue());

    return {
      xtype: "panel",
      region: "east",
      width: "50%",
      split: true,
      layout: "border",
      items: [
        {
          xtype: "panel",
          cls: "grayTitlePanel",
          title: "apiData",
          region: "center",
          layout: "fit",
          items: this.dataField
        },
        {
          xtype: "panel",
          region: "north",
          //height: 100,
          padding: 10,
          style: "background: #ffffff;",
          layout: "vbox",
          defaults: { xtype: "label" },
          items: [
            {
              text: "CONTEXT:"
            },
            {
              text: "db - database connection"
            },
            {
              text: "apiData - input data from API"
            },
            {
              text:
                "variables - current variables (see tab Variables in tariff)"
            },
            {
              text: 'result - write "result=true" if the rule successfully'
            }
          ]
        }
      ]
    };
  },

  insertIntoTextarea(insText) {
    const text = this.codeField.inputEl.dom.value;
    const caretPosition = this.codeField.inputEl.dom.selectionStart;
    this.codeField.inputEl.dom.value =
      text.substring(0, caretPosition) +
      insText +
      text.substring(caretPosition);
  }
});
