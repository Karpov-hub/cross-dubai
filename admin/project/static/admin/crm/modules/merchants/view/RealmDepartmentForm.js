Ext.define("Crm.modules.merchants.view.RealmDepartmentForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Realm Organization: {name}"),

  formLayout: "fit",
  formMargin: 0,

  width: 800,
  height: 550,

  controllerCls: "Core.form.FormControllerWithConfirmActive",

  syncSize: function() {},

  requires: ["Ext.form.CheckboxGroup"],

  buildItems() {
    return {
      xtype: "tabpanel",
      layout: "fit",
      items: [this.buildGeneral(), /*this.buildContracts(),*/ this.buildIBANs()]
    };
  },

  buildBanksCombo() {
    this.banks_combo = Ext.create("Desktop.core.widgets.TagField", {
      xtype: "tagfield",
      name: "bank_id",
      valueField: "id",
      flex: 1,
      displayField: "shortname",
      queryMode: "local",
      layout: "hbox",
      store: this.banks_store,
      fieldLabel: D.t("Bank")
    });
    return this.banks_combo;
  },

  buildGeneral() {
    this.banks_store = Ext.create("Core.data.Store", {
      dataModel: Ext.create("Crm.modules.banks.model.DepositBanksModel"),
      fieldSet: [
        "id",
        "name",
        "swift",
        "corr_bank",
        "corr_swift",
        "corr_acc",
        "shortname",
        "falcon_bank"
      ],
      scope: this,
      exProxyParams: {
        falcon_bank: "true"
      }
    });

    return {
      xtype: "panel",
      title: D.t("General"),
      layout: "anchor",
      padding: 10,
      defaults: {
        xtype: "textfield",
        labelWidth: 100,
        width: "100%"
      },
      items: [
        { name: "id", hidden: true },
        this.buildRealmCombo(),
        {
          name: "name",
          fieldLabel: D.t("Name")
        },
        {
          name: "director",
          fieldLabel: D.t("Director")
        },
        this.buildCountryCombo(),
        this.buildAddress(),
        {
          name: "additional_info",
          fieldLabel: D.t("Additional info")
        },
        {
          name: "register",
          fieldLabel: D.t("Register")
        },
        {
          name: "tax_number",
          fieldLabel: D.t("Tax Number")
        },
        {
          name: "vat_id",
          fieldLabel: D.t("VAT Identification Number")
        },
        {
          name: "phone",
          fieldLabel: D.t("Phone")
        },
        {
          xtype: "combo",
          name: "status",
          fieldLabel: D.t("Status"),
          valueField: "name",
          displayField: "name",
          store: {
            fields: ["name"],
            data: [{ name: "Active" }, { name: "Inactive" }]
          }
        },
        this.buildBanksCombo(),
        {
          xtype: "dependedcombo",
          valueField: "ra_id",
          displayField: "acc_name",
          displayTpl: Ext.create(
            "Ext.XTemplate",
            '<tpl for=".">',
            "{acc_no} ({balance} {currency})",
            "</tpl>"
          ),
          tpl: Ext.create(
            "Ext.XTemplate",
            '<ul class="x-list-plain"><tpl for=".">',
            '<li role="option" class="x-boundlist-item">{acc_no} ({balance} {currency})</li>',
            "</tpl></ul>"
          ),
          name: "realm_acc",
          queryMode: "local",
          parentEl: this.realm,
          parentField: "owner,type",
          dataModel: "Crm.modules.merchants.model.RealmAccountsModel",
          fieldSet: "id,acc_no,acc_name,balance,currency",
          fieldLabel: D.t("Account")
        }
      ]
    };
  },

  buildRealmCombo() {
    this.realm = Ext.create("Crm.modules.realm.view.RealmCombo", {
      name: "realm",
      allowBlank: false
    });
    return this.realm;
  },

  buildContracts() {
    return {
      xtype: "panel",
      layout: "fit",
      title: D.t("Contracts"),
      items: [
        Ext.create("Crm.modules.contracts.view.RealmContractsGrid", {
          scope: this,
          observe: [{ property: "owner_id", param: "id" }]
        })
      ]
    };
  },

  buildIBANs() {
    return {
      xtype: "panel",
      layout: "fit",
      title: D.t("IBANs"),
      items: Ext.create("Crm.modules.banks.view.RealmDepartmentIBANGrid", {
        scope: this,
        observe: [{ property: "owner", param: "id" }]
      })
    };
  },

  buildCountryCombo() {
    return {
      xtype: "dependedcombo",
      name: "country",
      flex: 1,
      labelWidth: 100,
      fieldLabel: D.t("Country"),
      valueField: "abbr2",
      displayField: "name",
      dataModel: "Crm.modules.settings.model.CountriesModel",
      fieldSet: "abbr2,name"
    };
  },

  buildAddress() {
    return {
      xtype: "fieldcontainer",
      layout: "hbox",
      fieldLabel: D.t("Address"),
      defaults: {
        xtype: "textfield"
      },
      items: [
        {
          name: "zip",
          margin: "0 3 0 0",
          width: 100,
          emptyText: D.t("ZIP")
        },
        {
          name: "city",
          margin: "0 0 0 3",
          flex: 1,
          emptyText: D.t("city")
        },
        {
          name: "street",
          margin: "0 0 0 3",
          flex: 1,
          emptyText: D.t("street")
        },
        {
          name: "house",
          margin: "0 0 0 3",
          flex: 1,
          emptyText: D.t("house")
        }
      ]
    };
  }
});
