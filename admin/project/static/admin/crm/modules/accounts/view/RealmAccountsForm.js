Ext.define("Crm.modules.accounts.view.RealmAccountsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Account: {acc_no}"),
  requires: ["Core.form.DependedCombo"],
  formLayout: "fit",

  formMargin: 0,

  width: 550,
  height: 280,

  syncSize: function() {},

  controllerCls: "Crm.modules.accounts.view.RealmAccountsFormController",

  buildItems() {
    this.ownerEl = Ext.create("Ext.form.field.Text", {
      name: "owner",
      hidden: true
    });
    return {
      xtype: "panel",
      layout: "anchor",
      defaults: {
        anchor: "100%",
        xtype: "textfield",
        labelWidth: 150,
        margin: 5
      },
      items: [
        {
          name: "id",
          hidden: true
        },
        this.ownerEl,

        {
          name: "acc_name",

          fieldLabel: D.t("Account name")
        },
        {
          name: "acc_no",
          readOnly: true,
          fieldLabel: D.t("Account no")
        },

        {
          xtype: "fieldcontainer",
          layout: "hbox",
          items: [
            this.buildCurrencyCombo(),
            {
              name: "balance",
              readOnly: true,
              value: 0,
              flex: 1,
              margin: "0 0 0 3",
              xtype: "textfield",
              fieldLabel: D.t("Balance")
            }
          ]
        },
        this.buildTypeCombo(),
        {
          name: "details",
          fieldLabel: D.t("Notes")
        },
        {
          name: "negative",
          xtype: "checkbox",
          fieldLabel: D.t("Negative balance")
        }
      ]
    };
  },

  buildTypeCombo() {
    return {
      name: "type",
      fieldLabel: D.t("Tech type"),
      xtype: "combo",
      editable: false,
      queryMode: "local",
      displayField: "name",
      flex: 1,
      valueField: "key",
      store: {
        fields: ["key", "name"],
        data: [
          {
            key: 1,
            name: "for depost transfers"
          },
          {
            key: 2,
            name: "for withdrawal transfers"
          },
          {
            key: 3,
            name: "for fees"
          }
        ]
      }
    };
  },

  buildCurrencyCombo() {
    return {
      name: "currency",
      margin: "0 3 0 0",
      labelWidth: 150,
      fieldLabel: D.t("Currency"),
      xtype: "combo",
      editable: false,
      queryMode: "local",
      displayField: "abbr",
      flex: 1,
      valueField: "abbr",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.currency.model.CurrencyModel"),
        fieldSet: ["abbr"],
        scope: this
      })
    };
  },

  buildButtons: function() {
    var btns = [
      "->",
      {
        text: D.t("Save"),
        iconCls: "x-fa fa-check-square",
        action: "apply"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
    if (this.allowCopy)
      btns.splice(1, 0, {
        tooltip: D.t("Make a copy"),
        iconCls: "x-fa fa-copy",
        action: "copy"
      });
    return btns;
  }
});
