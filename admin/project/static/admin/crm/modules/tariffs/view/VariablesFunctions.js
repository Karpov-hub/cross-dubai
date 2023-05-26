Ext.define("Crm.modules.tariffs.view.VariablesFunctions", {
  async buildEditor(type, values, value) {
    switch (type) {
      case "string":
        return this.buildStringEditor(value);
      case "number":
        return this.buildNumberEditor(value);
      case "select":
        if (values) return this.buildSelectEditor(values, value);
        return this.buildSelectTagsEditor(value);
      case "boolean":
        return this.buildBooleanEditor(value);
      case "merchant_account":
        return await this.buildMerchantAccountEditor(values, value);
      case "tech_account":
        return await this.buildTechAccount(value);
      case "nil_bank_account":
        return await this.buildNilBanksCombo(value);
      case "multiselect":
        return this.buildSelectTagsEditor(value, values);
      case "merchant_addr_and_address_book":
        return await this.buildAddressBookEditor(values, value);
      case "merchant_address":
        return await this.buildMerchantAddressEditor(values, value);
      case "inner_client_address":
        return await this.buildInnerClientAddressEditor(values, value);
      default:
        return this.buildStringEditor(value);
    }
  },

  async buildMerchantAccountEditor(values, value) {
    return await this.buildAccountCombo(values, value);
  },

  async buildMerchantAddressEditor(values, value) {
    return await this.buildMerchantAddressCombo(values, value);
  },

  async buildAddressBookEditor(values, value) {
    return await this.buildAddressBookCombo(
      values,
      value,
      "merchant_addr_and_address_book_combo"
    );
  },

  async buildInnerClientAddressEditor(values, value) {
    return await this.buildAddressBookCombo(
      values,
      value,
      "inner_client_address_editor"
    );
  },

  async buildTechAccount(value) {
    const REALM_ACCOUNTS_MODEL = Ext.create(
      "Crm.modules.accounts.model.RealmAccountsModel"
    );
    return await this.buildAccountCombo(
      await REALM_ACCOUNTS_MODEL.getAccountsOfDefaultRealm(),
      value
    );
  },

  buildAccountCombo(store_data, value) {
    return {
      flex: 1,
      xtype: "combo",
      editable: !Ext.platformTags.phone,
      valueField: "acc_no",
      // forceSelection: true,
      value,
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{acc_no} - {balance} {currency} ',
        '<tpl if="acc_description">({acc_description})</tpl>',
        '<tpl else if="acc_name">({acc_name})</tpl>',
        "</li>",
        "</tpl></ul>"
      ),
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        "{acc_no} - {balance} {currency} ",
        '<tpl if="acc_description">({acc_description})</tpl>',
        '<tpl else if="acc_name">({acc_name})</tpl>',
        "</tpl>"
      ),
      store: {
        fields: [
          "acc_no",
          "balance",
          "currency",
          "acc_description",
          "acc_name"
        ],
        data: store_data
      },
      listeners: {
        change: function() {
          const store = this.getStore();
          store.clearFilter();
          if (!this.getValue()) {
            store.loadData(store_data);
          } else {
            store.filter({
              property: "acc_no",
              anyMatch: true,
              value: this.getValue()
            });
          }
        }
      }
    };
  },

  buildSelectEditor(values, value) {
    return {
      flex: 1,
      xtype: "combo",
      editable: !Ext.platformTags.phone,
      forceSelection: true,
      displayField: "value",
      valueField: "value",
      value: value || null,
      createNewOnEnter: true,
      store: {
        fields: ["value"],
        data: values || []
      }
    };
  },

  buildSelectTagsEditor(value, values) {
    const createNewOnEnter = values ? false : true;
    return {
      flex: 1,
      xtype: "tagfield",
      displayField: "value",
      valueField: "value",
      value: value || null,
      createNewOnEnter,
      store: {
        fields: ["value"],
        data: values || []
      },
      listeners: {
        specialKey(el, field, event) {
          if (field.event.key == "Enter") return true;
          return false;
        }
      }
    };
  },

  buildBooleanEditor(value) {
    return {
      flex: 1,
      xtype: "checkbox",
      value: value || null,
      inputValue: true,
      uncheckedValue: false
    };
  },

  buildStringEditor(value) {
    return {
      flex: 1,
      xtype: "textfield",
      value: value || null
    };
  },

  buildNumberEditor(value) {
    return {
      flex: 1,
      xtype: "numberfield",
      value: value || null
    };
  },

  buildNilBanksCombo(value) {
    return {
      name: "nil_bank",
      xtype: "combo",
      displayField: "nil_account_description",
      editable: !Ext.platformTags.phone,
      flex: 1,
      value,
      valueField: "nil_account_description",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create(
          "Crm.modules.banks.model.RealmDepartmentIBANModel"
        ),
        fieldSet: ["id", "nil_account_description", "verified_on_nil"],
        scope: this
      })
    };
  },

  buildMerchantAddressCombo(store_data, value) {
    return {
      xtype: "combo",
      name: "merchant_address_combo",
      editable: !Ext.platformTags.phone,
      flex: 1,
      valueField: "address",
      displayField: "address",
      value: value || null,
      store: {
        fields: ["address", "name"],
        data: store_data
      },
      listeners: {
        change: function() {
          const store = this.getStore();
          store.clearFilter();
          if (!this.getValue()) {
            store.loadData(store_data);
          } else {
            store.filter({
              property: "address",
              anyMatch: true,
              value: this.getValue()
            });
          }
        }
      }
    };
  },

  buildAddressBookCombo(store_data, value, name) {
    return {
      xtype: "combo",
      editable: !Ext.platformTags.phone,
      name,
      flex: 1,
      valueField: "address",
      displayField: "address",
      value: value || null,
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{address}',
        '<tpl if="name"> ({name})</tpl>',
        "</li>",
        "</tpl></ul>"
      ),
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        "{address}",
        '<tpl if="name"> ({name})</tpl>',
        "</tpl>"
      ),
      store: {
        fields: ["address", "name"],
        data: store_data
      },
      listeners: {
        change: function() {
          const store = this.getStore();
          store.clearFilter();
          if (!this.getValue()) {
            store.loadData(store_data);
          } else {
            store.filter({
              property: "address",
              anyMatch: true,
              value: this.getValue()
            });
          }
        }
      }
    };
  }
});
