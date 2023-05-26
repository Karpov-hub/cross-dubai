Ext.define(
  "Crm.modules.orders.view.orderTypes.CryptoFiatWithExchangeRateDeltaController",
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
                "delivery_fee_after_cross_currency",
                "client_amount_before_charges_currency",
                "our_exchange_rate_amount_berfore_charges_currency"
              ]);
              if (!this.view.order_data.delivery_fee_currency)
                this.setFieldsValue(me.view, v, ["delivery_fee_currency"]);
              this.setChargeCurrencies();
              this.setPayoutCurrencies("our_payout_amount_panel");
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
            this.addPayoutField(
              "our_payout_amount_panel",
              "our_exchange_rate_amount"
            );
          }
        },
        "[name=order_amount]": {
          blur: () => {
            this.canculateClientAmountBeforeCharges();
            this.calculateOurExchangeRateAmountBeforeCharges();
          }
        },
        "[name=client_exchange_rate]": {
          blur: () => {
            this.canculateClientAmountBeforeCharges();
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
        "[name=delivery_fee]": {
          blur: () => {
            this.calculateDeliveryData();
          }
        },
        "[name=delivery_fee_cross_rate]": {
          blur: () => {
            this.calculateDeliveryData();
          }
        },
        "[name=delivery_fee_after_cross]": {
          blur: () => {
            this.doPostChargesCalculation();
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
        "our_payout_amount_panel",
        "our_exchange_rate_amount"
      );
      this.callParent(arguments);
    },

    getHashesFields() {
      return this._getHashesFields("our_payout_amount_panel");
    },

    getTransfersFields() {
      return this._getTransfersFields("our_payout_amount_panel");
    },

    async calculateClientExchangeRate() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "order_amount",
        "client_amount"
      ]);
      data = data.fields_data;
      if (!this.checkIfObjectValid(data)) return;
      if (data.client_amount === 0) fields_values["client_exchange_rate"] = 0;
      else
        fields_values["client_exchange_rate"] =
          Math.round((data.order_amount / data.client_amount) * 100) / 100;
      this.saveOrderData(fields_values);
      await this.calculateOurProfit();
      return;
    },

    async canculateClientAmountBeforeCharges() {
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
        "delivery_fee_after_cross",
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
          data.client_amount_before_charges +
          (data.swap_fee || 0) +
          (data.delivery_fee_after_cross || 0);
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
      let controlling_object = {
        order_amount: data.order_amount,
        our_exchange_rate: data.our_exchange_rate
      };
      if (!this.checkIfObjectValid(controlling_object)) return;
      if (data.our_exchange_rate === 0) {
        fields_values["our_exchange_rate_amount_berfore_charges"] = 0;
      } else {
        fields_values["our_exchange_rate_amount_berfore_charges"] =
          data.order_amount / data.our_exchange_rate;
      }
      this.saveOrderData(fields_values);
      await this.calculateOurExchangeRateAmount();
      return;
    },

    async calculateOurExchangeRateAmount() {
      let fields_values = {};
      let data = await this.getOrderFieldsData([
        "our_exchange_rate_amount_berfore_charges",
        "delivery_fee_after_cross",
        "swap_fee"
      ]);
      data = data.fields_data;
      let controlling_object = {
        our_exchange_rate_amount_berfore_charges:
          data.our_exchange_rate_amount_berfore_charges
      };
      if (!this.checkIfObjectValid(controlling_object)) return;
      if (data.our_exchange_rate === 0) {
        fields_values["our_exchange_rate_amount"] = 0;
      } else {
        fields_values["our_exchange_rate_amount"] =
          data.our_exchange_rate_amount_berfore_charges +
          (data.swap_fee || 0) +
          (data.delivery_fee_after_cross || 0);
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
      if (data.our_exchange_rate_amount === 0)
        fields_values["our_exchange_rate"] = 0;
      else
        fields_values["our_exchange_rate"] =
          Math.round(
            (data.order_amount / data.our_exchange_rate_amount) * 100
          ) / 100;
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
        data.client_amount - data.our_exchange_rate_amount;
      this.saveOrderData(fields_values);
      await this.calculateOurNettoProfit();
      return;
    }
  }
);
