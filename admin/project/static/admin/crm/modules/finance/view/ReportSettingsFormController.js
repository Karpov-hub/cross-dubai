Ext.define("Crm.modules.finance.view.ReportSettingsFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[name=gtype]": {
        change: (t, v) => {
          this.onTypeChange(v);
        }
      },
      "[action=buildpreview]": {
        click: () => {
          this.buildPreview(
            this.view
              .down("form")
              .getForm()
              .getValues()
          );
        }
      }
    });

    this.callParent(arguments);
  },

  onTypeChange(v) {
    this.view
      .down("[name=separate_chart]")
      .setDisabled(!["Line", "Diagram"].includes(v));
  },

  setValues(data) {
    this.callParent(arguments);
    this.buildPreview(data);
  },

  async buildPreview(data) {
    this.view.previewPanel.removeAll(true);
    if (!data.gtype) return;
    this.view.previewPanel.add(
      Ext.create("Crm.modules.finance.view.type." + data.gtype, {
        settings: data
      })
    );
  }
});
