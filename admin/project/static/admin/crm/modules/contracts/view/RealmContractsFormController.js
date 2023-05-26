Ext.define("Crm.modules.contracts.view.RealmContractsFormController", {
  extend: "Crm.modules.contracts.view.ContractsFormController",

  setValues(data) {
    if (window.__CB_REC__) {
      Ext.apply(data, __CB_REC__);
      window.__CB_REC__ = null;
      this.view.s = true;
    }
    this.model.getRealmByRealmOrgOwner(data, (res) => {
      if (res && res.realm && res.id) {
        data.realm = res.realm;
      }
      this.model.getMerchantOrganization(data, (orgRes) => {
        if (orgRes && orgRes.org_id && orgRes.user_id) {
          data.merchant_id = orgRes.user_id;
          data.merchant_organization = orgRes.org_id;
        }
        this.view.currentData = data;
        var form = this.view.down("form");
        this.view.fireEvent("beforesetvalues", form, data);
        form.getForm().setValues(data);
        this.view.fireEvent("setvalues", form, data);
      });
    });
  }
});
