Ext.define("Crm.modules.transfers.view.WithdrawalForm", {
  extend: "Crm.modules.transfers.view.NewTransferForm",

  titleTpl: "Withdrawal",
  iconCls: "x-fa fa-upload",

  height: 500,
  width: 800,

  formLayout: "fit",
  formMargin: 0,

  controllerCls: "Crm.modules.transfers.view.WithdrawalController",

  buildAllItems: function() {
    var items = this.callParent();

    return {
      xtype: "tabpanel",
      items: [
        {
          xtype: "panel",
          title: D.t("Transfer info"),
          layout: "anchor",
          defaults: {
            xtype: "textfield",
            anchor: "100%"
            //labelWidth: 150
          },
          items
        },
        Ext.create("Crm.modules.tariffs.view.TariffSettingsPanel")
      ]
    };
  },

  buildItems: function() {
    this.buildOrgCombo();
    this.orgWalletsStore = Ext.create("Core.data.Store", {
      dataModel: "Crm.modules.wallets.model.OrgWalletsModel",
      fieldSet: "org,num,curr_name,name",
      scope: this,
      exProxyParams: { currency: null, org: null }
    });
    return [
      this.userField,
      this.merchantField,
      this.org,
      {
        xtype: "fieldcontainer",
        margin: 5,
        layout: "hbox",
        items: [this.buildAccountCombo(this.merchantField)]
      },
      {
        xtype: "fieldcontainer",
        margin: 5,
        layout: "hbox",
        items: [
          Ext.create("Crm.modules.currency.view.CurrencyCombo", {
            name: "currency",
            width: 210,

            readOnly: true,
            margin: "0 5 0 0",
            fieldLabel: D.t("From")
          }),
          {
            name: "amount",
            xtype: "numberfield",
            flex: 1,
            minValue: 0
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        margin: 5,
        layout: "hbox",
        items: [
          Ext.create("Crm.modules.currency.view.CurrencyCombo", {
            name: "to_currency",
            width: 210,
            //readOnly: true,
            margin: "0 5 0 0",
            fieldLabel: D.t("Target currency")
          }),
          {
            name: "custom_exchange_rate",
            xtype: "numberfield",
            decimalPrecision: 8,
            emptyText: D.t("Custom exchange rate"),
            minValue: 0,
            flex: 1
          }
        ]
      },
      {
        xtype: "numberfield",
        name: "result_amount",
        fieldLabel: D.t("Result Amount"),
        margin: 5
      },
      this.buildDistinationIban(this.org),
      this.buildDistinationWalet(),
      this.buildTechAccount(this.userField),
      {
        name: "recipient",
        margin: 5,
        fieldLabel: D.t("Recipient"),
        xtype: "textfield"
      },
      {
        name: "description",
        margin: 5,
        fieldLabel: D.t("Description"),
        xtype: "textarea",
        height: 50
      },
      {
        xtype: "fieldcontainer",
        margin: 5,
        height: 30,
        layout: "hbox",
        defaults: {
          xtype: "checkbox",
          labelWidth: 120,
          height: 25
        },
        items: [
          {
            margin: "0 40 0 0",
            name: "deferred_transfer",
            inputValue: true,
            fieldLabel: D.t("Deferred transfer")
          },
          {
            name: "use_stock",
            fieldLabel: D.t("Exchange by stock"),
            checked: true
          }
          /*{
            name: "exact_amount",
            fieldLabel: D.t("Exact amount"),
            checked: true
          }*/
        ]
      },

      {
        name: "ref_id",
        hidden: true
      }
    ];
  },

  buildDistinationIban(parent) {
    return {
      xtype: "dependedcombo",
      valueField: "name",
      displayField: "name",
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        "{name} {bank_details}",
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{name} {bank_details}</li>',
        "</tpl></ul>"
      ),
      name: "iban",
      flex: 1,
      margin: 5,
      queryMode: "local",
      parentEl: parent,
      parentField: "org",
      dataModel: "Crm.modules.banks.model.OrgIBANModel",
      fieldSet: "org,name,bank_details",
      fieldLabel: D.t("To IBAN"),
      disabled: true
    };
  },

  buildDistinationWalet() {
    return {
      xtype: "combo",
      valueField: "num",
      displayField: "num",
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        "{name} | {num} {curr_name}",
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{name} | {num} {curr_name}</li>',
        "</tpl></ul>"
      ),
      name: "wallet",
      flex: 1,
      margin: 5,
      queryMode: "remote",
      triggerAction: "query",
      store: this.orgWalletsStore,
      fieldSet: "org,num,curr_name,name",
      fieldLabel: D.t("To Crypto Wallet"),
      disabled: true
    };
  },
  buildTechAccount(parent) {
    return {
      xtype: "dependedcombo",
      valueField: "acc_no",
      displayField: "acc_no",
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        "{acc_name} ({currency})",
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{acc_name} ({currency})</li>',
        "</tpl></ul>"
      ),
      name: "acc_tech",
      flex: 1,
      margin: 5,
      queryMode: "local",
      parentEl: parent,
      parentField: "merchant",
      dataModel: "Crm.modules.accounts.model.MerchTechModel",
      fieldSet: "acc_no,currency",
      fieldLabel: D.t("Tech account")
    };
  },

  buildAccountCombo(parent) {
    return {
      xtype: "dependedcombo",
      valueField: "acc_no",
      displayField: "acc_no",
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        "{acc_no} {currency}",
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{acc_no} {currency}</li>',
        "</tpl></ul>"
      ),
      name: "acc_no",
      flex: 1,
      queryMode: "local",
      parentEl: parent,
      parentField: "org",
      dataModel: "Crm.modules.accounts.model.OrgAccountsModel",
      fieldSet: "acc_no,currency,balance",

      fieldLabel: D.t("From account")
      // listeners: {
      //   dataload: (el, list) => {
      //     if (list && list[0]) {
      //       // el.setValue(list[0].acc_no);
      //     }
      //   }
      // }
    };
  },

  buildSenButton: function() {
    return [
      {
        text: D.t("Withdrawal money"),
        iconCls: "x-fa fa-check-square",
        action: "withdrawal"
      }
    ];
  }
});
