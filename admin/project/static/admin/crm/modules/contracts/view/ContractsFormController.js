Ext.define("Crm.modules.contracts.view.ContractsFormController", {
  extend: "Core.form.FormControllerWithConfirmActive",

  setControls() {
    this.control({
      "[action=downloadFile]": {
        click: () => {
          this.downloadFile();
        }
      },
      "[action=add_signatory_field]": {
        click: () => {
          this.addSignatoryFields();
        }
      }
    });
    this.callParent(arguments);
  },
  async addOtherSignatories(other_signatories) {
    if (other_signatories.signatory2) {
      await this.addSignatoryField(2);
      this.view
        .down(`[name=signatory_2_field]`)
        .setValue(other_signatories.signatory2);
    }
    if (other_signatories.signatory3) {
      await this.addSignatoryField(3);
      this.view
        .down(`[name=signatory_3_field]`)
        .setValue(other_signatories.signatory3);
    }
    return;
  },
  async addSignatoryField(sign_num) {
    let me = this;
    return this.view.down("[name=other_signatories]").add({
      xtype: "fieldcontainer",
      name: `signatory_${sign_num}_form`,
      layout: "hbox",
      items: [
        {
          xtype: "textfield",
          name: `signatory_${sign_num}_field`,
          fieldLabel: D.t("Signatory"),
          labelWidth: 150,
          flex: 1
        },
        {
          xtype: "button",
          width: 40,
          iconCls: "x-fa fa-trash-alt",
          listeners: {
            click: () => {
              me.deleteSignatoryForm(sign_num);
            }
          }
        }
      ]
    });
  },
  async deleteSignatoryForm(sign_num) {
    this.view
      .down("[name=other_signatories]")
      .remove(this.view.down(`[name=signatory_${sign_num}_form]`));
  },

  async addSignatoryFields() {
    if (!this.view.down(`[name=signatory_${2}_form]`))
      return this.addSignatoryField(2);
    if (!this.view.down(`[name=signatory_${3}_form]`))
      return this.addSignatoryField(3);
    return D.a("Error", "Cannot add more than two additional signatories");
  },

  async prepareSaveObject(formData, inp) {
    let result_object = {
      id: formData.id,
      merchant: formData.merchant_organization
        ? formData.merchant_organization
        : formData.owner_id,
      realm: formData.realm_organization
        ? formData.realm_organization
        : formData.owner_id,
      // files: inp.fileInputEl.dom.files,
      description: formData.description,
      memo: formData.memo,
      automatic_renewal: formData.automatic_renewal,
      contract_date: formData.contract_date,
      expiration_date: formData.expiration_date,
      director_name: formData.director_name,
      contract_subject: formData.contract_subject,
      status: formData.status,
      tariff: formData.tariff,
      variables: formData.variables,
      other_signatories: {}
    };
    if (formData.signatory_2_field)
      result_object.other_signatories.signatory2 = formData.signatory_2_field;
    if (formData.signatory_3_field)
      result_object.other_signatories.signatory3 = formData.signatory_3_field;
    return result_object;
  },

  async save(needClose, cb) {
    let formData = this.view
      .down("form")
      .getForm()
      .getValues();
    const data = await this.prepareSaveObject(formData /*inp*/);
    const confirmActivate = await this.confirmActivate();
    if (!confirmActivate) return;
    if (localStorage.getItem("uid"))
      data._admin_id = localStorage.getItem("uid");
    let res = await this.model.callApi(
      "merchant-service",
      "addContract",
      data,
      formData.realm,
      formData.user_id
    );
    if (res && res.success) {
      await this.model.updateGrid();
      if (needClose) return this.view.close();
    }
  },

  setValues(data) {
    if (window.__CB_REC__) {
      Ext.apply(data, __CB_REC__);
      window.__CB_REC__ = null;
      this.view.s = true;
    }

    if (!data.hasOwnProperty("automatic_renewal"))
      this.view.down("[name=automatic_renewal]").setValue(true);

    this.model.getRealm(data, (res) => {
      if (res && res.realm && res.id) {
        data.user_id = res.id;
        data.realm = res.realm;
      }
      this.model.getRealmOrganization(data, (orgRes) => {
        if (orgRes && orgRes.owner_id)
          data.realm_organization = orgRes.owner_id;
        if (
          data.other_signatories &&
          (data.other_signatories.hasOwnProperty("signatory2") ||
            data.other_signatories.hasOwnProperty("signatory3"))
        )
          this.addOtherSignatories(data.other_signatories);
        this.view.currentData = data;
        var form = this.view.down("form");
        this.view.fireEvent("beforesetvalues", form, data);
        form.getForm().setValues(data);
        this.view.fireEvent("setvalues", form, data);
      });
    });
  }
});
