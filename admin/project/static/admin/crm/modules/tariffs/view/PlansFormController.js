Ext.define("Crm.modules.tariffs.view.PlansFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[activity=importfromtariff]": {
        click: (el, v) => {
          this.importVariablesFromTariffs();
        }
      }
    });
    this.callParent(arguments);
  },

  importVariablesFromTariffs() {
    const tariffs = this.view.down("[name=tariffs]").getValue();
    const variablesEl = this.view.down("[name=variables]");
    const f = () => {
      this.model.getVariablesFromTariffs(tariffs, variables => {
        variablesEl.setValue(variables);
      });
    };
    if (variablesEl.getValue().length) {
      D.c("", "Replace previously entered variables?", [], () => {
        f();
      });
    } else f();
  },

  exportJson() {
    const data = this.view
      .down("form")
      .getForm()
      .getValues();
    data[this.model.idField];
    this.model.getCopy(data[this.model.idField], json => {
      this.download(`tariff_plan.json`, JSON.stringify(json));
    });
  },

  importJson() {
    const file = this.view.down("[action=importjson]").fileInputEl.dom.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = evt => {
        let data;

        try {
          data = JSON.parse(evt.target.result);
        } catch (e) {}

        if (data) {
          this.model.pushCopy(data, json => {
            location = "./#Crm.modules.tariffs.view.PlansForm~" + data.plan.id;
          });
        } else {
          D.a("", "Data is not found in the file", [], () => {});
        }
      };
      reader.onerror = evt => {};
    }
  }
});
