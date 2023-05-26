Ext.define("Crm.modules.finance.view.AddGroupFormController", {
  extend: "Core.form.FormController",

  save(needClose, cb) {
    let data = this.view
      .down("form")
      .getForm()
      .getValues();
    this.model.runOnServer("saveAccountsForDashboard", data, (res) => {
      this.view.scope.store.insert(0, res);
      if (needClose) this.view.close();
    });
  }
});
