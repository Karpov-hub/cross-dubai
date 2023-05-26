Ext.define("Crm.modules.accounts.view.UserAccountsForm", {
  extend: "Crm.modules.accounts.view.AccountsForm",
  model: "Crm.modules.accounts.model.AccountsModel",
  onActivate: function() {},

  onClose: function() {},
  syncSize: function() {},
  width: 650,
  height: 300,

  buildItems() {
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
              readOnly: false,
              value: -1,
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
          name: "address",
          fieldLabel: D.t("Wallet address")
        }
      ]
    };
  },

  buildButtons(){
    let buttons = this.callParent(arguments)
    buttons[2].action = "save"
    return buttons
  }
});
