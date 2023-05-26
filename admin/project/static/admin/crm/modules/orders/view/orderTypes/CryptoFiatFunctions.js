Ext.define("Crm.modules.orders.view.orderTypes.CryptoFiatFunctions", {
  getTotalCharges() {
    let panel = this.view.down("[name=our_charges_panel]");
    if (!panel.items.items.length) return 0;
    let total_charges = 0;
    for (let field of panel.items.items) {
      let idx = this.getFieldIndex(field.name);
      let amount = this.view.down(`[name=charge_amount_${idx}]`).getValue();
      if (typeof amount == "string") amount = Number(amount.replace(",", "."));
      total_charges += amount;
    }
    return total_charges;
  },
  updatePayoutPanelTitle(payout_panel_name, amount) {
    let p_panel = this.view.down(`[name=${payout_panel_name}]`),
      currency = this.view
        .down(
          `[name=${p_panel
            .down("[name=amount_field_name]")
            .getValue()}_currency]`
        )
        .getValue(),
      title = p_panel.getTitle();
    let original_title = title.substring(0, title.indexOf("(")) || title;
    p_panel.setTitle(
      `${original_title} (available ${amount.toFixed(2)} ${currency})`
    );
    return;
  },
  calculateAmounts(payout_panel_name, value) {
    value = typeof value == "string" ? Number(value.replace(",", ".")) : value;
    let panel = this.view.down(`[name=${payout_panel_name}]`);
    if (!panel.items.items.length) return false;
    if (
      !this.view.down(
        `[name=${panel.down("[name=amount_field_name]").getValue()}]`
      )
    )
      return;
    let our_rate_amount = this.view
      .down(`[name=${panel.down("[name=amount_field_name]").getValue()}]`)
      .getValue();
    let total_entered_payout_amount = 0;
    for (let field of panel.items.items) {
      let idx = this.getFieldIndex(field.name);
      let amount = this.view.down(`[name=payout_amount_${idx}]`).getValue();
      if (typeof amount == "string") amount = Number(amount.replace(",", "."));
      total_entered_payout_amount += amount;
    }
    return {
      our_rate_amount,
      total_entered_payout_amount
    };
  },
  validatePayoutAmount(payout_panel_name, value) {
    let amounts = this.calculateAmounts(payout_panel_name, value),
      our_rate_amount = amounts.our_rate_amount,
      total_entered_payout_amount = amounts.total_entered_payout_amount,
      available_amount =
        Number(our_rate_amount) - Number(total_entered_payout_amount);

    if (available_amount >= 0)
      this.updatePayoutPanelTitle(payout_panel_name, available_amount);

    if (Number(our_rate_amount) >= total_entered_payout_amount) {
      return true;
    }
    return {
      available_amount:
        Number(our_rate_amount) - (total_entered_payout_amount - value)
    };
  },

  buildPanels(data, payout_panel_name, amount_field_name) {
    let me = this;
    let keys = Object.keys(data);
    let to_currency = this.getCurrencyByClientActionType();

    if (payout_panel_name && amount_field_name) {
      let payout_fields = keys.filter((el) => {
        return el.includes("payout_amount_currency_");
      });
      let payout_panel = this.view.down(`[name=${payout_panel_name}]`);
      for (let payout_field of payout_fields) {
        let idx = this.getFieldIndex(payout_field);
        payout_panel.add(
          this.buildPayoutContainer(
            me,
            payout_panel,
            idx,
            amount_field_name,
            to_currency,
            data[`payout_amount_${idx}`],
            data[`payout_amount_${idx}_transfer_id`],
            data[`payout_amount_${idx}_hash_id`]
          )
        );
      }
    }
    let charges_fields = keys.filter((el) => {
      return el.includes("charge_amount_currency_");
    });
    let charges_panel = this.view.down("[name=our_charges_panel]");
    for (let charges_field of charges_fields) {
      let idx = this.getFieldIndex(charges_field);
      charges_panel.add(
        this.buildChargesContainer(
          me,
          charges_panel,
          idx,
          to_currency,
          data[`charge_description_${idx}`],
          data[`charge_amount_${idx}`]
        )
      );
    }
    return;
  },

  buildPayoutContainer(
    me,
    payouts_panel,
    field_index,
    amount_field_name,
    to_currency,
    amount,
    transfer_id,
    hash_id
  ) {
    return {
      xtype: "panel",
      layout: "anchor",
      name: `payout_${field_index}`,
      items: [
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: {
            anchor: "99%",
            labelWidth: 100
          },
          items: [
            {
              xtype: "textfield",
              hidden: true,
              name: "amount_field_name",
              value: amount_field_name
            },
            {
              xtype: "button",
              iconCls: "x-fa fa-trash-alt",
              action: `delete_payment_${field_index}`,
              width: 40,
              listeners: {
                click: () => {
                  payouts_panel.remove(
                    me.view.down(`[name=payout_${field_index}]`)
                  );
                }
              }
            }
          ]
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: {
            anchor: "99%",
            labelWidth: 100,
            xtype: "numberfield",
            keyNavEnabled: false,
            hideTrigger: true,
            mouseWheelEnabled: false
          },
          items: [
            {
              fieldLabel: D.t("Amount"),
              name: `payout_amount_${field_index}`,
              value: amount,
              cls: "editable-system-fields",
              flex: 1,
              validator: (value) => {
                if (!Ext.isEmpty(value)) {
                  let valid = me.validatePayoutAmount(
                    payouts_panel.name,
                    value
                  );
                  if (typeof valid == "boolean" && valid) return true;
                  return `${D.t("Value cannot be more than")} ${
                    valid.available_amount
                  }`;
                }
                return D.t("Value cannot be empty");
              },
              listeners: {
                change: (el, v) => {
                  let amounts = me.calculateAmounts(payouts_panel.name, v),
                    available_amount =
                      Number(amounts.our_rate_amount) -
                      Number(amounts.total_entered_payout_amount);
                  if (available_amount >= 0)
                    me.updatePayoutPanelTitle(
                      payouts_panel.name,
                      available_amount
                    );
                }
              }
            },
            {
              xtype: "textfield",
              name: `payout_amount_currency_${field_index}`,
              readOnly: true,
              value: to_currency,
              cls: "system-fields",
              width: 60
            },
            {
              xtype: "textfield",
              name: `payout_amount_${field_index}_transfer_id`,
              value: transfer_id,
              listeners: {
                afterrender(el) {
                  //running change event on the form opening
                  el.fireEvent("change");
                },
                change() {
                  let delete_payment_button = me.view.down(
                    `[action=delete_payment_${field_index}]`
                  );
                  let amount_field = me.view.down(
                    `[name=payout_amount_${field_index}]`
                  );
                  if (
                    me.view
                      .down(`[name=payout_amount_${field_index}_transfer_id]`)
                      .getValue()
                  ) {
                    amount_field.setReadOnly(true);
                    return delete_payment_button.setDisabled(true);
                  }
                  amount_field.setReadOnly(false);
                  return delete_payment_button.setDisabled(false);
                }
              },
              hidden: true
            },
            {
              xtype: "textfield",
              name: `payout_amount_${field_index}_hash_id`,
              value: hash_id,
              hidden: true
            },
            {
              xtype: "wcn_payment_panel",
              scope: me.view,
              amount_field: `payout_amount_${field_index}`,
              tag: payouts_panel.tag,
              width: 70
            }
          ]
        }
      ]
    };
  },
  addPayoutField(payout_panel_name, amount_field_name, currency_field) {
    let me = this;
    if (!amount_field_name) return;
    let payouts_panel = this.view.down(`[name=${payout_panel_name}]`);
    let field_index = payouts_panel.items.items.length;

    let currency = "";
    if (currency_field)
      currency = this.view.down(`[name=${currency_field}]`).getValue();
    else currency = this.getCurrencyByClientActionType();

    let amount_for_first_field =
      field_index == 0
        ? this.view.down(`[name=${amount_field_name}]`).getValue()
        : 0;
    return payouts_panel.add(
      this.buildPayoutContainer(
        me,
        payouts_panel,
        field_index,
        amount_field_name,
        currency,
        amount_for_first_field
      )
    );
  },

  getCurrencyByClientActionType() {
    let client_action_type_field = this.view.down("[name=client_action_type]");
    if (client_action_type_field) {
      let client_action_type = this.view
        .down("[name=client_action_type]")
        .getValue();
      if (client_action_type && client_action_type == "sell")
        return this.view.down("[name=from_currency]").getValue();
    }
    return this.view.down("[name=to_currency]").getValue();
  },
  setPanelCurrencies(main_panel, child_currency_field_prefix, currency_field) {
    let panel = this.view.down(`[name=${main_panel}]`);

    if (!panel || !panel.items.items.length) return false;

    let currency = "";
    if (currency_field)
      currency = this.view.down(`[name=${currency_field}]`).getValue();
    else currency = this.getCurrencyByClientActionType();

    for (let field of panel.items.items) {
      let idx = this.getFieldIndex(field.name);
      if (typeof idx != "boolean") {
        panel
          .down(`[name=${child_currency_field_prefix}${idx}]`)
          .setValue(currency);
      }
    }
  },
  getFieldIndex(str) {
    if (!str) return false;
    return str.charAt(str.length - 1);
  },
  setPayoutCurrencies(payout_panel_name, currency_field) {
    this.setPanelCurrencies(
      payout_panel_name,
      "payout_amount_currency_",
      currency_field
    );
  },
  setChargeCurrencies(currency_field) {
    this.setPanelCurrencies(
      "our_charges_panel",
      "charge_amount_currency_",
      currency_field
    );
  },

  buildChargesContainer(
    me,
    charges_panel,
    field_index,
    to_currency,
    description,
    amount
  ) {
    return {
      xtype: "fieldcontainer",
      layout: "anchor",
      name: `charge_${field_index}`,
      items: [
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: {
            anchor: "99%",
            labelWidth: 100
          },
          items: [
            {
              flex: 1,
              xtype: "textfield",
              fieldLabel: D.t("Description"),
              value: description,
              name: `charge_description_${field_index}`
            },
            {
              xtype: "button",
              iconCls: "x-fa fa-trash-alt",
              width: 60,
              listeners: {
                click: () => {
                  charges_panel.remove(
                    me.view.down(`[name=charge_${field_index}]`)
                  );
                  me.calculateOurNettoProfit();
                }
              }
            }
          ]
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: {
            anchor: "99%",
            labelWidth: 100,
            xtype: "numberfield",
            keyNavEnabled: false,
            hideTrigger: true,
            mouseWheelEnabled: false
          },
          items: [
            {
              fieldLabel: D.t("Amount"),
              name: `charge_amount_${field_index}`,
              value: amount,
              flex: 1,
              listeners: {
                blur: () => {
                  me.calculateOurNettoProfit();
                }
              }
            },
            {
              xtype: "textfield",
              name: `charge_amount_currency_${field_index}`,
              readOnly: true,
              value: to_currency,
              cls: "system-fields",
              width: 60
            }
          ]
        }
      ]
    };
  },

  addChargeField(currency_field) {
    let me = this;
    let charges_panel = this.view.down("[name=our_charges_panel]");
    let field_index = charges_panel.items.items.length;

    let currency = "";
    if (currency_field)
      currency = this.view.down(`[name=${currency_field}]`).getValue();
    else currency = this.getCurrencyByClientActionType();

    return charges_panel.add(
      this.buildChargesContainer(me, charges_panel, field_index, currency)
    );
  },

  getPayoutFields(payout_panel_name, postfix) {
    let fields = [];
    let panel = this.view.down(`[name=${payout_panel_name}]`);
    if (!panel.items.items.length) return [];
    for (let field of panel.items.items) {
      let idx = this.getFieldIndex(field.name);
      if (typeof idx != "boolean")
        fields.push(`payout_amount_${idx}_${postfix}`);
    }
    return fields;
  },

  _getHashesFields(payout_panel_name) {
    let arr = [];
    arr = arr.concat(this.getPayoutFields(payout_panel_name, "hash_id"));
    return arr;
  },
  _getTransfersFields(payout_panel_name) {
    let arr = [];
    arr = arr.concat(this.getPayoutFields(payout_panel_name, "transfer_id"));
    return arr;
  },

  getGeneratedFields(container_name) {
    let fields_names = [];
    let panel = this.view.down(`[name=${container_name}]`);
    if (!panel.items.items.length) return fields_names;
    for (let child_panel of panel.items.items) {
      for (let field_container of child_panel.items.items)
        for (let field of field_container.items.items)
          if (field.name) fields_names.push(field.name);
    }
    return fields_names;
  },

  async calculateOurNettoProfit() {
    let fields_values = {},
      profit_name = ["our_profit"],
      recalc_our_profit = this.view.down("[name=recalc_our_profit]"),
      is_penalty = this.view.down("[name=is_penalty]").getValue();
    if (recalc_our_profit) profit_name.push("recalc_our_profit");
    if (is_penalty) profit_name = ["client_penalty", "platform_penalty"];

    let data = await this.getOrderFieldsData(profit_name);
    data = data.fields_data;
    if (!is_penalty && !this.checkIfObjectValid(data)) return;
    data.charges = this.getTotalCharges();
    if (recalc_our_profit)
      fields_values["our_netto_profit"] =
        (data.our_profit || 0) + (data.recalc_our_profit || 0) - data.charges;
    if (is_penalty)
      fields_values["our_netto_profit"] =
        (data.client_penalty || 0) +
        (data.platform_penalty || 0) -
        data.charges;
    if (profit_name.length == 1)
      fields_values["our_netto_profit"] = data[profit_name[0]] - data.charges;
    this.saveOrderData(fields_values);
    return;
  },

  async calculateDeliveryData() {
    let fields_values = {};
    let data = await this.getOrderFieldsData([
      "delivery_fee",
      "delivery_fee_cross_rate"
    ]);
    data = data.fields_data;
    if (!data.delivery_fee) data.delivery_fee = 0;
    if (!data.delivery_fee_cross_rate) data.delivery_fee_cross_rate = 0;
    fields_values["delivery_fee_after_cross"] =
      data.delivery_fee * data.delivery_fee_cross_rate;
    this.saveOrderData(fields_values);
    await this.doPostChargesCalculation();
    return;
  },
  async doPostChargesCalculation() {
    this.calculateClientAmount();
    this.calculateOurExchangeRateAmount();
    return;
  }
});
