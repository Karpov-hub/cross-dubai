Ext.define(
  "Crm.modules.orders.view.orderTypes.CardsWithWithdrawalFiatController",
  {
    extend: "Crm.modules.orders.view.orderTypes.BaseTypesController",

    mixins: [
      "Crm.modules.orders.view.FieldsHelper",
      "Crm.modules.orders.view.orderTypes.CryptoFiatFunctions"
    ],

    to_currency_fields: [
      "to_currency_amount_tranche_currency",
      "client_amount_brutto_tranche_currency",
      "rate_delta_profit_tranche_currency",
      "service_fee_tranche_currency",
      "total_tranche_profit_currency",
      "client_amount_netto_tranche_currency"
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
          change: (el, v, oldv) => {
            if (v) {
              this.setFieldsValue(me.view, v, [
                "client_currency",
                "agent_currency",
                "total_our_amount_currency",
                "total_client_amount_currency",
                "total_fee_currency",
                "client_amount_netto_currency",
                "total_profit_currency",
                "agent_fee_currency",
                "our_profit_currency",
                "working_currency_conversion_profit_amount_currency",
                "total_conversion_amount_netto_profit_currency",
                "our_netto_profit_currency"
              ]);
              me.model.updateExistedTranchesCurrencies(
                me.view.scope.down("[name=id]").getValue(),
                v,
                me.to_currency_fields
              );
              this.setChargeCurrencies();
            }
          }
        },
        "[action=add_charge]": {
          click: () => {
            this.addChargeField();
          }
        },
        "[name=client_currency]": {
          change: (el, v) => {
            this.displayFields(
              v,
              [
                "our_rate",
                "client_rate",
                "client_payout_panel",
                "client_payout_rate_delta",
                "client_currency_conversion_profit",
                "working_currency_conversion_profit",
                "total_conversion_amount_netto",
                "total_conversion_amount_netto_profit_transfer"
              ],
              ["client_amount_netto_transfer"]
            );
            if (v) {
              this.setFieldsValue(me.view, v, [
                "client_payout_currency",
                "client_currency_conversion_profit_amount_currency"
              ]);
              this.calculateClientOrderData();
            }
          }
        },
        "[name=agent_currency]": {
          change: (el, v) => {
            this.handleAgentCurrency(v);
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
        "[name=our_rate_tranche]": {
          change: (el, v) => {
            if (v < 0) this.setFieldsValue(me.view, 0, "our_rate_tranche");
          },
          blur: async (el, v) => {
            this.updateOrderData();
          }
        },
        "[name=our_rate]": {
          blur: (el, v) => {
            this.calculateClientOrderData();
          }
        },
        "[name=agent_rate]": {
          blur: (el, v) => {
            this.calculateAgentOrderData();
          }
        },
        "[name=to_currency_amount_tranche_currency]": {
          change: (el, v) => {
            if (v) {
              this.setFieldsValue(me.view, v, me.to_currency_fields);
            }
          }
        },
        "[name=agent_part]": {
          blur: () => {
            this.calculateOrderData();
          },
          change: (el, v) => {
            this.setNewTrancheBtnState();
          }
        },
        "[name=received_from_swap]": {
          blur: () => {
            this.calculateAgentOrderData();
          }
        },
        "[name=fee_percent]": {
          change: (el, v) => {
            this.setNewTrancheBtnState();
          },
          blur: async (el, v) => {
            await this.updateOrderDataQuietly();
          }
        },
        "[name=client_rate]": {
          blur: (el, v) => {
            this.calculateClientOrderData();
          }
        },
        "[name=client_rate_tranche]": {
          change: (el, v) => {
            if (v < 0) this.setFieldsValue(me.view, 0, "client_rate_tranche");
          },
          blur: async (el, v) => {
            this.updateOrderData();
          }
        }
      });
      this.fillFieldsWithSystemData(this.view.order_data, [
        ["agent_part", "WCN_AGENT_FEE"],
        ["fee_percent", "WCN_COMISSION_PERCENTAGE"]
      ]);

      this.view.scope.controller.on("merchantChanged", () => {
        if (this.view) {
          this.fillFieldsWithSystemData(
            Object.assign(this.view.order_data, {
              organisation: this.view.scope
                .down("[name=organisation]")
                .getValue()
            }),
            [
              ["agent_part", "WCN_AGENT_FEE"],
              ["fee_percent", "WCN_COMISSION_PERCENTAGE"]
            ]
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
      await this.sortCurrenciesByCommonUsed("client_currency");
      await this.sortCurrenciesByCommonUsed("agent_currency");
    },

    setNewTrancheBtnState() {
      // const delta = this.view.down("[name=delta]").getValue();
      const feePercent = this.view.down("[name=fee_percent]").getValue();
      const agentPart = this.view.down("[name=agent_part]").getValue();

      const btnStatus =
        this.view.scope.currentData.organisation &&
        this.view.scope.currentData.status ==
          this.view.scope.controller.orders_statuses[0] &&
        // delta &&
        feePercent &&
        agentPart;

      this.view.scope.down("[action=add_new_tranche]").setDisabled(!btnStatus);
    },

    handleAgentCurrency(v) {
      const wc = this.view.down("[name=to_currency]").getValue();

      const swapFileds = [
        "swap_fee_panel",
        "agent_swap_amount_panel",
        "agent_amount_panel",
        "swap_margin_panel",
        "received_from_swap_panel",
        "agent_amount_transfer"
      ];

      if ((wc == "USDT" && v == "USTR") || (wc == "USTR" && v == "USDT")) {
        for (let fn of swapFileds) {
          this.view.down(`[name=${fn}]`).setVisible(true);
        }

        this.view.down("[name=agent_fee_transfer]").setVisible(false);
        this.view.down("[name=agent_rate]").setVisible(false);

        this.setFieldsValue(this.view, wc, [
          "swap_fee_currency",
          "agent_swap_amount_currency"
        ]);

        this.setFieldsValue(this.view, v, [
          "swap_margin_currency",
          "received_from_swap_currency"
        ]);
      } else {
        for (let fn of swapFileds) {
          this.view.down(`[name=${fn}]`).setVisible(false);
        }
        this.view.down("[name=agent_fee_transfer]").setVisible(true);
        this.view.down("[name=agent_rate]").setVisible(true);
        this.displayFields(v, ["agent_rate", "agent_amount_panel"]);
      }

      if (v) {
        this.setFieldsValue(this.view, v, ["agent_amount_currency"]);
      }
      this.calculateAgentOrderData();
    },

    getHashesFields() {
      return [
        "client_amount_netto_hash_id",
        "agent_fee_hash_id",
        "agent_swap_amount_hash_id",
        "agent_amount_hash_id",
        "our_netto_profit_hash_id"
      ];
    },
    getTransfersFields() {
      return [
        "client_amount_netto_transfer_id",
        "agent_fee_transfer_id",
        "agent_swap_amount_transfer_id",
        "agent_amount_transfer_id",
        "our_netto_profit_transfer_id"
      ];
    },

    displayFields(currency_value, fields, fields_to_hide) {
      let to_currency = this.view.down("[name=to_currency]").getValue();
      let display = false;
      if (to_currency != currency_value) display = true;
      for (let field_name of fields)
        this.view.down(`[name=${field_name}]`).setVisible(display);
      if (fields_to_hide && fields_to_hide.length)
        for (let field_name of fields_to_hide)
          this.view.down(`[name=${field_name}]`).setVisible(!display);
      return;
    },

    async calculateTrancheData(external_data) {
      const fields_values = {};
      let fields_data = external_data;
      if (!external_data)
        fields_data = this.getFieldsValues(this.view, [
          "amount_tranche",
          "our_rate_tranche",
          // "delta",
          "fee_percent",
          "client_rate_tranche"
        ]);
      fields_data = this.transformFieldsNumbers(fields_data, [
        "amount_tranche",
        "our_rate_tranche",
        // "delta",
        "fee_percent",
        "client_rate_tranche"
      ]);

      if (
        (!fields_data.amount_tranche && fields_data.amount_tranche !== 0) ||
        (!fields_data.our_rate_tranche && fields_data.our_rate_tranche !== 0)
      )
        return;

      if (fields_data.our_rate_tranche === 0)
        fields_values["to_currency_amount_tranche"] = 0;
      else
        fields_values["to_currency_amount_tranche"] =
          fields_data.amount_tranche / fields_data.our_rate_tranche;

      fields_values["rate_delta_tranche"] =
        fields_data.client_rate_tranche - fields_data.our_rate_tranche;

      fields_values[
        "client_amount_brutto_tranche"
      ] = fields_data.client_rate_tranche
        ? fields_data.amount_tranche / fields_data.client_rate_tranche
        : 0;

      fields_values["rate_delta_profit_tranche"] =
        fields_values.to_currency_amount_tranche -
        fields_values.client_amount_brutto_tranche;

      fields_values["service_fee_tranche"] =
        (fields_values.client_amount_brutto_tranche / 100) *
        Number(fields_data.fee_percent);

      fields_values["client_amount_netto_tranche"] =
        fields_values.client_amount_brutto_tranche -
        fields_values.service_fee_tranche;

      fields_values["total_tranche_profit"] =
        fields_values.to_currency_amount_tranche -
        fields_values.client_amount_netto_tranche;

      if (external_data) return fields_values;
      let fields_array = [];
      for (let name of Object.keys(fields_values)) {
        fields_array.push({ name, value: fields_values[name] });
      }

      return this.setFieldsValues(this.view, fields_array);
    },

    async updateOrderData() {
      let values = this.getFieldsValues(this.view, [
        "amount_tranche",
        "our_rate_tranche"
      ]);
      if (
        (values.amount_tranche || values.amount_tranche === 0) &&
        (values.our_rate_tranche || values.our_rate_tranche === 0)
      ) {
        await this.updateTranche();
        await this.updateGeneralOrderData();
      }
    },
    async updateGeneralOrderData() {
      await this.calculateOrderData();
      await this.calculateClientOrderData();
      await this.calculateAgentOrderData();
      return;
    },
    async calculateOrderData() {
      const fields_values = {};
      const tranches_totals = this.getTranchesData();
      fields_values["total_our_amount"] =
        tranches_totals.to_currency_amount_tranche_total;
      fields_values["total_client_amount"] =
        tranches_totals.client_amount_brutto_tranche_total;
      fields_values["total_fee"] = tranches_totals.service_fee_tranche_total;
      fields_values["client_amount_netto"] =
        tranches_totals.client_amount_netto_tranche_total;
      return this.saveOrderData(fields_values);
    },

    async calculateAgentOrderData() {
      const exchangeFee = 0.001;
      const withdrawFee = {
        USDT: 15,
        USTR: 5
      };

      let fields_values = {};
      let data = await this.prepareOrderFieldsData();
      let fields_data = data.fields_data;

      if (Number(fields_data.agent_part) === 0) fields_values["agent_fee"] = 0;
      else
        fields_values["agent_fee"] =
          fields_data.total_profit / Number(fields_data.agent_part);
      const exchangedAmount =
        (fields_values.agent_fee + withdrawFee[fields_data.agent_currency]) *
        exchangeFee;

      if (exchangedAmount < 1) {
        fields_values["agent_swap_amount"] =
          1 +
          (fields_values.agent_fee + withdrawFee[fields_data.agent_currency]);
      } else {
        fields_values["agent_swap_amount"] =
          exchangedAmount +
          (fields_values.agent_fee + withdrawFee[fields_data.agent_currency]);
      }

      fields_values["swap_fee"] =
        fields_values["agent_swap_amount"] - fields_values.agent_fee;

      fields_values["agent_amount"] = fields_values.agent_fee;

      fields_values["our_profit"] =
        fields_data.total_profit -
        fields_values.agent_fee -
        (fields_values["swap_fee"] || 0);

      if (fields_data.agent_rate) {
        fields_values["agent_amount"] =
          fields_values.agent_fee * fields_data.agent_rate;
      }
      fields_values["swap_margin"] =
        fields_data.received_from_swap - fields_values["agent_amount"];
      await this.calculateOurNettoProfit();
      return this.saveOrderData(fields_values);
    },

    async calculateClientOrderData() {
      const fields_values = {};
      const data = await this.prepareOrderFieldsData();
      const fields_data = data.fields_data;

      if (
        (fields_data.our_rate || fields_data.our_rate === 0) &&
        (fields_data.client_rate || fields_data.client_rate === 0)
      ) {
        let tranches_totals = this.getTranchesData();

        fields_values["client_payout"] =
          tranches_totals.client_amount_netto_tranche_total *
          fields_data.client_rate;
        fields_values["our_rate_client_payout"] =
          tranches_totals.client_amount_netto_tranche_total *
          fields_data.our_rate;

        let decimal_fix =
          this.getDecimalLength(fields_data.our_rate) >=
          this.getDecimalLength(fields_data.client_rate)
            ? this.getDecimalLength(fields_data.our_rate)
            : this.getDecimalLength(fields_data.client_rate);
        fields_values["client_payout_rate_delta"] = (
          fields_data.our_rate - fields_data.client_rate
        ).toFixed(decimal_fix);
        fields_values["client_currency_conversion_profit_amount"] =
          fields_data.client_amount_netto * fields_data.our_rate -
          fields_data.client_amount_netto * fields_data.client_rate;

        if (fields_data.our_rate === 0)
          fields_values["working_currency_conversion_profit_amount"] = 0;
        else
          fields_values["working_currency_conversion_profit_amount"] =
            fields_values.client_currency_conversion_profit_amount /
            fields_data.our_rate;

        fields_values["total_conversion_amount_netto_profit"] =
          fields_data.client_amount_netto -
          fields_values.working_currency_conversion_profit_amount;
      }
      if (
        fields_data.to_currency != fields_data.client_currency &&
        fields_values.working_currency_conversion_profit_amount
      )
        fields_values["total_profit"] =
          fields_data.total_our_amount -
          fields_data.client_amount_netto +
          fields_values.working_currency_conversion_profit_amount;
      else
        fields_values["total_profit"] =
          fields_data.total_our_amount - fields_data.client_amount_netto;
      this.saveOrderData(fields_values);
      await this.calculateAgentOrderData();
      return;
    },

    getTranchesData() {
      let tranches_store = this.view.scope
        .down("[name=tranches_grid]")
        .store.getData();
      return tranches_store.items.reduce(
        (prev, curr) => {
          return {
            rate_delta_profit_tranche_total:
              prev.rate_delta_profit_tranche_total +
              Number(
                typeof curr.data.data.rate_delta_profit_tranche == "string"
                  ? curr.data.data.rate_delta_profit_tranche.replace(",", ".")
                  : curr.data.data.rate_delta_profit_tranche
              ),
            total_tranche_profit:
              prev.total_tranche_profit +
              Number(
                typeof curr.data.data.total_tranche_profit == "string"
                  ? curr.data.data.total_tranche_profit.replace(",", ".")
                  : curr.data.data.total_tranche_profit
              ),
            service_fee_tranche_total:
              prev.service_fee_tranche_total +
              Number(
                typeof curr.data.data.service_fee_tranche == "string"
                  ? curr.data.data.service_fee_tranche.replace(",", ".")
                  : curr.data.data.service_fee_tranche
              ),
            client_amount_brutto_tranche_total:
              prev.client_amount_brutto_tranche_total +
              Number(
                typeof curr.data.data.client_amount_brutto_tranche == "string"
                  ? curr.data.data.client_amount_brutto_tranche.replace(
                      ",",
                      "."
                    )
                  : curr.data.data.client_amount_brutto_tranche
              ),
            to_currency_amount_tranche_total:
              prev.to_currency_amount_tranche_total +
              Number(
                typeof curr.data.data.to_currency_amount_tranche == "string"
                  ? curr.data.data.to_currency_amount_tranche.replace(",", ".")
                  : curr.data.data.to_currency_amount_tranche
              ),
            client_amount_netto_tranche_total:
              prev.client_amount_netto_tranche_total +
              Number(
                typeof curr.data.data.client_amount_netto_tranche == "string"
                  ? curr.data.data.client_amount_netto_tranche.replace(",", ".")
                  : curr.data.data.client_amount_netto_tranche
              )
          };
        },
        {
          rate_delta_profit_tranche_total: 0,
          client_amount_netto_tranche_total: 0,
          to_currency_amount_tranche_total: 0,
          client_amount_brutto_tranche_total: 0,
          service_fee_tranche_total: 0,
          total_tranche_profit: 0
        }
      );
    },

    async prepareOrderFieldsData() {
      let data = await this.getOrderFieldsData(
        [
          "our_rate",
          "agent_rate",
          "our_profit",
          "agent_part",
          "agent_fee",
          // "delta",
          "fee_percent",
          "client_amount_netto",
          "agent_currency",
          "swap_fee",
          "received_from_swap",
          "agent_amount",
          "client_rate",
          "to_currency",
          "client_currency",
          "total_conversion_amount_netto_profit",
          "total_our_amount",
          "working_currency_conversion_profit_amount",
          "total_profit"
        ],
        []
      );
      return {
        fields_data: data.fields_data,
        tariff_variables: data.tariff_variables
      };
    },

    nullifyCardsWithWithdrawalFiatFields(rec) {
      let fields_arr = [
        "to_currency_amount_tranche",
        "rate_delta_tranche",
        "client_rate_tranche",
        "client_amount_brutto_tranche",
        "rate_delta_profit_tranche",
        "service_fee_tranche",
        "client_amount_netto_tranche",
        "total_tranche_profit"
      ];
      if (rec) fields_arr.push("amount_tranche", "our_rate_tranche");
      return this.setFieldsValue(this.view, 0, fields_arr);
    },

    setCurrenciesFieldsValues(currencies) {
      if (currencies.to_currency)
        this.setFieldsValue(this.view, currencies.to_currency, [
          "client_amount_brutto_tranche_currency",
          "rate_delta_profit_tranche_currency",
          "service_fee_tranche_currency",
          "total_tranche_profit_currency",
          "client_amount_netto_tranche_currency"
        ]);
    }
  }
);
