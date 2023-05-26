Ext.define("Crm.modules.logs.view.LogsFormController", {
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
      request: JSON.stringify(data.request,null,4) || "",
      responce: JSON.stringify(data.responce,null,4) || ""
    };
    this.view.currentData = formData;
    var form = this.view.down("form");
    this.view.fireEvent("beforesetvalues", form, formData);
    form.getForm().setValues(formData);
    this.view.fireEvent("setvalues", form, formData);
  }
});
