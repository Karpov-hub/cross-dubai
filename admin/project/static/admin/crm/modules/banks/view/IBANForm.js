Ext.define("Crm.modules.banks.view.IBANForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("IBAN: {name}"),

  formMargin: 5,

  width: 550,
  height: 400,

  syncSize: function() {},

  controllerCls: "Crm.modules.banks.view.IBANFormController",

  buildItems() {
    return [
      {
        name: "id",
        xtype: "textfield",
        hidden: true
      },
      {
        name: "owner",
        xtype: "textfield",
        hidden: true
      },
      {
        name: "acc_holder_name",
        fieldLabel: D.t("Account holder name"),
        xtype: "textfield",
        readOnly: true
      },
      {
        name: "iban",
        fieldLabel: D.t("IBAN/Account №"),
        xtype: "textfield"
      },
      {
        name: "bank_id",
        fieldLabel: D.t("Bank name"),
        xtype: "combo",
        displayField: "name",
        valueField: "id",
        store: Ext.create("Core.data.ComboStore", {
          dataModel: Ext.create("Crm.modules.banks.model.BanksModel"),
          fieldSet: ["id", "name", "swift", "address1", "country"],
          scope: this
        }),
        action: "change_bank"
      },
      {
        name: "swift",
        fieldLabel: D.t("SWIFT code"),
        xtype: "textfield"
      },
      {
        name: "address1",
        fieldLabel: D.t("Bank address"),
        xtype: "textfield"
      },
      {
        xtype: "combo",
        name: "country",
        fieldLabel: D.t("Country"),
        valueField: "abbr2",
        displayField: "name",
        queryMode: "local",
        store: Ext.create("Core.data.ComboStore", {
          dataModel: Ext.create("Crm.modules.settings.model.CountriesModel"),
          fieldSet: ["abbr2", "name"],
          scope: this
        })
      }
    ];
  },

  buildButtons: function() {
    return [
      {
        tooltip: D.t("Remove this record"),
        iconCls: "x-fa fa-trash-alt",
        action: "remove"
      },
      "->",
      {
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square",
        action: "save"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
