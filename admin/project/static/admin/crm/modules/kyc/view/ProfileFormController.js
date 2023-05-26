Ext.define("Crm.modules.kyc.view.ProfileFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=resolve_kyc]": {
        click: (el, v) => {
          this.resolve();
        }
      },
      "[action=reject_kyc]": {
        click: (el, v) => {
          this.reject();
        }
      },
      "[action=formclose]": {
        click: (el, v) => {
          window.history.back();
        }
      }
    });
    this.callParent(arguments);
  },

  async resolve() {
    let data = {
      id: this.view.currentData.id,
      realm_id: this.view.currentData.realm_id,
      user_id: localStorage.uid,
      user_kyc_id: this.view.currentData.user_id
    };

    const res = await this.model.callApi(
      "kyc-service",
      "resolveProfileKYC",
      data,
      data.realm_id,
      data.user_id
    );
    if (res.success == true) window.history.back();
  },

  async reject() {
    let data = {
      id: this.view.currentData.id,
      realm_id: this.view.currentData.realm_id,
      user_id: localStorage.uid,
      user_kyc_id: this.view.currentData.user_id
    };

    const res = await this.model.callApi(
      "kyc-service",
      "rejectProfileKYC",
      data,
      data.realm_id,
      data.user_id
    );
    if (res.success == true) window.history.back();
  }
});
