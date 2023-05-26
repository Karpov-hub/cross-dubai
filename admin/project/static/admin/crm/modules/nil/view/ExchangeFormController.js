Ext.define("Crm.modules.nil.view.ExchangeFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=exchange]": {
        click: (el, v) => {
          this.exchange();
        }
      }
    });
    this.callParent(arguments);
  },

  async exchange() {
    let amount = this.view.down("[name=amount]").getValue();
    let currency = this.view.down("[name=currency]").getValue();
    let to_currency = this.view.down("[name=to_currency]").getValue();
    let data = {
      amount,
      currency,
      to_currency
    };

    const res = await this.model.callApi("falcon-service", "exchange", data);

    let errorWindow;
    let successWindow;

    if (res.errors)
      errorWindow = Ext.create("Ext.window.Window", {
        title: D.t("Error"),
        layout: "fit",
        width: 350,
        height: 200,
        autoScroll: true,
        modal: true,
        items: [
          {
            xtype: "form",
            layout: "anchor",
            margin: 10,
            padding: 10,
            defaults: {
              xtype: "textfield",
              anchor: "100%",
              labelWidth: 200
            },
            items: [
              {
                xtype: "label",
                text: res.errors[0].message
              }
            ]
          }
        ],
        buttons: [
          {
            text: D.t("Cancel"),
            handler: function() {
              errorWindow.close();
            }
          }
        ]
      }).show();

    if (res.trade_id)
      successWindow = Ext.create("Ext.window.Window", {
        title: D.t("Success"),
        layout: "fit",
        width: 350,
        height: 200,
        autoScroll: true,
        modal: true,
        items: [
          {
            xtype: "form",
            layout: "anchor",
            margin: 10,
            padding: 10,
            defaults: {
              xtype: "textfield",
              anchor: "100%",
              labelWidth: 200
            },
            items: [
              {
                xtype: "label",
                text: `Exchange from ${currency} to ${to_currency}
                ${currency} Amount: ${amount}
                ${to_currency} Amount: ${res.price}`
              }
            ]
          }
        ],
        buttons: [
          {
            text: D.t("Cancel"),
            handler: function() {
              successWindow.close();
            }
          }
        ]
      }).show();
  }
});
