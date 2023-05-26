Ext.define("Crm.modules.merchantCategories.view.merchantCategoriesCombo", {
  extend: "Ext.form.FieldContainer",

  mixins: {
    field: "Ext.form.field.Field"
  },

  buttonText: D.t("New category"),

  layout: "hbox",

  initComponent() {
    this.store = Ext.create("Core.data.ComboStore", {
      dataModel: Ext.create(
        "Crm.modules.merchantCategories.model.merchantCategoriesModel"
      ),
      fieldSet: ["id", "name"],
      scope: this
    });

    this.items = [this.buildCombo(), this.buildButton()];

    this.callParent(arguments);
  },

  buildCombo() {
    this.combo = Ext.create("Ext.form.field.ComboBox", {
      valueField: "id",
      flex: 1,
      displayField: "name",
      queryMode: "local",
      layout: "hbox",
      store: this.store
    });
    return this.combo;
  },

  buildButton() {
    return {
      xtype: "button",
      width: 100,
      text: this.buttonText,
      handler: () => {
        Ext.create(
          "Crm.modules.merchantCategories.view.merchantCategoriesForm",
          {
            noHash: true,
            listeners: {
              save: (w, data) => {
                if (data && data.record) {
                  this.combo.setValue(data.record.id);
                }
              }
            }
          }
        );
      }
    };
  },

  setValue: function(value) {
    this.value = value;
    this.combo.setValue(value);
    this.fireEvent("change", this, value);
  },

  getValue: function() {
    return this.combo.getValue();
  },

  getSubmitData: function() {
    var res = {};
    res[this.name] = this.getValue();
    return res;
  }
});
