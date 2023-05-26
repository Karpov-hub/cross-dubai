Ext.define("Crm.modules.orders.view.orderTypes.CardsWithWithdrawalController", {
  extend: "Crm.modules.orders.view.orderTypes.BaseTypesController",

  mixins: [
    "Crm.modules.orders.view.FieldsHelper",
    "Crm.modules.orders.view.orderTypes.CryptoFiatFunctions"
  ],

  to_currency_fields: [
    "to_currency_amount_tranche_currency",
    "client_amount_brutto_tranche_currency",
    "rate_delta_profit_tranche_currency",
    "fee_amount_tranche_currency",
    "client_amount_netto_tranche_currency",
    "total_tranche_profit_currency"
  ],

  setControls() {
    let me = this;
    this.control({
      "[name=from_currency]": {
        change: (el, v) => {
          if (v)
            me.model.updateExistedTranchesCurrencies(
              me.view.scope.down("[name=id]").getValue(),
              v,
              ["amount_tranche_currency"]
            );
        }
      },
      "[name=to_currency]": {
        change: (el, v) => {
          if (v) {
            this.setFieldsValue(me.view, v, [
              "total_client_payout_amount_currency",
              "agent_fee_amount_currency",
              "our_profit_currency"
            ]);
            me.model.updateExistedTranchesCurrencies(
              me.view.scope.down("[name=id]").getValue(),
              v,
              me.to_currency_fields
            );

            let visible = false;
            if (["USDT", "USTR"].includes(v)) visible = true;
            else visible = false;
            this.setChargeCurrencies();
            this.view.down("[name=agent_payout_currency]").setVisible(visible);
          }
        }
      },
      "[name=amount_tranche]": {
        change: (el, v) => {
          if (v < 0) this.setFieldsValue(me.view, 0, "amount_tranche");
        },
        blur: async (el, v) => {
          this.updateOrderData();
        }
      },
      "[name=delta]": {
        change: (el, v) => {
          if (v < 0) this.setFieldsValue(me.view, 0, "delta");
        },
        blur: async (el, v) => {
          this.updateOrderData();
        }
      },
      "[name=client_rate_tranche]": {
        change: (el, v) => {
          if (v < 0) this.setFieldsValue(me.view, 0, "client_rate_tranche");
        },
        blur: async (el, v) => {
          this.updateOrderData();
        }
      },
      "[name=fee_percent]": {
        change: (el, v) => {
          if (v < 0) this.setFieldsValue(me.view, 0, "fee_percent");
          this.setNewTrancheBtnState();
        },
        blur: () => {
          this.calculateOrderData();
        }
      },
      "[name=to_currency_amount_tranche_currency]": {
        change: (el, v) => {
          if (v) this.setFieldsValue(me.view, v, me.to_currency_fields);
        }
      },
      "[name=agent_part]": {
        blur: () => {
          this.calculateOrderData();
        }
      },
      "[name=agent_payout_currency]": {
        change: (el, v) => {
          this.handleAgentCurrency(v);
        }
      },
      "[name=received_from_swap]": {
        blur: () => {
          this.calculateOrderData();
        }
      },
      "[name=our_rate_tranche]": {
        change: (el, v) => {
          if (v < 0) this.setFieldsValue(me.view, 0, "our_rate_tranche");
        },
        blur: async (el, v) => {
          this.updateOrderData();
        }
      },
      "[name=fee_percent]": {
        blur: async (el, v) => {
          await this.updateOrderDataQuietly();
        }
      },
      "[action=add_charge]": {
        click: () => {
          this.addChargeField();
        }
      }
    });
    this.fillFieldsWithSystemData(this.view.order_data, [
      ["agent_part", "WCN_AGENT_FEE"]
    ]);

    this.view.scope.controller.on("merchantChanged", () => {
      if (this.view) {
        this.fillFieldsWithSystemData(
          Object.assign(this.view.order_data, {
            organisation: this.view.scope.down("[name=organisation]").getValue()
          }),
          [["agent_part", "WCN_AGENT_FEE"]]
        );
        this.setNewTrancheBtnState();
      }
    });

    this.setDefaultCurrencies();
    this.setNewTrancheBtnState();
    this.sortCurrenciesStores();
    return this.callParent(arguments);
  },
  setValues(data) {
    this.buildPanels(this.view.config.order_data);
    this.callParent(arguments);
  },
  async sortCurrenciesStores() {
    await this.sortCurrenciesByCommonUsed("from_currency");
    await this.sortCurrenciesByCommonUsed("to_currency");
  },

  setNewTrancheBtnState() {
    const feeField = this.view.down("[name=fee_percent]").getValue();

    const btnStatus =
      this.view.scope.currentData.organisation &&
      this.view.scope.currentData.status ==
        this.view.scope.controller.orders_statuses[0] &&
      feeField;

    this.view.scope.down("[action=add_new_tranche]").setDisabled(!btnStatus);
  },

  handleAgentCurrency(v) {
    const wc = this.view.down("[name=to_currency]").getValue();

    const swapFileds = [
      "swap_fee_panel",
      "agent_swap_amount_panel",
      "agent_amount_panel",
      "swap_margin_panel",
      "received_from_swap_panel"
    ];

    if ((wc == "USDT" && v == "USTR") || (wc == "USTR" && v == "USDT")) {
      for (let fn of swapFileds) {
        this.view.down(`[name=${fn}]`).setVisible(true);
      }

      this.setFieldsValue(this.view, wc, [
        "our_netto_profit_currency",
        "swap_fee_currency",
        "agent_swap_amount_currency"
      ]);

      this.setFieldsValue(this.view, v, [
        "swap_margin_currency",
        "received_from_swap_currency"
      ]);

      this.view.down("[name=agent_fee_transfer]").setVisible(false);
    } else {
      for (let fn of swapFileds) {
        this.view.down(`[name=${fn}]`).setVisible(false);
      }
      this.view.down("[name=agent_fee_transfer]").setVisible(true);
    }
    this.setFieldsValue(this.view, v, ["agent_amount_currency"]);
    this.calculateTrancheData()
  },

  getHashesFields() {
    return [
      "total_client_payout_amount_hash_id",
      "agent_fee_amount_hash_id",
      "agent_swap_amount_hash_id",
      "agent_amount_hash_id",
      "our_netto_profit_hash_id"
    ];
  },
  getTransfersFields() {
    return [
      "total_client_payout_amount_transfer_id",
      "agent_fee_amount_transfer_id",
      "agent_swap_amount_transfer_id",
      "agent_amount_transfer_id",
      "our_netto_profit_transfer_id"
    ];
  },

  async calculateOrderData() {
    const fields_values = {};
    const data = await this.getOrderFieldsData(
      ["agent_part", "agent_amount", "received_from_swap"],
      []
    );
    const fields_data = data.fields_data;

    if (!fields_data.agent_part && fields_data.agent_part !== 0) return;

    let tranches_totals = this.getTranchesData();

    fields_values["total_client_payout_amount"] =
      tranches_totals.total_client_payout_amount;
    // fields_values["total_profit_brutto"] = tranches_totals.profit_total;
    if (Number(fields_data.agent_part) === 0)
      fields_values["agent_fee_amount"] = 0;
    else
      fields_values["agent_fee_amount"] =
        tranches_totals.profit_total / Number(fields_data.agent_part);
    fields_values["our_profit"] =
      tranches_totals.profit_total - fields_values.agent_fee_amount;
    fields_values["swap_margin"] =
      fields_data.received_from_swap - fields_data.agent_amount;

    await this.calculateOurNettoProfit();

    return this.saveOrderData(fields_values);
  },

  async updateOrderData() {
    let values = this.getFieldsValues(this.view, [
      "amount_tranche",
      "client_rate_tranche",
      "fee_percent"
    ]);
    if (
      (values.amount_tranche || values.amount_tranche === 0) &&
      (values.client_rate_tranche || values.client_rate_tranche === 0) &&
      (values.fee_percent || values.fee_percent === 0)
    ) {
      await this.updateTranche();
      await this.updateGeneralOrderData();
    }
  },
  async updateGeneralOrderData() {
    return await this.calculateOrderData();
  },

  getAdditionalCardsWithWithdrawalFields() {
    return [
      "from_currency",
      "to_currency",
      "fee_percent",
      "total_client_payout_amount",
      "total_client_payout_amount_currency",
      "agent_fee_amount",
      "agent_fee_amount_currency",
      "our_profit",
      "our_profit_currency"
    ];
  },

  getTranchesData() {
    let tranches_store = this.view.scope
      .down("[name=tranches_grid]")
      .store.getData();
    return tranches_store.items.reduce(
      (prev, curr) => {
        return {
          total_client_payout_amount:
            prev.total_client_payout_amount +
            Number(
              typeof curr.data.data.client_amount_netto_tranche == "number"
                ? curr.data.data.client_amount_netto_tranche
                : curr.data.data.client_amount_netto_tranche.replace(",", ".")
            ),
          profit_total:
            prev.profit_total +
            Number(
              typeof curr.data.data.total_tranche_profit == "number"
                ? curr.data.data.total_tranche_profit
                : curr.data.data.total_tranche_profit.replace(",", ".")
            )
        };
      },
      {
        total_client_payout_amount: 0,
        profit_total: 0
      }
    );
  },
  async calculateTrancheData(external_data) {
    const exchangeFee = 0.001;
    const withdrawFee = {
      USDT: 5,
      USTR: 15
    };
    const fields_values = {};
    let fields_data = external_data;
    if (!external_data)
      fields_data = this.getFieldsValues(this.view, [
        "amount_tranche",
        "client_rate_tranche",
        "fee_percent",
        "agent_fee_amount",
        "agent_fee_amount_currency",
        "our_profit",
        "our_rate_tranche"
      ]);
    fields_data = this.transformFieldsNumbers(fields_data, [
      "amount_tranche",
      "client_rate_tranche",
      "fee_percent",
      "agent_fee_amount",
      "our_profit",
      "our_rate_tranche"
    ]);

    const fields_array = [];
    if (
      (!fields_data.amount_tranche && fields_data.amount_tranche !== 0) ||
      (!fields_data.client_rate_tranche &&
        fields_data.client_rate_tranche !== 0) ||
      (!fields_data.fee_percent && fields_data.fee_percent !== 0)
    )
      return;

    /* swap calculates part */
    const exchangedAmount =
      (fields_data.agent_fee_amount +
        withdrawFee[fields_data.agent_fee_amount_currency]) *
      exchangeFee;

    if (exchangedAmount < 1) {
      fields_values["agent_swap_amount"] =
        1 +
        (fields_data.agent_fee_amount +
          withdrawFee[fields_data.agent_fee_amount_currency]);
    } else {
      fields_values["agent_swap_amount"] =
        exchangedAmount +
        (fields_data.agent_fee_amount +
          withdrawFee[fields_data.agent_fee_amount_currency]);
    }
    fields_values["swap_fee"] =
      fields_values["agent_swap_amount"] - fields_data.agent_fee_amount;

    fields_values["agent_amount"] = fields_data.agent_fee_amount;

    fields_values["to_currency_amount_tranche"] = fields_data.our_rate_tranche
      ? fields_data.amount_tranche / fields_data.our_rate_tranche
      : 0;

    if (fields_data.client_rate_tranche === 0)
      fields_values["client_amount_brutto_tranche"] = 0;
    else
      fields_values["client_amount_brutto_tranche"] =
        fields_data.amount_tranche / fields_data.client_rate_tranche;

    fields_values["rate_delta_profit_tranche"] =
      fields_values.client_amount_brutto_tranche -
      fields_values.to_currency_amount_tranche;

    fields_values["fee_amount_tranche"] =
      (fields_values.to_currency_amount_tranche / 100) *
      fields_data.fee_percent;

    fields_values["client_amount_netto_tranche"] =
      fields_values.to_currency_amount_tranche -
      fields_values.fee_amount_tranche;

    fields_values["total_tranche_profit"] =
      fields_values.client_amount_brutto_tranche -
      fields_values.client_amount_netto_tranche;

    fields_values["our_profit"] =
      fields_data.our_profit - fields_values["swap_fee"];

    if (external_data) return fields_values;
    for (let name of Object.keys(fields_values)) {
      fields_array.push({ name, value: fields_values[name] });
    }
    await this.calculateOurNettoProfit();

    return this.setFieldsValues(this.view, fields_array);
  },

  setCurrenciesFieldsValues(currencies) {
    if (currencies.to_currency)
      this.setFieldsValue(this.view, currencies.to_currency, [
        "client_amount_brutto_tranche_currency",
        "rate_delta_profit_tranche_currency",
        "fee_amount_tranche_currency",
        "client_amount_netto_tranche_currency",
        "total_tranche_profit_currency"
      ]);
  }
});
