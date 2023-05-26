Ext.define("Crm.modules.accounts.view.AccountsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Account: {acc_no}"),
  requires: ["Desktop.core.widgets.GridField"],
  formLayout: "fit",

  formMargin: 0,

  // width: 650,
  // height: 270,

  // syncSize: function() {},

  controllerCls: "Crm.modules.accounts.view.AccountsFormController",

  buildItems() {
    return {
      xtype: "panel",
      layout: "border",
      items: [
        {
          xtype: "panel",
          layout: "anchor",
          region: "north",
          height: 230,
          split: true,
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
            {
              name: "owner",
              hidden: true
            },
            {
              name: "acc_no",
              readOnly: true,
              fieldLabel: D.t("Account no")
            },
            {
              name: "acc_description",
              fieldLabel: D.t("Account description")
            },
            {
              name: "acc_name",
              readOnly: true,
              fieldLabel: D.t("Account name")
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
                  labelWidth: 90,
                  margin: "0 0 0 3",
                  xtype: "textfield",
                  fieldLabel: D.t("Balance")
                },
                {
                  name: "overdraft",
                  value: 0,
                  flex: 1,
                  labelWidth: 90,
                  margin: "0 0 0 3",
                  xtype: "textfield",
                  fieldLabel: D.t("Overdraft")
                }
              ]
            },
            this.buildStatusCombo(),
            {
              name: "negative",
              xtype: "checkbox",
              fieldLabel: D.t("Negative balance")
            },
            {
              name: "on_top",
              xtype: "checkbox",
              fieldLabel: D.t("To top")
            },
            {
              name: "address",
              fieldLabel: D.t("Crypto address")
            }
          ]
        },
        this.buildTransactions()
      ]
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
        dataModel: Ext.create("Crm.modules.currency.model.ActiveCurrencyModel"),
        fieldSet: ["abbr"],
        scope: this
      })
    };
  },

  buildStatusCombo() {
    return {
      name: "status",
      xtype: "combo",
      fieldLabel: D.t("Status"),
      value: 0,
      displayField: "name",
      //editable: false,
      valueField: "key",
      store: {
        fields: ["key", "name"],
        data: [
          // { key: 0, name: D.t("New") },
          { key: 1, name: D.t("Activated") },
          { key: 2, name: D.t("Blocked") },
          { key: 3, name: D.t("Closed") }
        ]
      }
    };
  },

  buildTransactions() {
    return {
      xtype: "panel",
      region: "center",
      cls: "grayTitlePanel",
      layout: "fit",
      split: true,
      items: Ext.create("Crm.modules.transactions.view.TransactionsGrid", {
        scope: this,
        observe: [{ property: "acc_find", param: "acc_no" }],
        model: "Crm.modules.accounts.model.TransactionsModel"
      })
    };
  },

  buildButtons: function() {
    var btns = [
      {
        text: D.t("Monitoring wallet"),
        action: "mwallet"
      },
      "->",
      {
        text: D.t("Save"),
        iconCls: "x-fa fa-check-square",
        scale: "medium",
        action: "custom_save"
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
