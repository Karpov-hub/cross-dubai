Ext.define("Core.form.FormControllerWithConfirmActive", {
  extend: "Core.form.FormController",

  confirmActivate() {
    let activeField = this.model.fields.find(
      (el) =>
        el.name == "active" || el.name == "status" || el.name == "activated"
    );
    if (!activeField || this.model.collection == "orders") {
      return -1;
    }
    let activeValue = this.view.down(`[name=${activeField.name}]`).getValue();

    if (typeof activeValue == "number") {
      activeValue = activeValue != 1 ? false : true;
    } else if (!activeValue || activeValue == "Inactive") activeValue = false;

    return new Promise((resolve) => {
      if (!activeValue) {
        Ext.Msg.show({
          title: "Confirmation",
          message: "Do you really not want to activate?",
          buttons: Ext.Msg.YESNO,
          icon: Ext.Msg.QUESTION,
          fn: function(btn) {
            if (btn === "yes") {
              return resolve(true);
            }
            resolve(false);
          }
        });
      } else resolve(true);
    });
  },

  save: async function(closewin, cb) {
    const confirmActivate = await this.confirmActivate();
    if (!confirmActivate) return;
    this.callParent(arguments);
  }
});
