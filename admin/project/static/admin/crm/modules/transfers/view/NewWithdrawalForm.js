Ext.define("Crm.modules.transfers.view.NewWithdrawalForm", {
  extend: "Crm.modules.transfers.view.WithdrawalForm",

  controllerCls: "Crm.modules.transfers.view.NewWithdrawalFormController",
  width: 450,
  height: 500,
  buildItems: function() {
    this.merchantCombo = Ext.create("Core.form.DependedCombo", {
      valueField: "id",
      displayField: "legalname",
      name: "merchant",
      dataModel: "Crm.modules.accountHolders.model.UsersModel",
      fieldSet: "id,legalname,realm",
      fieldLabel: D.t("Merchant")
    });
    this.organizationCombo = Ext.create("Core.form.DependedCombo", {
      xtype: "dependedcombo",
      valueField: "id",
      displayField: "name",
      name: "organisation",
      queryMode: "local",
      parentEl: this.merchantCombo,
      parentField: "user_id",
      dataModel: "Crm.modules.merchants.model.MerchantsModel",
      fieldSet: "id,user_id,name",
      fieldLabel: D.t("Merchant")
    });
    return [
      {
        xtype: "panel",
        layout: "anchor",
        defaults: {
          padding: 5,
          labelWidth: 90,
          anchor: "100%"
        },
        items: [
          this.merchantCombo,
          this.organizationCombo,
          {
            xtype: "dependedcombo",
            valueField: "id",
            displayField: "acc_no",
            displayTpl: Ext.create(
              "Ext.XTemplate",
              '<tpl for=".">',
              "{acc_no} ({balance} {currency})",
              "</tpl>"
            ),
            tpl: Ext.create(
              "Ext.XTemplate",
              '<ul class="x-list-plain"><tpl for=".">',
              '<li role="option" class="x-boundlist-item">{acc_no}</li>',
              "</tpl></ul>"
            ),
            name: "account",
            queryMode: "local",
            parentEl: this.merchantCombo,
            parentField: "owner",
            dataModel: "Crm.modules.accounts.model.AccountsModel",
            fieldSet: "id,acc_no,currency,balance,owner",
            fieldLabel: D.t("Account")
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            items: [
              {
                name: "amount",
                xtype: "numberfield",
                fieldLabel: D.t("Amount"),
                allowDecimals: true,
                minValue: 0,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false,
                flex: 3,
                labelWidth: 90
              },
              {
                name: "currency",
                xtype: "displayfield",
                fieldLabel: D.t("Currency"),
                flex: 1,
                margin: "0 0 0 10",
                labelWidth: 60
              }
            ]
          },
          {
            fieldLabel: D.t("To currency"),
            xtype: "combo",
            name: "to_currency",
            store: {
              fields: ["key", "value"],
              data: [
                { key: "crypto", value: D.t("Crypto") },
                { key: "fiat", value: D.t("Fiat") }
              ]
            },
            displayField: "value",
            valueField: "key"
          },
          {
            xtype: "dependedcombo",
            hidden: true,
            valueField: "id",
            displayField: "name",
            displayTpl: Ext.create(
              "Ext.XTemplate",
              '<tpl for=".">',
              "{name} ({curr_name})",
              "</tpl>"
            ),
            tpl: Ext.create(
              "Ext.XTemplate",
              '<ul class="x-list-plain"><tpl for=".">',
              '<li role="option" class="x-boundlist-item">{name} ({curr_name})</li>',
              "</tpl></ul>"
            ),
            name: "wallet",
            queryMode: "local",
            parentEl: this.organizationCombo,
            parentField: "org_id",
            dataModel: "Crm.modules.transfers.model.CryptoOrganizationModel",
            fieldSet: "id,name,num,curr_name,user_id,org_id",
            fieldLabel: D.t("Wallet")
          },
          {
            xtype: "dependedcombo",
            hidden: true,
            valueField: "id",
            displayField: "iban",
            displayTpl: Ext.create(
              "Ext.XTemplate",
              '<tpl for=".">',
              "{iban} ({currency})",
              "</tpl>"
            ),
            tpl: Ext.create(
              "Ext.XTemplate",
              '<ul class="x-list-plain"><tpl for=".">',
              '<li role="option" class="x-boundlist-item">{iban} ({currency})</li>',
              "</tpl></ul>"
            ),
            name: "iban",
            queryMode: "local",
            parentEl: this.organizationCombo,
            parentField: "org_id",
            dataModel: "Crm.modules.transfers.model.IbanOrganizationModel",
            fieldSet: "id,org_id,iban,currency",
            fieldLabel: D.t("IBAN")
          },
          {
            name: "res_amount",
            xtype: "numberfield",
            fieldLabel: D.t("Result amount"),
            allowDecimals: true,
            readOnly: true,
            minValue: 0,
            hideTrigger: true,
            keyNavEnabled: false,
            mouseWheelEnabled: false,
            decimalPrecision: 10,
            validator: (val) => {
              if (val == 0) return D.t("The value is 0");
              return true;
              // return this.controller.checkTechAcc({ val }).then((res) => {
              //   return res
              //     ? true
              //     : D.t("The technical account has insufficient funds");
              // });
            }
          },
          {
            xtype: "textareafield",
            name: "details",
            fieldLabel: D.t("Details")
          }
        ]
      }
    ];
  }
});
