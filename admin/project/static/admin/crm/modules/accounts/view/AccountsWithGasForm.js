Ext.define("Crm.modules.accounts.view.AccountsWithGasForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t(
    "{[values.address?'Wallet':'Account']} currency: {currency} Creation date: {[Ext.Date.format(new Date(values.ctime),'d.m.Y')]}"
  ),

  requires: ["Ext.window.Toast"],

  formLayout: "fit",

  formMargin: 10,

  width: 800,
  height: 600,

  controllerCls: "Crm.modules.accounts.view.AccountsWithGasFormController",

  syncSize: function() {},

  buildItems() {
    let me = this;
    return {
      xtype: "panel",
      layout: "anchor",
      items: [
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          name: "address_panel",
          hidden: true,
          items: [
            {
              xtype: "textfield",
              name: "address",
              fieldLabel: D.t("Address"),
              readOnly: true,
              flex: 1,
              margin: "0 5 0 0"
            },
            {
              xtype: "button",
              iconCls: "x-fa fa-copy",
              tooltip: D.t("Copy address to clipboard"),
              action: "copy_address_to_clipboard",
              width: 30,
              margin: "0 10 0 0"
            },
            {
              xtype: "combo",
              name: "wallet_type",
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
              xtype: "combo",
              name: "status",
              displayField: "name",
              valueField: "no",
              width: 100,
              store: {
                fields: ["no", "name"],
                data: [
                  { no: 1, name: D.t("Activated") },
                  { no: 2, name: D.t("Blocked") },
                  { no: 3, name: D.t("Closed") }
                ]
              },
              margin: "0 5 0 0"
            },
            {
              xtype: "textfield",
              name: "id",
              hidden: true
            },
            {
              xtype: "textfield",
              name: "user_memo",
              emptyText: D.t("User's memo"),
              flex: 1
            },
            {
              xtype: "textfield",
              name: "user_memo_id",
              hidden: true
            },
            {
              xtype: "textfield",
              name: "gas_acc_id",
              hidden: true
            },
            Ext.create("Crm.modules.telegram.view.TelegramChannelComponent", {
              margin: "0 0 0 10",
              user_id: me.config.user_id,
              ref_id: me.config.wallet_ids,
              title: me.config.tg_title
            })
          ]
        },
        {
          xtype: "grid",
          name: "accounts_gridpanel",
          columns: [
            { dataIndex: "acc_no", text: D.t("Account number"), flex: 1 },
            { dataIndex: "currency", text: D.t("Currency"), width: 80 },
            { dataIndex: "balance", text: D.t("Account balance"), width: 150 },
            {
              dataIndex: "crypto_wallet_balance",
              text: D.t("Wallet balance"),
              width: 150
            }
          ],
          store: {}
        }
      ]
    };
  },

  buildButtons() {
    let buttons = this.callParent(arguments);
    return [buttons[1], buttons[3], buttons[5]];
  }
});
