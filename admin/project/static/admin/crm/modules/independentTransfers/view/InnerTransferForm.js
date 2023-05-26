Ext.define("Crm.modules.independentTransfers.view.InnerTransferForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Inner transfer"),

  width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 450,
  height: 200,

  formMargin: 5,

  model: Ext.create("Crm.modules.crypto.model.CryptoModel"),
  controllerCls:
    "Crm.modules.independentTransfers.view.InnerTransferFormController",

  onActivate: () => {},
  onClose: () => {},
  syncSize: () => {},

  buildItems() {
    return [
      Ext.create("Ext.form.ComboBox", {
        name: "merchant",
        fieldLabel: D.t("Merchant"),
        valueField: "id",
        editable: !Ext.platformTags.phone,
        labelAlign: Ext.platformTags.phone ? "top" : "left",
        displayField: "name",
        queryMode: "local",
        store: Ext.create("Core.data.ComboStore", {
          dataModel: "Crm.modules.merchants.model.InnerClientsMerchantsModel",
          fieldSet: "id,user_id,name",
          scope: this
        })
      })
    ];
  },

  buildButtons: function() {
    return [
      "->",
      {
        text: D.t("Close"),
        iconCls: "x-fa fa-ban",
        handler: () => {
          this.close();
        }
      },
      "-",
      {
        text: D.t("Create payment"),
        iconCls: "x-fa fa-check-square",
        action: "create_payment_window"
      }
    ];
  }
});
