Ext.define(
  "Crm.modules.orders.view.orderTypes.FiatCryptoWithExchangeRateDeltaController",
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
                "client_amount_currency",
                "our_exchange_rate_amount_currency",
                "our_profit_currency",
                "our_netto_profit_currency",
                "swap_fee_currency",
                "our_exchange_rate_amount_before_charges_currency",
                "client_amount_before_charges_currency"
              ]);
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
            this.calculateClientAmountBeforeCharges();
            this.calculateOurExchangeRateAmountBeforeCharges();
          }
        },
        "[name=client_exchange_rate]": {
          blur: () => {
            this.calculateClientAmountBeforeCharges();
          }
        },
        "[name=our_exchange_rate]": {
          blur: () => {
            this.calculateOurExchangeRateAmountBeforeCharges();
          }
        },
        "[name=our_profit]": {
          blur: () => {
            this.calculateOurNettoProfit();
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
    getHashesFields() {
      return this._getHashesFields("client_payout_amount_panel");
    },
    getTransfersFields() {
      return this._getTransfersFields("client_payout_amount_panel");
    },
    async calculateClientExchangeRate() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "order_amount",
        "client_amount",
        "swap_fee"
      ]);
      data = data.fields_data;
      if (!this.checkIfObjectValid(data)) return;
      if (data.client_amount === 0) fields_values["client_exchange_rate"] = 0;
      else
        fields_values["client_exchange_rate"] =
          data.order_amount / data.client_amount;
      this.saveOrderData(fields_values);
      await this.calculateOurProfit();
      return;
    },
    async calculateClientAmountBeforeCharges() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "order_amount",
        "client_exchange_rate"
      ]);
      data = data.fields_data;
      if (!this.checkIfObjectValid(data)) return;
      if (data.client_exchange_rate === 0) {
        fields_values["client_amount_before_charges"] = 0;
      } else {
        fields_values["client_amount_before_charges"] =
          data.order_amount / data.client_exchange_rate;
      }
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
      if (data.client_exchange_rate === 0) {
        fields_values["client_amount"] = 0;
      } else {
        fields_values["client_amount"] =
          data.client_amount_before_charges - (data.swap_fee || 0);
      }
      this.saveOrderData(fields_values);
      await this.calculateOurProfit();
      return;
    },

    async calculateOurExchangeRateAmountBeforeCharges() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "order_amount",
        "our_exchange_rate"
      ]);
      data = data.fields_data;
      if (!this.checkIfObjectValid(data)) return;
      if (data.our_exchange_rate === 0) {
        fields_values["our_exchange_rate_amount_before_charges"] = 0;
      } else {
        fields_values["our_exchange_rate_amount_before_charges"] =
          data.order_amount / data.our_exchange_rate;
      }
      this.saveOrderData(fields_values);
      await this.calculateOurExchangeRateAmount();
      return;
    },

    async calculateOurExchangeRateAmount() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "our_exchange_rate_amount_before_charges",
        "swap_fee"
      ]);
      data = data.fields_data;
      let controlling_object = {
        our_exchange_rate_amount_before_charges:
          data.our_exchange_rate_amount_before_charges
      };
      if (!this.checkIfObjectValid(controlling_object)) return;
      if (data.our_exchange_rate === 0) {
        fields_values["our_exchange_rate_amount"] = 0;
      } else {
        fields_values["our_exchange_rate_amount"] =
          data.our_exchange_rate_amount_before_charges - (data.swap_fee || 0);
      }
      this.saveOrderData(fields_values);
      await this.calculateOurProfit();
      return;
    },
    async calculateOurExchangeRate() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "order_amount",
        "our_exchange_rate_amount"
      ]);
      data = data.fields_data;
      if (!this.checkIfObjectValid(data)) return;
      fields_values["our_exchange_rate"] =
        data.order_amount / data.our_exchange_rate_amount;
      this.saveOrderData(fields_values);
      await this.calculateOurProfit();
      return;
    },

    async calculateOurProfit() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "client_amount",
        "our_exchange_rate_amount"
      ]);
      data = data.fields_data;
      if (!this.checkIfObjectValid(data)) return;
      fields_values["our_profit"] =
        data.our_exchange_rate_amount - data.client_amount;
      this.saveOrderData(fields_values);
      await this.calculateOurNettoProfit();
      return;
    }
  }
);
