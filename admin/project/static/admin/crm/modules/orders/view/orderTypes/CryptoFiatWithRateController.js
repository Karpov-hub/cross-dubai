Ext.define("Crm.modules.orders.view.orderTypes.CryptoFiatWithRateController", {
  extend: "Crm.modules.orders.view.orderTypes.BaseTypesController",

  mixins: [
    "Crm.modules.orders.view.FieldsHelper",
    "Crm.modules.orders.view.orderTypes.CryptoFiatFunctions"
  ],

  setControls() {
    let me = this;
    const doActionsWhenToCurrencyChanged = () => {
      let v = this.view.down("[name=to_currency]").getValue();
      if (v) {
        const from_currency = this.view.down("[name=from_currency]").getValue();
        this.setCrossRate(from_currency, v);

        if (this.getClientActionType() == "buy") {
          this.setFieldsValue(me.view, v, [
            "cross_rate_amount_currency",
            "client_amount_currency",
            "our_rate_amount_currency",
            "our_profit_currency",
            "our_netto_profit_currency",
            "swap_fee_currency",
            "delivery_fee_after_cross_currency",
            "client_amount_before_charges_currency",
            "our_rate_amount_before_charges_currency"
          ]);
          if (!this.view.order_data.delivery_fee_currency)
            this.setFieldsValue(me.view, v, ["delivery_fee_currency"]);

          this.setChargeCurrencies();
          this.setPayoutCurrencies("our_payout_amount_panel");
        }
        if (this.getClientActionType() == "sell")
          this.setFieldsValue(me.view, v, ["cross_rate_amount_currency"]);
      }
    };
    const doActionsWhenFromCurrencyChanged = () => {
      let v = this.view.down("[name=from_currency]").getValue();
      if (v) {
        const to_currency = this.view.down("[name=to_currency]").getValue();
        this.setCrossRate(v, to_currency);
        if (this.getClientActionType() == "sell") {
          this.setFieldsValue(me.view, v, [
            "client_amount_currency",
            "our_rate_amount_currency",
            "our_profit_currency",
            "our_netto_profit_currency",
            "swap_fee_currency",
            "delivery_fee_after_cross_currency",
            "client_amount_before_charges_currency",
            "our_rate_amount_before_charges_currency"
          ]);
          if (!this.view.order_data.delivery_fee_currency)
            this.setFieldsValue(me.view, v, ["delivery_fee_currency"]);
          this.setChargeCurrencies();
          this.setPayoutCurrencies("our_payout_amount_panel");
        }
      }
    };
    this.control({
      "[name=to_currency]": {
        change: (el, v, oldv) => {
          doActionsWhenToCurrencyChanged();
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
            this.getClientActionType() == "sell"
              ? "client_amount"
              : "our_rate_amount"
          );
        }
      },
      "[name=order_amount]": {
        blur: () => {
          if (this.getClientActionType() == "sell") {
            this.calculateSellClientAmountBeforeCharges();
            this.calculateSellOurAmountBeforeCharges();
          } else this.calculateCrossRateAmount();
        }
      },
      "[name=cross_rate]": {
        blur: () => {
          if (this.getClientActionType() == "sell")
            this.calculateSellCrossRateAmount();
          else this.calculateCrossRateAmount();
        }
      },
      "[name=cross_rate_amount]": {
        blur: () => {
          if (this.getClientActionType() == "sell") return;
          this.calculateClientAmountBeforeCharges();
        }
      },
      "[name=client_rate]": {
        blur: () => {
          if (this.getClientActionType() == "sell")
            this.calculateSellClientAmountBeforeCharges();
          else this.calculateClientAmountBeforeCharges();
        }
      },
      "[name=client_amount]": {
        blur: () => {
          if (this.getClientActionType() == "sell") {
            this.calculateSellCrossRateAmount();
            this.calculateSellOurProfit();
          } else this.calculateOurAmountBeforeCharges();
        }
      },
      "[name=our_rate]": {
        blur: () => {
          if (this.getClientActionType() == "sell")
            this.calculateSellOurAmountBeforeCharges();
          else this.calculateOurAmountBeforeCharges();
        }
      },
      "[name=our_rate_amount]": {
        blur: () => {
          if (this.getClientActionType() == "sell")
            this.calculateSellOurProfit();
          else this.calculateOurProfit();
        }
      },
      "[name=our_profit]": {
        blur: () => {
          this.calculateOurNettoProfit();
        }
      },
      "[name=from_currency]": {
        change: (el, v, oldv) => {
          doActionsWhenFromCurrencyChanged();
        }
      },
      "[name=client_action_type]": {
        change: async (el, v) => {
          this.view.down("[name=_client_action_type]").setValue(v);
          doActionsWhenToCurrencyChanged();
          doActionsWhenFromCurrencyChanged();
          let which_percent_bigger_selector = this.view.down(
            "[name=which_percent_bigger]"
          );
          if (v && v == "sell") {
            which_percent_bigger_selector.setVisible(false);
            this.view.down("[name=formula]").setVisible(false);
            this.calculateSellOrderData();
          }
          if (v && v == "buy") {
            which_percent_bigger_selector.setVisible(true);
            this.setFormulaVisibility();
            this.calculateOrderData();
          }
        }
      },
      "[name=which_percent_bigger]": {
        change: async (el, v) => {
          this.view.down("[name=_which_percent_bigger]").setValue(v);
          this.setFormulaVisibility();
          await this.calculateOrderData();
        }
      },
      "[name=formula]": {
        change: async (el, v) => {
          this.view.down("[name=_formula]").setValue(v);
          await this.calculateOrderData();
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
    this.setDefaultSelectors();
    return this.callParent(arguments);
  },

  async doPostChargesCalculation() {
    if (this.getClientActionType() == "buy") {
      await this.calculateOurAmount();
      return await this.calculateClientAmount();
    }
    if (this.getClientActionType() == "sell") {
      await this.calculateSellOurAmount();
      return await this.calculateSellClientAmount();
    }
  },

  async calculateOrderData() {
    if (this.view.down("[name=client_action_type]").getValue() == "buy") {
      await this.calculateCrossRateAmount();
      await this.calculateClientAmountBeforeCharges();
      await this.calculateOurAmountBeforeCharges();
    }
  },

  async calculateSellOrderData() {
    if (this.view.down("[name=client_action_type]").getValue() == "sell") {
      await this.calculateSellClientAmountBeforeCharges();
      await this.calculateSellOurAmountBeforeCharges();
      await this.calculateSellCrossRateAmount();
    }
  },

  setDefaultSelectors() {
    if (this.view.config.order_data._client_action_type)
      this.view
        .down("[name=client_action_type]")
        .setValue(this.view.config.order_data._client_action_type);
    else this.view.down("[name=client_action_type]").setValue("buy");

    if (this.view.config.order_data._which_percent_bigger)
      this.view
        .down("[name=which_percent_bigger]")
        .setValue(this.view.config.order_data._which_percent_bigger);
    else this.view.down("[name=which_percent_bigger]").setValue("client");

    if (this.view.config.order_data._formula)
      this.view
        .down("[name=formula]")
        .setValue(this.view.config.order_data._formula);
    else if (
      this.view.config.order_data._which_percent_bigger != "our" &&
      !this.view.config.order_data._formula
    )
      this.view.down("[name=formula]").setValue("amountmulrate");
  },

  setFormulaVisibility() {
    if (this.view.down("[name=client_action_type]").getValue() == "buy") {
      let which_percent_bigger_selector = this.view.down(
        "[name=which_percent_bigger]"
      );
      if (
        which_percent_bigger_selector.getValue() &&
        which_percent_bigger_selector.getValue() == "client"
      )
        return this.view.down("[name=formula]").setVisible(true);
    }
    this.view.down("[name=formula]").setVisible(false);
  },
  async sortCurrenciesStores() {
    await this.sortCurrenciesByCommonUsed("from_currency");
    await this.sortCurrenciesByCommonUsed("to_currency");
    await this.sortCurrenciesByCommonUsed("delivery_fee_currency");
  },

  setCrossRate(from_currency, to_currency) {
    if (
      (from_currency == "USD" && ["USDT", "USTR"].includes(to_currency)) ||
      (to_currency == "USD" && ["USDT", "USTR"].includes(from_currency))
    ) {
      this.view.down("[name=cross_rate]").setValue(1);
    } else {
      this.view
        .down("[name=cross_rate]")
        .setValue(this.view.order_data.cross_rate);
    }
    if (this.getClientActionType() == "sell")
      this.calculateSellCrossRateAmount();
    else this.calculateCrossRateAmount();
  },

  setValues(data) {
    this.buildPanels(
      this.view.config.order_data,
      "our_payout_amount_panel",
      this.view.config.order_data._client_action_type == "sell"
        ? "client_amount"
        : "our_rate_amount"
    );
    this.callParent(arguments);
  },
  getHashesFields() {
    return this._getHashesFields("our_payout_amount_panel");
  },
  getTransfersFields() {
    return this._getTransfersFields("our_payout_amount_panel");
  },

  async calculateOurProfit() {
    let fields_values = {};
    let data = await this.getOrderFieldsData([
      "client_amount",
      "our_rate_amount"
    ]);
    data = data.fields_data;
    if (!this.checkIfObjectValid(data)) return;
    fields_values["our_profit"] = data.client_amount - data.our_rate_amount;
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
    fields_values[
      "client_amount_before_charges"
    ] = await this.selectAmountFormula(data, "client");
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
    fields_values["client_amount"] =
      data.client_amount_before_charges +
      (data.delivery_fee_after_cross || 0) +
      (data.swap_fee || 0);
    this.saveOrderData(fields_values);
    await this.calculateOurProfit();
    return;
  },

  async calculateOurAmountBeforeCharges() {
    let fields_values = {};
    let data = await this.getOrderFieldsData(["cross_rate_amount", "our_rate"]);
    data = data.fields_data;
    if (!this.checkIfObjectValid(data)) return;
    fields_values[
      "our_rate_amount_before_charges"
    ] = await this.selectAmountFormula(data, "our");
    this.saveOrderData(fields_values);
    await this.calculateOurAmount();
    return;
  },

  async calculateOurAmount() {
    let fields_values = {};
    let data = await this.getOrderFieldsData([
      "our_rate_amount_before_charges",
      "delivery_fee_after_cross",
      "swap_fee"
    ]);
    data = data.fields_data;
    let controlling_object = {
      our_rate_amount_before_charges: data.our_rate_amount_before_charges
    };
    if (!this.checkIfObjectValid(controlling_object)) return;
    fields_values["our_rate_amount"] =
      data.our_rate_amount_before_charges +
      (data.delivery_fee_after_cross || 0) +
      (data.swap_fee || 0);
    this.saveOrderData(fields_values);
    await this.calculateOurProfit();
    return;
  },

  async calculateSellCrossRateAmount() {
    let fields_values = {};
    let data = await this.getOrderFieldsData(["client_amount", "cross_rate"]);
    data = data.fields_data;
    if (!this.checkIfObjectValid(data)) return;
    fields_values["cross_rate_amount"] = data.client_amount * data.cross_rate;
    this.saveOrderData(fields_values);
    return;
  },

  async calculateSellClientAmountBeforeCharges() {
    let fields_values = {};
    let data = await this.getOrderFieldsData(["order_amount", "client_rate"]);
    data = data.fields_data;
    if (!this.checkIfObjectValid(data)) return;
    fields_values[
      "client_amount_before_charges"
    ] = await this.selectAmountFormula(data, "client");

    this.saveOrderData(fields_values);
    await this.calculateSellClientAmount();
    return;
  },

  async calculateSellClientAmount() {
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
    fields_values["client_amount"] =
      data.client_amount_before_charges -
      (data.delivery_fee_after_cross || 0) -
      (data.swap_fee || 0);

    this.saveOrderData(fields_values);
    await this.calculateSellCrossRateAmount();
    await this.calculateSellOurProfit();
    return;
  },

  async calculateSellOurAmountBeforeCharges() {
    let fields_values = {};
    let data = await this.getOrderFieldsData(["order_amount", "our_rate"]);
    data = data.fields_data;
    if (!this.checkIfObjectValid(data)) return;
    fields_values[
      "our_rate_amount_before_charges"
    ] = await this.selectAmountFormula(data, "our");
    this.saveOrderData(fields_values);
    await this.calculateSellOurAmount();
    return;
  },

  async calculateSellOurAmount() {
    let fields_values = {};
    let data = await this.getOrderFieldsData([
      "our_rate_amount_before_charges",
      "delivery_fee_after_cross",
      "swap_fee"
    ]);
    data = data.fields_data;
    let controlling_object = {
      our_rate_amount_before_charges: data.our_rate_amount_before_charges
    };
    if (!this.checkIfObjectValid(controlling_object)) return;
    fields_values["our_rate_amount"] =
      data.our_rate_amount_before_charges -
      (data.delivery_fee_after_cross || 0) -
      (data.swap_fee || 0);
    this.saveOrderData(fields_values);
    await this.calculateSellOurProfit();
    return;
  },

  async calculateSellOurProfit() {
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

  getClientActionType() {
    return this.view.down("[name=client_action_type]").getValue();
  },

  async selectAmountFormula(data, which_rate) {
    let selectors = await this.getOrderFieldsData([
      "client_action_type",
      "which_percent_bigger",
      "formula"
    ]);
    selectors = selectors.fields_data;
    if (selectors.client_action_type == "buy") {
      if (selectors.which_percent_bigger == "our")
        return (
          (data.cross_rate_amount / 100) *
          (100 - (which_rate == "client" ? data.client_rate : data.our_rate))
        );
      if (selectors.formula == "amountmulrate")
        return (
          data.cross_rate_amount +
          data.cross_rate_amount *
            ((which_rate == "client" ? data.client_rate : data.our_rate) / 100)
        );
      if (selectors.formula == "amountmulhundreddelrate")
        return (
          (data.cross_rate_amount * 100) /
          (100 - (which_rate == "client" ? data.client_rate : data.our_rate))
        );
      return 0;
    }
    if (selectors.client_action_type == "sell") {
      return (
        (data.order_amount *
          (100 - (which_rate == "client" ? data.client_rate : data.our_rate))) /
        100
      );
    }
  }
});
