Ext.define("Crm.modules.nil.view.TXHistoryFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=withdrawal]": {
        click: (el, v) => {
          this.withdrawal();
        }
      }
    });
    this.callParent(arguments);
  },

  async withdrawal() {
    let amount = this.view.down("[name=amount]").getValue();
    let currency = this.view.down("[name=currency]").getValue();
    let data = {
      amount,
      currency
    };

    const res = await this.model.callApi("falcon-service", "withdrawal", data);
    //window.history.back();

    let errorWindow;

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
  }
});
