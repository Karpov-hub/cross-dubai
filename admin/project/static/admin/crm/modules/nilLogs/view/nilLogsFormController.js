Ext.define("Crm.modules.nilLogs.view.nilLogsFormController", {
  extend: "Core.form.FormController",

  setValues: function(data) {
    if (window.__CB_REC__) {
      Ext.apply(data, __CB_REC__);
      window.__CB_REC__ = null;
      this.view.s = true;
    }
    let formData = {
      id: data.id,
      ctime: data.ctime,
      request: JSON.stringify(JSON.parse(data.request), null, 4) || "",
      response: JSON.stringify(JSON.parse(data.response), null, 4) || ""
    };
    this.view.currentData = formData;
    var form = this.view.down("form");
    this.view.fireEvent("beforesetvalues", form, formData);
    form.getForm().setValues(formData);
    this.view.fireEvent("setvalues", form, formData);
  }
});
