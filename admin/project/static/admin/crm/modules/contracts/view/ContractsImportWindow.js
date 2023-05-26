Ext.define("Crm.modules.contracts.view.ContractsImportWindow", {
  extend: "Core.grid.ImportWindow",

  requires: ["Core.form.DependedCombo"],

  title: D.t("Upload Contract"),

  width: 800,
  height: 300,
  padding: 0,

  buildItems() {
    let items = this.callParent(arguments);
    items[1] = null;
    let realmId = Ext.create("Ext.form.field.Text", {
      hidden: true,
      name: "realm",
      value: this.scope.userData.realm
        ? this.scope.userData.realm
        : this.scope.userData
    });
    if (
      this.scope.view.scope.closeHash ==
      "Crm.modules.merchants.view.MerchantsGrid"
    ) {
      items.push({
        xtype: "dependedcombo",
        name: "realm_organization",
        fieldSet: "id,name",
        anchor: "100%",
        labelWidth: 170,
        displayField: "name",
        valueField: "id",
        parentEl: realmId,
        parentField: "realm",
        dataModel: "Crm.modules.merchants.model.RealmDepartmentModel",
        fieldLabel: D.t("Organization")
      });
    }
    if (
      this.scope.view.scope.closeHash ==
      "Crm.modules.merchants.view.RealmDepartmentGrid"
    ) {
      let merchantId = Ext.create("Core.form.DependedCombo", {
        name: "merchant_id",
        fieldSet: "id,legalname",
        anchor: "100%",
        labelWidth: 170,
        displayField: "legalname",
        valueField: "id",
        parentEl: realmId,
        parentField: "realm",
        dataModel: "Crm.modules.accountHolders.model.UsersModel",
        fieldLabel: D.t("Merchant")
      });
      let merchant_organization = Ext.create("Core.form.DependedCombo", {
        xtype: "dependedcombo",
        anchor: "100%",
        labelWidth: 170,
        valueField: "id",
        displayField: "name",
        name: "merchant_organization",
        queryMode: "local",
        parentEl: merchantId,
        parentField: "user_id",
        dataModel: "Crm.modules.merchants.model.MerchantsModel",
        fieldSet: "id,user_id,name",
        fieldLabel: D.t("Merchant")
      });
      items.push(merchantId, merchant_organization);
    }
    let contract_date = Ext.create("Ext.form.field.Date", {
      name: "contract_date",
      submitFormat: "Y-m-d",
      fieldLabel: D.t("Contract Date"),
      listeners: {
        change(el, v) {
          if (!v) expiration_date.setDisabled(true);
          else expiration_date.setDisabled(false);
          return v;
        }
      }
    });
    let expiration_date = Ext.create("Ext.form.field.Date", {
      name: "expiration_date",
      disabled: true,
      submitFormat: "Y-m-d",
      margin: "0 0 0 10",
      fieldLabel: D.t("Expiration Date"),
      listeners: {
        change(el, v) {
          if (contract_date.getValue() > v)
            return expiration_date.setValue(contract_date.getValue());
        }
      }
    });
    items.push(
      {
        name: "description",
        xtype: "textareafield",
        fieldLabel: D.t("Description"),
        anchor: "100%",
        labelWidth: 170
      },
      {
        xtype: "panel",
        layout: "hbox",
        defaults: { flex: 1, labelWidth: 170, xtype: "datefield" },
        items: [contract_date, expiration_date]
      }
    );
    return {
      xtype: "form",
      layout: "anchor",
      padding: 10,
      items
    };
  },
  async doImport() {
    let inp = this.down("[name=file]");
    const vals = this.down("form")
      .getForm()
      .getValues();
    if (
      vals.expiration_date &&
      vals.contract_date &&
      (vals.merchant_organization || vals.realm_organization)
    )
      if (inp.fileInputEl.dom.files.length > 0) {
        const data = {
          merchant_org:
            this.scope.view.scope.closeHash ==
            "Crm.modules.merchants.view.RealmDepartmentGrid"
              ? vals.merchant_organization
              : this.scope.view.scope.recordId,
          realm_org:
            this.scope.view.scope.closeHash ==
            "Crm.modules.merchants.view.MerchantsGrid"
              ? vals.realm_organization
              : this.scope.view.scope.recordId,
          files: inp.fileInputEl.dom.files,
          description: vals.description,
          contract_date: vals.contract_date,
          expiration_date: vals.expiration_date
        };

        let res = await this.scope.model.callApi(
          "merchant-service",
          "addContract",
          data,
          this.scope.userData.id,
          this.scope.userData.realm
        );
        if (res && res.success) {
          await this.scope.model.updateGrid();
          this.close();
        }
      }
  }
});
