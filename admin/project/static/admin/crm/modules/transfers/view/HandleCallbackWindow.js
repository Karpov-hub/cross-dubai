Ext.define("Crm.modules.transfers.view.HandleCallbackWindow", {
  extend: "Ext.window.Window",

  autoShow: true,
  modal: true,

  title: D.t("Callbacks sender"),

  layout: "fit",
  width: 500,
  height: 330,

  initComponent() {
    this.items = this.buildItems();
    this.buttons = this.buildButtons();
    this.callParent(arguments);
  },

  buildItems() {
    return {
      xtype: "form",
      layout: "anchor",
      padding: 5,
      defaults: {
        xtype: "fieldset",
        anchor: "100%",
        defaults: {
          xtype: "textfield",
          anchor: "100%",
          defaults: {
            xtype: "textfield"
          }
        }
      },
      items: [
        {
          title: D.t("Callback 1 (SK=>Monitor)"),
          items: [
            {
              fieldLabel: D.t("TxId"),
              name: "cb1_txId"
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  fieldLabel: D.t("Amount"),
                  flex: 1,
                  name: "cb1_amount",
                  margin: "0 10 0 0"
                },
                {
                  fieldLabel: D.t("Currency"),
                  width: 150,
                  labelWidth: 70,
                  name: "cb1_currency",
                  value: "USDT"
                }
              ]
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  fieldLabel: D.t("Network fee"),
                  flex: 1,
                  name: "cb1_fee",
                  margin: "0 10 0 0"
                },
                {
                  fieldLabel: D.t("Currency"),
                  width: 150,
                  labelWidth: 70,
                  name: "cb1_feeCurrency",
                  value: "ETH"
                }
              ]
            }
          ]
        },
        {
          title: D.t("Callback 2 (Monitor=>Outside wallet)"),
          items: [
            {
              fieldLabel: D.t("TxId"),
              name: "cb2_txId"
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  fieldLabel: D.t("Amount"),
                  flex: 1,
                  name: "cb2_amount",
                  margin: "0 10 0 0"
                },
                {
                  fieldLabel: D.t("Currency"),
                  width: 150,
                  labelWidth: 70,
                  name: "cb2_currency",
                  value: "USDT"
                }
              ]
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  fieldLabel: D.t("Network fee"),
                  flex: 1,
                  name: "cb2_fee",
                  margin: "0 10 0 0"
                },
                {
                  fieldLabel: D.t("Currency"),
                  width: 150,
                  labelWidth: 70,
                  name: "cb2_feeCurrency",
                  value: "ETH"
                }
              ]
            }
          ]
        }
      ]
    };
  },

  buildButtons() {
    return [
      {
        text: D.t("Send"),
        handler: () => {
          this.makeOutData();
          this.close();
        }
      },
      {
        text: D.t("Cancel"),
        handler: () => {
          this.close();
        }
      }
    ];
  },

  makeOutData() {
    const values = this.down("form").getValues();
    const out = { cb1: {}, cb2: {} };
    for (let val in values) {
      const cb = val.substr(0, 3);
      const key = val.substr(4);
      out[cb][key] = values[val];
    }
    this.callback(out);
  }
});
