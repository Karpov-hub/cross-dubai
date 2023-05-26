Ext.define("Crm.modules.accounts.view.AccountFormationForm", {
  extend: "Core.form.FormWindow",

  controllerCls: "Crm.modules.accounts.view.AccountFormationFormController",

  model: "Crm.modules.accounts.model.AccountsModel",

  requires: ["Ext.window.Toast"],

  titleTpl: D.t("Create new account"),

  syncSize: function() {},
  onClose() {},
  onActivate() {},

  formLayout: "fit",

  formMargin: 10,

  width: 500,
  height: 300,

  buildItems() {
    return {
      xtype: "panel",
      layout: "anchor",
      defaults: {
        anchor: "100%",
        labelWidth: 100
      },
      items: [
        {
          xtype: "textfield",
          name: "merchant_id",
          hidden: true
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: {
            flex: 1
          },
          items: [
            {
              xtype: "combo",
              margin: "0 10 0 0",
              name: "currency",
              fieldLabel: D.t("Currency"),
              editable: false,
              queryMode: "local",
              displayField: "abbr",
              valueField: "abbr",
              store: {
                fields: ["abbr", "crypto"],
                data: []
              },
              allowBlank: false
            },
            {
              xtype: "combo",
              name: "wallet_type",
              fieldLabel: D.t("Wallet type"),
              editable: false,
              queryMode: "local",
              displayField: "label",
              valueField: "type",
              store: {
                fields: ["type", "label"],
                data: [
                  { type: 0, label: D.t("User") },
                  { type: 1, label: D.t("Monitor") }
                ]
              }
            }
          ]
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          items: [
            {
              xtype: "textfield",
              name: "address",
              flex: 1,
              margin: "0 2 0 0",
              fieldLabel: D.t("Address"),
              listeners: {
                render: function(c) {
                  new Ext.ToolTip({
                    target: c.getEl(),
                    html:
                      "Leave this field empty and the system will create a new address. To link an address you have, put it in this field"
                  });
                }
              }
            },
            {
              xtype: "button",
              action: "about_address",
              width: 30,
              iconCls: "x-fa fa-question"
            }
          ]
        },
        {
          xtype: "textfield",
          name: "user_memo",
          fieldLabel: D.t("User's memo")
        }
      ]
    };
  },
  buildButtons() {
    let buttons = this.callParent(arguments);
    buttons[3].action = "save";
    return [buttons[1], buttons[3], buttons[4], buttons[5]];
  }
});
