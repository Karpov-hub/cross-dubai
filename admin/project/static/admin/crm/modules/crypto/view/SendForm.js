Ext.define("Crm.modules.crypto.view.SendForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Sending crypto"),

  width: 450,
  height: 200,

  formMargin: 5,

  model: Ext.create("Crm.modules.crypto.model.CryptoModel"),
  controllerCls: "Crm.modules.crypto.view.SendFormController",
  onActivate: () => {},
  onClose: () => {},
  syncSize: () => {},

  buildItems() {
    return [
      {
        name: "txId",
        hidden: true
      },
      {
        name: "address_from",
        fieldLabel: D.t("Address from")
      },
      {
        name: "address_to",
        fieldLabel: D.t("Address to")
      },
      Ext.create("Crm.modules.currency.view.CurrencyCombo", {
        name: "currency",
        currency_type: "crypto",
        fieldLabel: D.t("Currency")
      }),
      {
        name: "amount",
        fieldLabel: D.t("Amount")
      }
    ];
  },

  buildButtons: function() {
    return [
      "->",
      {
        text: D.t("Send crypto"),
        iconCls: "x-fa fa-check-square",
        action: "sendtransfer"
      },
      "-",
      {
        text: D.t("Close"),
        iconCls: "x-fa fa-ban",
        handler: () => {
          this.close();
        }
      }
    ];
  }
});
