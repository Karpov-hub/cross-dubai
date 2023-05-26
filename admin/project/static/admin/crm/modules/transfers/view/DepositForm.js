Ext.define("Crm.modules.transfers.view.DepositForm", {
  extend: "Crm.modules.transfers.view.NewTransferForm",

  titleTpl: "Deposit",
  iconCls: "x-fa fa-download",

  height: 400,
  width: 800,
  formLayout: "fit",
  formMargin: 0,

  controllerCls: "Crm.modules.transfers.view.DepositController",

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
          },
          items
        },
        Ext.create("Crm.modules.tariffs.view.TariffSettingsPanel")
      ]
    };
  },

  buildItems: function() {
    this.buildOrgCombo();
    console.log(Ext.Date.parse("03:01:11", "h:i:s"))
    return [
      this.userField,
      this.org,

      {
        xtype: "fieldcontainer",
        margin: 5,
        layout: "hbox",
        items: [this.buildAccountCombo(this.org)]
      },
      {
        xtype: "fieldcontainer",
        margin: 5,
        layout: "hbox",
        items: [
          {
            name: "amount",
            xtype: "numberfield",
            minValue: 0,
            flex: 1,
            margin: "0 5 0 0",
            fieldLabel: D.t("Amount")
          },
          Ext.create("Crm.modules.currency.view.CurrencyCombo", {
            name: "currency",
            width: 170,
            labelWidth: 80,
            readOnly: true,
            fieldLabel: D.t("Currency")
          })
        ]
      },
      {
        name: "description",
        margin: 5,
        fieldLabel: D.t("Description"),
        xtype: "textarea",
        height: 50
      },
      Ext.create("Crm.modules.banks.view.BanksCombo", {
        name: "option_bank",
        margin: 5,
        fieldLabel: D.t("Bank")
      }),
      {
        xtype: "fieldcontainer",
        margin: 5,
        layout: "hbox",
        items: [
          {
            xtype: "xdatefield",
            submitFormat: "Y-m-d",
            format: D.t("d/m/Y"),
            name: "deposit_date",
            margin: "0 5 0 0",
            flex: 1,
            maxValue: new Date(),
            fieldLabel: D.t("Deposit date"),
            value: new Date()
          },
          Ext.create("Crm.modules.docs.view.FilesList", {
            name: "files",
            width: 200,
            labelWidth: 95,
            fieldLabel: D.t("Documents")
          })
        ]
      },
      {
        xtype: "fieldcontainer",
        margin: 5,
        layout: "hbox",
        items: [
          {
            xtype: "checkbox",
            labelWidth: 100,
            height: 26,
            width: 130,
            name: "show_to_client",
            fieldLabel: D.t("Show to client"),
            checked: true
          },
          {
            hidden: true,
            labelWidth: 100,
            width: 220,
            fieldLabel: D.t("Expiration date"),
            submitFormat: "Y-m-d",
            format: D.t("d/m/Y"),
            xtype: "xdatefield",
            name: "date_invisibility_exp_date",
            minValue: new Date()
          },
          {
            hidden: true,
            margin:"0 0 0 5",
            width: 140,
            labelWidth: 40,
            fieldLabel: D.t("Time"),
            xtype: "timefield",
            name: "time_invisibility_exp_date",
            format: "H:i",
            increment: 10
          }
        ]
      },
      {
        name: "ref_id",
        hidden: true
      },
      {
        name: "is_adjust",
        hidden: true
      },
      {
        name: "deposit_id",
        hidden: true
      }
    ];
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
      fieldSet: "acc_no,currency",

      fieldLabel: D.t("To account"),
      listeners: {
        dataload: (el, list) => {
          if (!el.defaultValue && list && list.length) {
            el.setValue(list[0].acc_no);
            for (const acc of list) {
              if (this.orderData && acc.currency == this.orderData.currency)
                el.setValue(acc.acc_no);
            }
          }
        }
      }
    };
  },

  buildSenButton: function() {
    return [
      {
        text: D.t("Deposit money"),
        iconCls: "x-fa fa-check-square",
        action: "deposit"
      },
      {
        text: D.t("Adjust deposit"),
        iconCls: "x-fa fa-check-square",
        action: "adjust_deposit"
      }
    ];
  }
});
