Ext.define("Crm.modules.banks.view.BanksForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Bank: {name}"),

  formMargin: 5,

  width: 550,
  height: 430,

  syncSize: function() {},

  //controllerCls: "Crm.modules.accounts.view.AccountsFormController",

  buildItems() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "name",
        fieldLabel: D.t("Bank Name")
      },
      {
        name: "code",
        fieldLabel: D.t("Bank Code")
      },
      {
        name: "shortname",
        fieldLabel: D.t("Short Name")
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
      },
      {
        name: "swift",
        fieldLabel: D.t("SWIFT")
      },
      {
        name: "address1",
        fieldLabel: D.t("Address")
      },
      {
        name: "notes",
        fieldLabel: D.t("Notes")
      },
      {
        name: "phone",
        fieldLabel: D.t("Phone")
      },
      {
        xtype: "checkbox",
        name: "falcon_bank",
        fieldLabel: D.t("Falcon bank")
      },
      {
        xtype: "fieldset",
        title: D.t("Bank-correspondent"),
        layout: "anchor",
        defaults: {
          anchor: "100%",
          labelWidth: 150,
          xtype: "textfield"
        },
        items: [
          {
            name: "corr_bank",
            fieldLabel: D.t("Bank name")
          },
          {
            name: "corr_swift",
            fieldLabel: D.t("SWIFT")
          },
          {
            name: "corr_acc",
            fieldLabel: D.t("Beneficiary bank account")
          }
        ]
      }
    ];
  },

  buildAddress(name, text) {
    return {
      xtype: "fieldcontainer",
      layout: "hbox",
      fieldLabel: D.t(text),
      defaults: {
        xtype: "textfield"
      },
      items: [
        {
          name: `city_${name}`,
          margin: "0 0 3 0",
          flex: 1,
          emptyText: D.t("city")
        },
        {
          name: `street_${name}`,
          margin: "0 0 0 3",
          flex: 1,
          emptyText: D.t("street")
        },
        {
          name: `house_${name}`,
          margin: "0 0 0 3",
          flex: 1,
          emptyText: D.t("house")
        },
        {
          name: `apartment_${name}`,
          margin: "0 0 0 3",
          flex: 1,
          emptyText: D.t("apartment")
        }
      ]
    };
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
