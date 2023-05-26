Ext.define("Crm.modules.orders.view.orderTypes.StartFinalController", {
  extend: "Crm.modules.orders.view.orderTypes.BaseTypesController",

  mixins: [
    "Crm.modules.orders.view.FieldsHelper",
    "Crm.modules.orders.view.orderTypes.CryptoFiatFunctions"
  ],

  setControls() {
    let me = this;
    this.control({
      "[name=order_subtype]": {
        change: (el, v) => {
          this.view.down("[name=_order_subtype]").setValue(v);
          this.sortCurrenciesStores(v);
          this.setLogicAccordingToOrderSubtype(v);
          this.calculateOurNettoProfit();
        }
      },
      "[name=from_usdt_start_recalculation]": {
        change: (el, v) => {
          if (v) {
            this.view.down("[name=_recalculation]").setValue(v);
            this.setFieldsVisibilityForFromUsdtRecalculation(v);
            this.sortCurrenciesStores();
            this.calculateOurNettoProfit();
          }
        }
      },
      "[name=to_usdt_final_recalculation]": {
        change: (el, v) => {
          if (v) {
            this.view.down("[name=_recalculation]").setValue(v);
            this.setFieldsVisibilityForToUsdtRecalculation(v);
            this.sortCurrenciesStores();
            this.calculateOurNettoProfit();
          }
        }
      },
      "[name=from_currency]": {
        change: (el, v, oldv) => {
          if (v) this.setCurrencies("from_currency");
        }
      },
      "[name=to_currency]": {
        change: (el, v, oldv) => {
          if (v) this.setCurrencies("to_currency");
        }
      },
      "[name=recalc_to_currency]": {
        change: (el, v, oldv) => {
          if (v) this.setCurrencies("recalc_to_currency");
        }
      },
      "[action=add_charge]": {
        click: () => {
          this.addChargeField(this.getCurrencyForPanels());
        }
      },
      "[action=add_payout_amount]": {
        click: () => {
          this.addPayoutField(
            "payout_amount_panel",
            this.getPayoutAmountField(),
            this.getCurrencyForPanels()
          );
        }
      },
      "[name=order_amount]": {
        blur: () => {
          this.calculateFieldsData();
        }
      },
      "[name=cross_rate]": {
        blur: () => {
          this.calculateFieldsData();
        }
      },
      "[name=our_rate]": {
        blur: () => {
          this.calculateFieldsData();
        }
      },
      "[name=client_rate]": {
        blur: () => {
          this.calculateFieldsData();
        }
      },
      "[name=delivery_fee]": {
        blur: () => {
          this.calculateFieldsData();
        }
      },
      "[name=recalc_cross_rate]": {
        blur: () => {
          this.calculateRecalcFieldsData();
        }
      },
      "[name=recalc_our_rate]": {
        blur: () => {
          this.calculateRecalcFieldsData();
        }
      },
      "[name=recalc_client_rate]": {
        blur: () => {
          this.calculateRecalcFieldsData();
        }
      },
      "[name=recalc_delivery_fee]": {
        blur: () => {
          this.calculateRecalcFieldsData();
        }
      },
      "[name=swap_fee]": {
        blur: () => {
          this.doPostChargesCalculation();
        }
      },
      "[name=our_profit]": {
        change: () => {
          this.calculateOurNettoProfit();
        }
      },
      "[name=recalc_our_profit]": {
        change: () => {
          this.calculateOurNettoProfit();
        }
      },

      "[name=is_penalty]": {
        change: (el, v) => {
          this.setPenaltyVisibility(v);
          this.calculateOurNettoProfit();
        }
      },
      "[name=client_penalty]": {
        blur: () => {
          this.calculateOurNettoProfit();
        }
      },
      "[name=platform_penalty]": {
        blur: () => {
          this.calculateOurNettoProfit();
        }
      }
    });
    this.setDefaultSelectors();
    return this.callParent(arguments);
  },
  setPenaltyVisibility(value) {
    this.view.down("[name=client_penalty]").setVisible(value);
    this.view.down("[name=client_penalty_currency]").setVisible(value);
    this.view.down("[name=platform_penalty]").setVisible(value);
    this.view.down("[name=platform_penalty_currency]").setVisible(value);
    this.view
      .down("[name=client_penalty]")
      .setValue(this.view.config.order_data.client_penalty);
    this.view
      .down("[name=platform_penalty]")
      .setValue(this.view.config.order_data.platform_penalty);
  },
  getPayoutAmountField() {
    let suborder = this.view.down("[name=order_subtype]").getValue(),
      recalculation = this.view.down("[name=_recalculation]").getValue(),
      payout_field_name = "";

    switch (suborder) {
      case "to_usdt_final":
      case "to_usdt_start": {
        payout_field_name = "amount_to_client";
        if (suborder == "to_usdt_start" && recalculation == "from_usdt_start")
          payout_field_name = "recalc_amount_to_platform";
        break;
      }
      case "from_usdt_final":
      case "from_usdt_start": {
        payout_field_name = "amount_to_platform";
        break;
      }
      default: {
        break;
      }
    }
    return payout_field_name;
  },
  getCurrencyForPanels() {
    let suborder = this.view.down("[name=order_subtype]").getValue(),
      field_name = "";

    switch (suborder) {
      case "to_usdt_final": {
        field_name = "from_currency";
        break;
      }
      case "to_usdt_start": {
        field_name = "to_currency";
        break;
      }
      case "from_usdt_final": {
        field_name = "to_currency";
        break;
      }
      case "from_usdt_start": {
        field_name = "from_currency";
        break;
      }
      default: {
        break;
      }
    }
    return field_name;
  },
  setCurrencies(currency_field_name) {
    const currency = this.view.down(`[name=${currency_field_name}]`).getValue(),
      suborder = this.view.down("[name=order_subtype]").getValue(),
      recalculation = this.view.down("[name=_recalculation]").getValue(),
      fields = [];

    switch (currency_field_name) {
      case "recalc_to_currency": {
        switch (suborder) {
          case "to_usdt_start": {
            if (recalculation == "from_usdt_start")
              fields.push(
                "recalc_delivery_fee_currency",
                "recalc_amount_to_client_currency",
                "recalc_amount_from_platform_currency"
              );
            break;
          }
          case "from_usdt_final": {
            if (recalculation == "to_usdt_final")
              fields.push(
                "recalc_delivery_fee_currency",
                "recalc_amount_from_client_currency",
                "recalc_amount_to_platform_currency"
              );
            break;
          }
        }
        break;
      }
      case "from_currency": {
        switch (suborder) {
          case "to_usdt_final": {
            fields.push(
              "delivery_fee_after_cross_currency",
              "our_profit_currency",
              "our_netto_profit_currency",
              "amount_to_client_currency",
              "amount_from_platform_currency",
              "client_penalty_currency",
              "platform_penalty_currency"
            );
            this.setChargeCurrencies("from_currency");
            this.setPayoutCurrencies("payout_amount_panel", "from_currency");
            break;
          }
          case "to_usdt_start": {
            fields.push(
              "delivery_fee_currency",
              "amount_from_client_currency",
              "amount_to_platform_currency"
            );
            break;
          }
          case "from_usdt_final": {
            fields.push(
              "delivery_fee_currency",
              "amount_to_client_currency",
              "amount_from_platform_currency"
            );
            break;
          }
          case "from_usdt_start": {
            fields.push(
              "delivery_fee_after_cross_currency",
              "our_profit_currency",
              "our_netto_profit_currency",
              "amount_from_client_currency",
              "amount_to_platform_currency",
              "client_penalty_currency",
              "platform_penalty_currency"
            );
            this.setChargeCurrencies("from_currency");
            this.setPayoutCurrencies("payout_amount_panel", "from_currency");
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      case "to_currency": {
        switch (suborder) {
          case "to_usdt_final": {
            fields.push(
              "delivery_fee_currency",
              "amount_from_client_currency",
              "amount_to_platform_currency"
            );
            break;
          }
          case "to_usdt_start": {
            fields.push(
              "delivery_fee_after_cross_currency",
              "our_profit_currency",
              "our_netto_profit_currency",
              "amount_to_client_currency",
              "amount_from_platform_currency"
            );
            if (recalculation == "from_usdt_start")
              fields.push(
                "recalc_delivery_fee_after_cross_currency",
                "recalc_amount_from_client_currency",
                "recalc_amount_to_platform_currency",
                "recalc_our_profit_currency",
                "recalc_our_netto_profit_currency",
                "client_penalty_currency",
                "platform_penalty_currency"
              );
            this.setChargeCurrencies("to_currency");
            this.setPayoutCurrencies("payout_amount_panel", "to_currency");
            break;
          }
          case "from_usdt_final": {
            fields.push(
              "delivery_fee_after_cross_currency",
              "our_profit_currency",
              "our_netto_profit_currency",
              "amount_from_client_currency",
              "amount_to_platform_currency"
            );
            if (recalculation == "to_usdt_final")
              fields.push(
                "recalc_delivery_fee_after_cross_currency",
                "recalc_amount_to_client_currency",
                "recalc_amount_from_platform_currency",
                "recalc_our_profit_currency",
                "recalc_our_netto_profit_currency",
                "client_penalty_currency",
                "platform_penalty_currency"
              );
            this.setChargeCurrencies("to_currency");
            this.setPayoutCurrencies("payout_amount_panel", "to_currency");
            break;
          }
          case "from_usdt_start": {
            fields.push(
              "delivery_fee_currency",
              "amount_to_client_currency",
              "amount_from_platform_currency"
            );
            break;
          }
          default: {
            break;
          }
        }
        break;
      }
      default: {
        return;
      }
    }

    for (let field of fields)
      if (this.view.down(`[name=${field}]`))
        this.view.down(`[name=${field}]`).setValue(currency);
  },

  setRecalcFieldsValues() {
    const order_data = this.view.config.order_data;
    for (let field_name of Object.keys(order_data))
      if (field_name.includes("recalc_"))
        this.view.down(`[name=${field_name}]`).setValue(order_data[field_name]);
    return;
  },

  clearRecalcPanels() {
    const from_usdt_start_panel = this.view.down(
        "[name=from_usdt_start_panel]"
      ),
      to_usdt_final_panel = this.view.down("[name=to_usdt_final_panel]");

    while (from_usdt_start_panel.items.items[0]) {
      from_usdt_start_panel.remove(from_usdt_start_panel.items.items[0]);
    }
    while (to_usdt_final_panel.items.items[0]) {
      to_usdt_final_panel.remove(to_usdt_final_panel.items.items[0]);
    }
    return;
  },

  async setFieldsVisibilityForFromUsdtRecalculation(v) {
    const display = v == "from_usdt_start",
      from_usdt_start_panel = this.view.down("[name=from_usdt_start_panel]");
    from_usdt_start_panel.setVisible(display);

    this.clearRecalcPanels();

    if (display) {
      from_usdt_start_panel.add(this.view.recalculationFieldsData());
      this.applyClsToFields(
        ["recalc_amount_to_client", "recalc_amount_to_platform"],
        "editable-system-fields"
      );
      this.applyClsToFields(
        ["recalc_amount_from_client", "recalc_amount_from_platform"],
        "system-fields"
      );
      this.setRecalcFieldsValues();
    }

    this.setCurrencies("from_currency");
    this.setCurrencies("to_currency");
    await this.calculateRecalcFieldsData();
  },

  async setFieldsVisibilityForToUsdtRecalculation(v) {
    const display = v == "to_usdt_final",
      to_usdt_final_panel = this.view.down("[name=to_usdt_final_panel]");

    to_usdt_final_panel.setVisible(display);

    this.clearRecalcPanels();

    if (display) {
      to_usdt_final_panel.add(this.view.recalculationFieldsData());
      this.applyClsToFields(
        ["recalc_amount_from_client", "recalc_amount_to_platform"],
        "editable-system-fields"
      );
      this.applyClsToFields(
        ["recalc_amount_to_client", "recalc_amount_from_platform"],
        "system-fields"
      );
      this.setRecalcFieldsValues();
    }

    this.setCurrencies("from_currency");
    this.setCurrencies("to_currency");
    await this.calculateRecalcFieldsData();
  },

  async setLogicAccordingToOrderSubtype(v) {
    const from_usdt_start_recalculation = this.view.down(
        "[name=from_usdt_start_recalculation]"
      ),
      to_usdt_final_recalculation = this.view.down(
        "[name=to_usdt_final_recalculation]"
      ),
      recalculation_state = this.view.down("[name=_recalculation]").getValue();
    from_usdt_start_recalculation.setVisible(false);
    to_usdt_final_recalculation.setVisible(false);
    this.view.down("[name=from_usdt_start_panel]").setVisible(false);
    this.view.down("[name=to_usdt_final_panel]").setVisible(false);
    switch (v) {
      case "to_usdt_start": {
        from_usdt_start_recalculation.setVisible(true);
        from_usdt_start_recalculation.setValue(
          recalculation_state == "from_usdt_start"
            ? recalculation_state
            : "none"
        );
        this.setFieldsVisibilityForFromUsdtRecalculation(recalculation_state);
        this.applyClsToFields(
          ["amount_to_client", "amount_from_platform"],
          "editable-system-fields"
        );
        this.applyClsToFields(
          ["amount_from_client", "amount_to_platform"],
          "system-fields"
        );
        await this.calculateToUsdtStart();
        break;
      }
      case "from_usdt_final": {
        to_usdt_final_recalculation.setVisible(true);
        to_usdt_final_recalculation.setValue(
          recalculation_state == "to_usdt_final" ? recalculation_state : "none"
        );
        this.setFieldsVisibilityForToUsdtRecalculation(recalculation_state);
        this.applyClsToFields(
          ["amount_from_client", "amount_to_platform"],
          "editable-system-fields"
        );
        this.applyClsToFields(
          ["amount_to_client", "amount_from_platform"],
          "system-fields"
        );
        await this.calculateFromUsdtFinal();
        break;
      }
      case "to_usdt_final": {
        this.applyClsToFields(
          ["amount_from_client", "amount_to_platform"],
          "editable-system-fields"
        );
        this.applyClsToFields(
          ["amount_to_client", "amount_from_platform"],
          "system-fields"
        );
        await this.calculateToUsdtFinal();
        break;
      }
      case "from_usdt_start": {
        this.applyClsToFields(
          ["amount_to_client", "amount_to_platform"],
          "editable-system-fields"
        );
        this.applyClsToFields(
          ["amount_from_client", "amount_from_platform"],
          "system-fields"
        );
        await this.calculateFromUsdtStart();
        break;
      }
      default: {
        break;
      }
    }
  },

  applyClsToFields(fields, cls) {
    for (let field_name of fields) {
      let field = this.view.down(`[name=${field_name}]`);
      if (cls == "system-fields") field.setReadOnly(true);
      else field.setReadOnly(false);
      field.removeCls(field.cls);
      field.addCls(cls);
    }
  },

  setDefaultSelectors() {
    const data = this.view.config.order_data,
      order_subtype = this.view.down("[name=order_subtype]");

    if (data._order_subtype) order_subtype.setValue(data._order_subtype);
    else order_subtype.setValue("to_usdt_final");
  },
  async replaceCurrencies(currency_from, currency_to) {
    let from_currency_field = this.view.down(`[name=${currency_from.field}]`),
      to_currency_field = this.view.down(`[name=${currency_to.field}]`),
      from_currency = from_currency_field.getValue(),
      to_currency = to_currency_field.getValue(),
      currencies_list = await this.model.callServerMethod("getCurrenciesList"),
      found_from_currency = currencies_list.find((el) => {
        return el.abbr == from_currency;
      }),
      found_to_currency = currencies_list.find((el) => {
        return el.abbr == to_currency;
      });

    if (
      (currency_from.type == "crypto" && found_to_currency.crypto) ||
      (currency_from.type == "fiat" && !found_to_currency.crypto)
    ) {
      from_currency_field.setValue(found_to_currency.abbr);
    }

    if (
      (currency_to.type == "crypto" && found_from_currency.crypto) ||
      (currency_to.type == "fiat" && !found_from_currency.crypto)
    ) {
      to_currency_field.setValue(found_from_currency.abbr);
    }
  },

  async sortCurrenciesStores(subtype) {
    if (subtype)
      switch (subtype) {
        case "to_usdt_final":
        case "from_usdt_start": {
          await this.sortCurrenciesByCommonUsed("from_currency", "crypto");
          await this.sortCurrenciesByCommonUsed("to_currency", "fiat");
          await this.replaceCurrencies(
            { field: "from_currency", type: "crypto" },
            { field: "to_currency", type: "fiat" }
          );
          break;
        }
        case "from_usdt_final":
        case "to_usdt_start": {
          await this.sortCurrenciesByCommonUsed("from_currency", "fiat");
          await this.sortCurrenciesByCommonUsed("to_currency", "crypto");
          await this.replaceCurrencies(
            { field: "from_currency", type: "fiat" },
            { field: "to_currency", type: "crypto" }
          );
          break;
        }
        default: {
          break;
        }
      }
    if (this.view.down("[name=recalc_to_currency]"))
      await this.sortCurrenciesByCommonUsed("recalc_to_currency", "fiat");
  },
  setValues(data) {
    this.buildPanels(
      this.view.config.order_data,
      "payout_amount_panel",
      this.getPayoutAmountField()
    );
    this.callParent(arguments);
  },
  getHashesFields() {
    return this._getHashesFields("payout_amount_panel");
  },

  getTransfersFields() {
    return this._getTransfersFields("payout_amount_panel");
  },

  async doPostChargesCalculation() {
    this.calculateClientAmount();
    this.calculateOurAmount();
    return;
  },

  async checkRequiredDataBeforeCalculations(fields) {
    if (!fields)
      fields = ["order_amount", "cross_rate", "client_rate", "our_rate"];
    let data = await this.getOrderFieldsData(fields);
    return this.checkIfObjectValid(data.fields_data);
  },

  async calculateFieldsData() {
    switch (this.view.down("[name=_order_subtype]").getValue()) {
      case "to_usdt_final":
        return await this.calculateToUsdtFinal();
      case "from_usdt_final":
        return await this.calculateFromUsdtFinal();
      case "to_usdt_start":
        return await this.calculateToUsdtStart();
      case "from_usdt_start":
        return await this.calculateFromUsdtStart();
    }
  },

  async calculateRecalcFieldsData() {
    switch (this.view.down("[name=_recalculation]").getValue()) {
      case "to_usdt_final": {
        await this.calculateRecalcToUsdtFinal();
        break;
      }
      case "from_usdt_start": {
        await this.calculateRecalcFromUsdtStart();
        break;
      }
    }
  },

  async calculateRecalcFromUsdtStart() {
    if (
      !(await this.checkRequiredDataBeforeCalculations([
        "amount_to_client",
        "recalc_cross_rate",
        "recalc_client_rate",
        "recalc_our_rate"
      ]))
    )
      return;
    await this.calculateRecalcCrossDeliveryFee();
    await this.calculateRecalcClientAmount();
    await this.calculateRecalcReceivedClientAmount();
    await this.calculateRecalcFromPlatformAmount();
    await this.calculateRecalcPlatformAmount();
    await this.calculateRecalcProfit();
  },

  async calculateRecalcToUsdtFinal() {
    if (
      !(await this.checkRequiredDataBeforeCalculations([
        "amount_from_client",
        "recalc_cross_rate",
        "recalc_client_rate",
        "recalc_our_rate"
      ]))
    )
      return;
    await this.calculateRecalcCrossDeliveryFee();
    await this.calculateRecalcClientAmount();
    await this.calculateRecalcReceivedClientAmount();
    await this.calculateRecalcPlatformAmount();
    await this.calculateRecalcFromPlatformAmount();
    await this.calculateRecalcProfit();
  },

  async calculateToUsdtFinal() {
    if (!(await this.checkRequiredDataBeforeCalculations())) return;
    await this.calculateCrossDeliveryFee();
    await this.calculateClientAmount();
    await this.calculateReceivedClientAmount();
    await this.calculatePlatformAmount();
    await this.calculateFromPlatformAmount();
    await this.calculateProfit();
  },

  async calculateFromUsdtFinal() {
    if (!(await this.checkRequiredDataBeforeCalculations())) return;
    await this.calculateCrossDeliveryFee();
    await this.calculateClientAmount();
    await this.calculateReceivedClientAmount();
    await this.calculatePlatformAmount();
    await this.calculateFromPlatformAmount();
    await this.calculateProfit();

    if (this.view.down("[name=_recalculation]").getValue() == "to_usdt_final")
      return await this.calculateRecalcToUsdtFinal();
  },

  async calculateToUsdtStart() {
    if (!(await this.checkRequiredDataBeforeCalculations())) return;
    await this.calculateCrossDeliveryFee();
    await this.calculateClientAmount();
    await this.calculateReceivedClientAmount();
    await this.calculatePlatformAmount();
    await this.calculateFromPlatformAmount();
    await this.calculateProfit();

    if (this.view.down("[name=_recalculation]").getValue() == "from_usdt_start")
      return await this.calculateRecalcFromUsdtStart();
  },

  async calculateFromUsdtStart() {
    if (!(await this.checkRequiredDataBeforeCalculations())) return;
    await this.calculateCrossDeliveryFee();
    await this.calculateClientAmount();
    await this.calculateReceivedClientAmount();
    await this.calculateFromPlatformAmount();
    await this.calculatePlatformAmount();
    await this.calculateProfit();
  },

  async calculateCrossDeliveryFee() {
    let fields_values = {},
      data = await this.getOrderFieldsData(["delivery_fee", "cross_rate"]);

    data = data.fields_data;

    if (!data.delivery_fee) data.delivery_fee = 0;

    if (!this.checkIfObjectValid(data)) return;
    fields_values["delivery_fee_after_cross"] =
      data.delivery_fee / data.cross_rate;

    return this.saveOrderData(fields_values);
  },

  async calculateClientAmount() {
    let fields_values = {},
      fields = [],
      order_subtype = this.view.down("[name=_order_subtype]").getValue();

    switch (order_subtype) {
      case "to_usdt_final":
      case "from_usdt_final": {
        fields = ["order_amount"];
        break;
      }
      case "to_usdt_start":
      case "from_usdt_start": {
        fields = ["order_amount", "cross_rate", "our_rate", "delivery_fee"];
        break;
      }
    }

    let data = await this.getOrderFieldsData(fields);
    data = data.fields_data;

    if (!data.delivery_fee) data.delivery_fee = 0;

    if (!this.checkIfObjectValid(data)) return;

    switch (order_subtype) {
      case "to_usdt_final":
      case "from_usdt_final": {
        fields_values["amount_to_client"] = data.order_amount;
        break;
      }
      case "to_usdt_start": {
        fields_values["amount_to_client"] =
          (data.order_amount * (1 + data.our_rate / 100) - data.delivery_fee) /
          data.cross_rate;
        break;
      }
      case "from_usdt_start": {
        fields_values["amount_to_client"] =
          data.order_amount * (1 + data.our_rate / 100) * data.cross_rate -
          data.delivery_fee;
        break;
      }
    }

    this.saveOrderData(fields_values);
    return;
  },

  async calculateReceivedClientAmount() {
    let fields_values = {},
      fields = [],
      order_subtype = this.view.down("[name=_order_subtype]").getValue();

    switch (order_subtype) {
      case "to_usdt_final":
      case "from_usdt_final": {
        fields = ["order_amount", "cross_rate", "our_rate", "delivery_fee"];
        break;
      }
      case "to_usdt_start":
      case "from_usdt_start": {
        fields = ["order_amount"];
        break;
      }
    }

    let data = await this.getOrderFieldsData(fields);
    data = data.fields_data;

    if (!data.delivery_fee) data.delivery_fee = 0;

    if (!this.checkIfObjectValid(data)) return;

    switch (order_subtype) {
      case "to_usdt_final": {
        fields_values["amount_from_client"] =
          (data.order_amount * data.cross_rate + data.delivery_fee) /
          (1 + data.our_rate / 100);
        break;
      }
      case "from_usdt_final": {
        fields_values["amount_from_client"] =
          (data.order_amount + data.delivery_fee) /
          ((1 + data.our_rate / 100) * data.cross_rate);
        break;
      }
      case "to_usdt_start":
      case "from_usdt_start": {
        fields_values["amount_from_client"] = data.order_amount;
        break;
      }
    }

    this.saveOrderData(fields_values);
    return;
  },

  async calculatePlatformAmount() {
    let fields_values = {},
      fields = [],
      order_subtype = this.view.down("[name=_order_subtype]").getValue();

    switch (order_subtype) {
      case "to_usdt_final":
      case "from_usdt_final": {
        fields = ["order_amount", "cross_rate", "client_rate", "delivery_fee"];
        break;
      }
      case "to_usdt_start": {
        fields = ["order_amount"];
        break;
      }
      case "from_usdt_start": {
        fields = [
          "cross_rate",
          "client_rate",
          "delivery_fee",
          "amount_from_platform"
        ];
        break;
      }
    }

    let data = await this.getOrderFieldsData(fields);
    data = data.fields_data;

    if (!data.delivery_fee) data.delivery_fee = 0;

    if (!this.checkIfObjectValid(data)) return;

    switch (order_subtype) {
      case "to_usdt_final": {
        fields_values["amount_to_platform"] =
          (data.order_amount * data.cross_rate + data.delivery_fee) /
          (1 + data.client_rate / 100);
        break;
      }
      case "from_usdt_final": {
        fields_values["amount_to_platform"] =
          (data.order_amount + data.delivery_fee) /
          ((1 + data.client_rate / 100) * data.cross_rate);
        break;
      }
      case "to_usdt_start": {
        fields_values["amount_to_platform"] = data.order_amount;
        break;
      }
      case "from_usdt_start": {
        fields_values["amount_to_platform"] =
          (data.amount_from_platform + data.delivery_fee) /
          ((1 + data.client_rate / 100) * data.cross_rate);
        break;
      }
    }

    this.saveOrderData(fields_values);
    return;
  },

  async calculateFromPlatformAmount() {
    let fields_values = {},
      fields = [],
      order_subtype = this.view.down("[name=_order_subtype]").getValue();

    switch (order_subtype) {
      case "to_usdt_final":
      case "from_usdt_final": {
        fields = ["order_amount"];
        break;
      }
      case "to_usdt_start": {
        fields = ["order_amount", "cross_rate", "client_rate", "delivery_fee"];
        break;
      }
      case "from_usdt_start": {
        fields = ["amount_to_client"];
        break;
      }
    }

    let data = await this.getOrderFieldsData(fields);
    data = data.fields_data;

    if (!data.delivery_fee) data.delivery_fee = 0;

    if (!this.checkIfObjectValid(data)) return;

    switch (order_subtype) {
      case "to_usdt_final":
      case "from_usdt_final": {
        fields_values["amount_from_platform"] = data.order_amount;
        break;
      }
      case "to_usdt_start": {
        fields_values["amount_from_platform"] =
          (data.order_amount * (1 + data.client_rate / 100) -
            data.delivery_fee) /
          data.cross_rate;
        break;
      }
      case "from_usdt_start": {
        fields_values["amount_from_platform"] = data.amount_to_client;
        break;
      }
    }
    this.saveOrderData(fields_values);
    return;
  },

  async calculateProfit() {
    let fields_values = {},
      fields = [],
      order_subtype = this.view.down("[name=_order_subtype]").getValue();

    switch (order_subtype) {
      case "to_usdt_final": {
        fields = ["amount_to_platform", "amount_from_client", "cross_rate"];
        break;
      }
      case "to_usdt_start": {
        fields = ["amount_to_client", "amount_from_platform"];
        break;
      }
      case "from_usdt_start":
      case "from_usdt_final": {
        fields = ["amount_to_platform", "amount_from_client"];
        break;
      }
    }

    let data = await this.getOrderFieldsData(fields);
    data = data.fields_data;
    if (!this.checkIfObjectValid(data)) return;

    switch (order_subtype) {
      case "to_usdt_final": {
        fields_values["our_profit"] =
          (data.amount_from_client - data.amount_to_platform) * data.cross_rate;
        break;
      }
      case "from_usdt_final": {
        fields_values["our_profit"] =
          data.amount_from_client - data.amount_to_platform;
        break;
      }
      case "to_usdt_start": {
        fields_values["our_profit"] =
          data.amount_from_platform - data.amount_to_client;
        break;
      }
      case "from_usdt_final":
      case "from_usdt_start": {
        fields_values["our_profit"] =
          data.amount_from_client - data.amount_to_platform;
        break;
      }
    }
    this.saveOrderData(fields_values);
    return;
  },

  async calculateRecalcCrossDeliveryFee() {
    let fields_values = {},
      data = await this.getOrderFieldsData([
        "recalc_delivery_fee",
        "recalc_cross_rate"
      ]);

    data = data.fields_data;

    if (!data.recalc_delivery_fee) data.recalc_delivery_fee = 0;

    if (!this.checkIfObjectValid(data)) return;
    fields_values["recalc_delivery_fee_after_cross"] =
      data.recalc_delivery_fee / data.recalc_cross_rate;

    return this.saveOrderData(fields_values);
  },

  async calculateRecalcClientAmount() {
    let fields_values = {},
      fields = [],
      recalculation = this.view.down("[name=_recalculation]").getValue();

    if (recalculation.toLowerCase() == "none") return;

    switch (recalculation) {
      case "from_usdt_start": {
        fields = [
          "amount_to_client",
          "recalc_cross_rate",
          "recalc_our_rate",
          "recalc_delivery_fee"
        ];
        break;
      }
      case "to_usdt_final": {
        fields = ["amount_from_client"];
        break;
      }
    }

    let data = await this.getOrderFieldsData(fields);
    data = data.fields_data;

    if (!data.recalc_delivery_fee) data.recalc_delivery_fee = 0;

    if (!this.checkIfObjectValid(data)) return;

    switch (recalculation) {
      case "from_usdt_start": {
        fields_values["recalc_amount_to_client"] =
          data.amount_to_client *
            (1 + data.recalc_our_rate / 100) *
            data.recalc_cross_rate -
          data.recalc_delivery_fee;
        break;
      }
      case "to_usdt_final": {
        fields_values["recalc_amount_to_client"] = data.amount_from_client;
        break;
      }
    }

    this.saveOrderData(fields_values);
    return;
  },

  async calculateRecalcReceivedClientAmount() {
    let fields_values = {},
      fields = [],
      recalculation = this.view.down("[name=_recalculation]").getValue();

    if (recalculation.toLowerCase() == "none") return;

    switch (recalculation) {
      case "from_usdt_start": {
        fields = ["amount_to_client"];
        break;
      }
      case "to_usdt_final": {
        fields = [
          "amount_from_client",
          "recalc_cross_rate",
          "recalc_our_rate",
          "recalc_delivery_fee"
        ];
        break;
      }
      case "to_usdt_start":
    }

    let data = await this.getOrderFieldsData(fields);
    data = data.fields_data;

    if (!data.recalc_delivery_fee) data.recalc_delivery_fee = 0;

    if (!this.checkIfObjectValid(data)) return;

    switch (recalculation) {
      case "from_usdt_start": {
        fields_values["recalc_amount_from_client"] = data.amount_to_client;
        break;
      }
      case "to_usdt_final": {
        fields_values["recalc_amount_from_client"] =
          (data.amount_from_client * data.recalc_cross_rate +
            data.recalc_delivery_fee) /
          (1 + data.recalc_our_rate / 100);
        break;
      }
    }

    this.saveOrderData(fields_values);
    return;
  },

  async calculateRecalcPlatformAmount() {
    let fields_values = {},
      fields = [],
      recalculation = this.view.down("[name=_recalculation]").getValue();

    if (recalculation.toLowerCase() == "none") return;

    switch (recalculation) {
      case "from_usdt_start": {
        fields = [
          "recalc_cross_rate",
          "recalc_client_rate",
          "recalc_delivery_fee",
          "recalc_amount_from_platform"
        ];
        break;
      }
      case "to_usdt_final": {
        fields = [
          "amount_from_client",
          "recalc_cross_rate",
          "recalc_client_rate",
          "recalc_delivery_fee"
        ];
        break;
      }
    }

    let data = await this.getOrderFieldsData(fields);
    data = data.fields_data;

    if (!data.recalc_delivery_fee) data.recalc_delivery_fee = 0;

    if (!this.checkIfObjectValid(data)) return;

    switch (recalculation) {
      case "from_usdt_start": {
        fields_values["recalc_amount_to_platform"] =
          (data.recalc_amount_from_platform + data.recalc_delivery_fee) /
          ((1 + data.recalc_client_rate / 100) * data.recalc_cross_rate);
        break;
      }
      case "to_usdt_final": {
        fields_values["recalc_amount_to_platform"] =
          (data.amount_from_client * data.recalc_cross_rate +
            data.recalc_delivery_fee) /
          (1 + data.recalc_client_rate / 100);
        break;
      }
    }

    this.saveOrderData(fields_values);
    return;
  },

  async calculateRecalcFromPlatformAmount() {
    let fields_values = {},
      fields = [],
      recalculation = this.view.down("[name=_recalculation]").getValue();

    if (recalculation.toLowerCase() == "none") return;

    switch (recalculation) {
      case "from_usdt_start": {
        fields = ["recalc_amount_to_client"];
        break;
      }
      case "to_usdt_final": {
        fields = ["amount_from_client"];
        break;
      }
    }

    let data = await this.getOrderFieldsData(fields);
    data = data.fields_data;
    if (!this.checkIfObjectValid(data)) return;

    switch (recalculation) {
      case "from_usdt_start": {
        fields_values["recalc_amount_from_platform"] =
          data.recalc_amount_to_client;
        break;
      }
      case "to_usdt_final": {
        fields_values["recalc_amount_from_platform"] = data.amount_from_client;
        break;
      }
    }
    this.saveOrderData(fields_values);
    return;
  },

  async calculateRecalcProfit() {
    let fields_values = {},
      fields = [],
      recalculation = this.view.down("[name=_recalculation]").getValue();

    if (recalculation.toLowerCase() == "none") return;

    switch (recalculation) {
      case "from_usdt_start": {
        fields = ["recalc_amount_to_platform", "recalc_amount_from_client"];
        break;
      }
      case "to_usdt_final": {
        fields = [
          "recalc_amount_to_platform",
          "recalc_amount_from_client",
          "recalc_cross_rate"
        ];
        break;
      }
    }

    let data = await this.getOrderFieldsData(fields);
    data = data.fields_data;
    if (!this.checkIfObjectValid(data)) return;

    switch (recalculation) {
      case "from_usdt_start": {
        fields_values["recalc_our_profit"] =
          data.recalc_amount_from_client - data.recalc_amount_to_platform;
        break;
      }
      case "to_usdt_final": {
        fields_values["recalc_our_profit"] =
          (data.recalc_amount_from_client - data.recalc_amount_to_platform) *
          data.recalc_cross_rate;
        break;
      }
    }
    this.saveOrderData(fields_values);
    return;
  }
});
