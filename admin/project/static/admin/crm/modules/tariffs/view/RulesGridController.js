Ext.define("Crm.modules.tariffs.view.RulesGridController", {
  extend: "Ext.app.ViewController",

  init: function(view) {
    this.view = view;
    this.setControls();
  },

  setControls: function() {
    this.view.functionsCombo.on("change", (el, v) => {
      this.buildParamsEditor(el, v);
    });
    this.view.on({
      beforeedit: (ed, e) => {
        this.buildParamsEditor(
          this.view.functionsCombo,
          e.record.data.render_function
        );
      },
      editrule: (rec) => {
        this.editCustomFunction(rec);
      }
    });
  },

  buildParamsEditor(el, v) {
    let params;
    if (v) params = this.getParams(el, v);
    this.view.valueEditor.clear();
    if (!params) {
      this.view.valueEditor.addParamField();
      return;
    }
    params.forEach((param) => {
      this.view.valueEditor.addParamField(param);
    });
  },

  getParams(el, v) {
    let out;
    el.getStore().each((rec) => {
      if (rec.data.name === v) out = rec.data.params;
    });
    return out;
  },

  editCustomFunction(rec) {
    Ext.create("Crm.modules.tariffs.view.CustomFunctionEditor", {
      functionCode: rec.data.custom_function,
      scope: this.view,
      onEdit: (code) => {
        rec.data.custom_function = code;
        rec.commit();
      }
    });
  }
});
