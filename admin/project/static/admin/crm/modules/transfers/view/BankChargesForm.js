Ext.define("Crm.modules.transfers.view.BankChargesForm", {
  extend: "Crm.modules.transfers.view.NewTransferForm",

  titleTpl: "Bank charges",
  iconCls: "x-fa fa-download",

  height: 370,
  width: 800,

  formLayout: "fit",
  formMargin: 0,

  controllerCls: "Crm.modules.transfers.view.BankChargesController",

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
        }
        // Ext.create("Crm.modules.tariffs.view.TariffSettingsPanel")
      ]
    };
  },

  buildItems: function() {
    return [
      {
        xtype: "fieldcontainer",
        margin: 5,
        layout: "hbox",
        items: [
          {
            name: "amount",
            xtype: "numberfield",
            flex: 1,
            margin: "0 5 0 0",
            fieldLabel: D.t("Amount")
          },
          Ext.create("Crm.modules.currency.view.CurrencyCombo", {
            name: "to_currency",
            width: 210,
            margin: "0 5 0 0",
            fieldLabel: D.t("Сurrency")
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
      {
        name: "ref_id",
        hidden: true
      },
      {
        name: "user_id",
        hidden: true
      },
      {
        name: "merchant_id",
        hidden: true
      },
      {
        name: "realm_id",
        hidden: true
      }
    ];
  },

  buildSenButton: function() {
    return [
      {
        text: D.t("Send money"),
        iconCls: "x-fa fa-check-square",
        action: "bankcharge"
      }
    ];
  }
});
