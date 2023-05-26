Ext.define("Admin.view.main.TopAccounts", {
  extend: "Ext.panel.Panel",
  xtype: "topaccountspanel",

  controller: Ext.create('Admin.src.main.TopAccountsController'),

  layout:'hbox',
  defaults:{
    xtype: "fieldcontainer",
    layout: "hbox",
    defaults: {
      xtype: "displayfield",
      margin: "0 0 0 20"
    },
  },


  addAccount(accObject) {
      this.add({
        listeners: {
          render: function() {
            this.getEl().dom.title = "Account number is: "+accObject.acc_no;
          }
        },
        acc_no: accObject.acc_no,
        items: [
          {
            value: accObject.balance,
            name: "balance"
          },
          {
            value: accObject.currency,
          },
          {
            xtype: "button",
            text: "+",
            handler:()=>{
              this.controller.addMoney(accObject)
            }
          }
        ]
      })
  },

  fillAccount(acc_no, balance) {
    const el = this.down(`[acc_no=${acc_no}]`);
    el.down("[name=balance]").setValue(balance)
  }
});
