Ext.define("Crm.modules.currency.view.CurrencyRateFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=getrates]": {
        click: () => {
          this.getRates();
        }
      }
    });
    this.readServices();
    this.callParent(arguments);
  },

  async readServices() {
    const res = await this.model.callApi("currency-service", "getServices", {});
    this.view.serviceStore.loadData(
      res.map((s) => {
        return { code: s };
      })
    );
  },

  async getRates() {
    const service = this.view.down("[name=service]").getValue();

    const res = await this.model
      .callApi("currency-service", "getRates", {
        service
      })
      .catch((e) => {
        console.log("getRates e:", e);
      });

    this.view.down("[name=values]").setValue(res ? res.currency : []);
  }
});
