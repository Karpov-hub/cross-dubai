Ext.define(
  "Crm.modules.orders.view.orderTypes.FiatCryptoWithTariffDeltaController",
  {
    extend: "Crm.modules.orders.view.orderTypes.BaseTypesController",

    mixins: [
      "Crm.modules.orders.view.FieldsHelper",
      "Crm.modules.orders.view.orderTypes.CryptoFiatFunctions"
    ],

    setControls() {
      let me = this;
      this.control({
        "[name=to_currency]": {
          change: (el, v, oldv) => {
            if (v) {
              this.setFieldsValue(me.view, v, [
                "cross_rate_amount_currency",
                "client_amount_currency",
                "our_rate_amount_currency",
                "our_profit_currency",
                "our_netto_profit_currency",
                "swap_fee_currency",
                "client_amount_before_charges_currency",
                "our_rate_amount_before_charges_currency"
              ]);
              const from_currency = this.view
                .down("[name=from_currency]")
                .getValue();
              this.setCrossRate(from_currency, v);
              this.setChargeCurrencies();
              this.setPayoutCurrencies("client_payout_amount_panel");
            }
          }
        },
        "[action=add_charge]": {
          click: () => {
            this.addChargeField();
          }
        },
        "[action=add_payout_amount]": {
          click: () => {
            this.addPayoutField("client_payout_amount_panel", "client_amount");
          }
        },
        "[name=order_amount]": {
          blur: () => {
            this.calculateCrossRateAmount();
          }
        },
        "[name=cross_rate]": {
          blur: () => {
            this.calculateCrossRateAmount();
          }
        },
        "[name=cross_rate_amount]": {
          blur: () => {
            this.calculateOurAmount();
          }
        },
        "[name=our_rate]": {
          blur: () => {
            this.calculateOurAmountBeforeCharges();
          }
        },
        "[name=our_rate_amount]": {
          blur: () => {
            this.calculateOurProfit();
          }
        },
        "[name=client_rate]": {
          blur: () => {
            this.calculateClientAmountBeforeCharges();
          }
        },
        "[name=client_amount]": {
          blur: () => {
            this.calculateOurProfit();
          }
        },
        "[name=our_profit]": {
          blur: () => {
            this.calculateOurNettoProfit();
          }
        },
        "[name=from_currency]": {
          change: (el, v, oldv) => {
            if (v) {
              const to_currency = this.view
                .down("[name=to_currency]")
                .getValue();
              this.setCrossRate(v, to_currency);
            }
          }
        },
        "[name=swap_fee]": {
          blur: () => {
            this.doPostChargesCalculation();
          }
        }
      });
      this.sortCurrenciesStores();
      return this.callParent(arguments);
    },
    async sortCurrenciesStores() {
      await this.sortCurrenciesByCommonUsed("from_currency");
      await this.sortCurrenciesByCommonUsed("to_currency");
    },
    setValues(data) {
      this.buildPanels(
        this.view.config.order_data,
        "client_payout_amount_panel",
        "client_amount"
      );
      this.callParent(arguments);
    },
    setCrossRate(from_currency, to_currency) {
      if (from_currency == "USD" && ["USDT", "USTR"].includes(to_currency)) {
        this.view.down("[name=cross_rate]").setValue(1);
      } else {
        this.view
          .down("[name=cross_rate]")
          .setValue(this.view.order_data.cross_rate);
      }
      this.calculateCrossRateAmount();
    },

    getHashesFields() {
      return this._getHashesFields("client_payout_amount_panel");
    },

    getTransfersFields() {
      return this._getTransfersFields("client_payout_amount_panel");
    },

    async calculateOurProfit() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "client_amount",
        "our_rate_amount"
      ]);
      data = data.fields_data;
      if (!this.checkIfObjectValid(data)) return;
      fields_values["our_profit"] = data.our_rate_amount - data.client_amount;
      this.saveOrderData(fields_values);
      await this.calculateOurNettoProfit();
      return;
    },

    async calculateCrossRateAmount() {
      let fields_values = {};
      let data = await this.getOrderFieldsData(["order_amount", "cross_rate"]);
      data = data.fields_data;
      if (!this.checkIfObjectValid(data)) return;
      fields_values["cross_rate_amount"] = data.order_amount * data.cross_rate;
      this.saveOrderData(fields_values);
      await this.calculateOurAmountBeforeCharges();
      return;
    },
    async doPostChargesCalculation() {
      this.calculateClientAmount();
      this.calculateOurAmount();
      return;
    },

    async calculateOurAmountBeforeCharges() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "cross_rate_amount",
        "our_rate"
      ]);
      data = data.fields_data;
      if (!this.checkIfObjectValid(data)) return;
      fields_values["our_rate_amount_before_charges"] =
        data.cross_rate_amount - (data.cross_rate_amount / 100) * data.our_rate;
      this.saveOrderData(fields_values);
      await this.calculateOurAmount();
      return;
    },

    async calculateOurAmount() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "our_rate_amount_before_charges",
        "swap_fee"
      ]);
      data = data.fields_data;
      let controlling_object = {
        our_rate_amount_before_charges: data.our_rate_amount_before_charges
      };
      if (!this.checkIfObjectValid(controlling_object)) return;
      fields_values["our_rate_amount"] =
        data.our_rate_amount_before_charges - (data.swap_fee || 0);
      this.saveOrderData(fields_values);
      await this.calculateClientAmountBeforeCharges();
      return;
    },

    async calculateClientAmountBeforeCharges() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "cross_rate_amount",
        "client_rate"
      ]);
      data = data.fields_data;
      if (!this.checkIfObjectValid(data)) return;
      fields_values["client_amount_before_charges"] =
        data.cross_rate_amount -
        (data.cross_rate_amount / 100) * data.client_rate;
      this.saveOrderData(fields_values);
      await this.calculateClientAmount();
      return;
    },
    async calculateClientAmount() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "client_amount_before_charges",
        "swap_fee"
      ]);
      data = data.fields_data;
      let controlling_object = {
        client_amount_before_charges: data.client_amount_before_charges
      };
      if (!this.checkIfObjectValid(controlling_object)) return;
      fields_values["client_amount"] =
        data.client_amount_before_charges - (data.swap_fee || 0);
      this.saveOrderData(fields_values);
      await this.calculateOurProfit();
      return;
    }
  }
);
