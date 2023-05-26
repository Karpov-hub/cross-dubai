Ext.define("Crm.modules.contracts.view.ContractsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Contract: {contract_subject}"),
  formMargin: 0,
  formLayout: "fit",
  requires: ["Core.form.DependedCombo", "Ext.ux.form.FileUploadField"],
  width: 810,
  height: 600,
  syncSize() {},
  controllerCls: "Crm.modules.contracts.view.ContractsFormController",
  buildItems() {
    return {
      xtype: "panel",
      layout: "fit",
      items: [
        {
          xtype: "tabpanel",
          width: "100%",
          autoScroll: true,
          items: [
            this.buildGeneral(),
            this.buildAccounts(),
            this.buildFiles(),
            Ext.create("Crm.modules.tariffs.view.TariffSettingsPanel")
          ]
        }
      ]
    };
  },

  buildGeneral() {
    this.realmId = Ext.create("Ext.form.field.Text", {
      hidden: true,
      name: "realm"
    });
    return {
      xtype: "panel",
      title: D.t("General"),
      layout: "anchor",
      defaults: {
        xtype: "textfield",
        labelWidth: 150,
        width: "100%",
        margin: "5 5 0 5",
        anchor: "100%"
      },
      items: [
        this.realmId,
        {
          name: "code",
          hidden: true
        },
        {
          name: "id",
          hidden: true
        },
        { name: "user_id", hidden: true },
        { name: "owner_id", hidden: true },
        {
          name: "director_name",
          fieldLabel: D.t("Signatory")
        },
        {
          xtype: "fieldcontainer",
          layout: "anchor",
          name: "other_signatories",
          defaults: {
            xtype: "textfield",
            labelWidth: 150,
            width: "100%",
            anchor: "100%"
          },
          items: [
            {
              xtype: "button",
              iconCls: "x-fa fa-plus",
              width: 40,
              anchor: null,
              action: "add_signatory_field"
            }
          ]
        },
        {
          name: "contract_subject",
          fieldLabel: D.t("Subject of the contract"),
          allowBlank: false
        },
        {
          name: "memo",
          fieldLabel: D.t("Memo")
        },
        {
          name: "status",
          fieldLabel: D.t("Status"),
          xtype: "combo",
          valueField: "key",
          displayField: "val",
          store: {
            fields: ["key", "val"],
            data: [
              { key: 0, val: D.t("Pending") },
              { key: 1, val: D.t("Approved") },
              { key: 2, val: D.t("Terminated") }
            ]
          }
        },
        {
          xtype: "checkbox",
          name: "automatic_renewal",
          inputValue: true,
          uncheckedValue: false,
          margin: "0 5 8 5",
          fieldLabel: D.t("Automatic renewal")
        },
        this.buildMerchantCombo(),
        this.buildOrgCombo(),
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: {
            flex: 1,
            labelWidth: 150
          },
          items: [
            {
              xtype: "xdatefield",
              name: "contract_date",
              fieldLabel: D.t("Contract Date"),
              submitFormat: "Y-m-d",
              format: D.t("d/m/Y"),
              margin: "0 5 0 0",
              value: new Date()
            },
            {
              xtype: "xdatefield",
              name: "expiration_date",
              fieldLabel: D.t("Expiration Date"),
              submitFormat: "Y-m-d",
              format: D.t("d/m/Y"),
              labelWidth: 95,
              value: new Date(Date.now() + 3600000 * 24 * 365)
            }
          ]
        },
        {
          name: "description",
          fieldLabel: D.t("Description"),
          xtype: "textareafield"
        },
        {
          fieldLabel: D.t("Director's name history"),
          name: "director_name_history",
          readOnly: true,
          xtype: "textareafield"
        }
      ]
    };
  },

  buildAccounts() {
    return {
      xtype: "panel",
      title: D.t("Accounts"),
      layout: "fit",
      items: Ext.create(
        "Crm.modules.accountsContracts.view.AccountsContractsGrid",
        {
          scope: this,
          observe: [{ property: "owner_id", param: "id" }]
        }
      )
    };
  },

  buildFiles() {
    return {
      xtype: "panel",
      title: D.t("Files"),
      layout: "fit",
      items: Ext.create("Crm.modules.files.view.FilesGrid", {
        scope: this,
        observe: [{ property: "owner_id", param: "id" }]
      })
    };
  },

  buildButtons() {
    let btns = this.callParent(arguments);
    btns[0] = null;
    return btns;
  },

  buildOrgCombo() {
    return {
      xtype: "dependedcombo",
      name: "realm_organization",
      fieldSet: "id,name",
      anchor: "100%",
      displayField: "name",
      valueField: "id",
      parentEl: this.realmId,
      parentField: "realm",
      dataModel: "Crm.modules.merchants.model.RealmDepartmentModel",
      fieldLabel: D.t("Organization")
    };
  },
  buildMerchantCombo() {
    return null;
  }
});
