Ext.define("Crm.modules.orders.view.orderTypes.CardsWithWithdrawal", {
  extend: "Crm.modules.orders.view.orderTypes.BaseTypesContainer",

  controllerCls:
    "Crm.modules.orders.view.orderTypes.CardsWithWithdrawalController",

  buildItems() {
    let me = this;
    return [
      {
        xtype: "form",
        layout: "anchor",
        name: "order_totals_panel",
        title: D.t("Order totals"),
        height: Math.floor(Ext.Element.getViewportHeight() * 0.55),
        scrollable: {
          y: true
        },
        defaults: {
          anchor: "99%",
          labelWidth: 160,
          xtype: "numberfield",
          keyNavEnabled: false,
          hideTrigger: true,
          mouseWheelEnabled: false
        },
        items: [
          {
            xtype: "combo",
            valueField: "abbr",
            displayField: "abbr",
            name: "from_currency",
            editable: false,
            fieldLabel: D.t("From currency"),
            keyNavEnabled: true,
            hideTrigger: false,
            margin: "3 3 0 0",
            store: Ext.create("Core.data.ComboStore", {
              dataModel: Ext.create(
                "Crm.modules.currency.model.ActiveCurrencyModel"
              ),
              fieldSet: ["abbr"],
              scope: this
            })
          },
          {
            xtype: "combo",
            valueField: "abbr",
            displayField: "abbr",
            store: Ext.create("Core.data.ComboStore", {
              dataModel: Ext.create(
                "Crm.modules.currency.model.ActiveCurrencyModel"
              ),
              fieldSet: ["abbr"],
              scope: this
            }),
            name: "to_currency",
            editable: false,
            fieldLabel: D.t("Working currency"),
            keyNavEnabled: true,
            hideTrigger: false,
            margin: "3 3 0 0"
          },
          {
            name: "fee_percent",
            fieldLabel: D.t("Fee, %"),
            decimalPrecision: 99,
            margin: "3 3 0 0"
          },
          {
            xtype: "box",
            anchor: "99%",
            html: "<hr>"
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            defaults: {
              anchor: "99%",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false,
              margin: "3 3 0 0"
            },
            items: [
              {
                name: "total_client_payout_amount",
                fieldLabel: D.t("Total client payout amount"),
                readOnly: true,
                cls: "system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "total_client_payout_amount_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              },
              {
                xtype: "textfield",
                name: "total_client_payout_amount_transfer_id",
                hidden: true
              },
              {
                xtype: "textfield",
                name: "total_client_payout_amount_hash_id",
                hidden: true
              },
              {
                xtype: "wcn_payment_panel",
                scope: me,
                amount_field: "total_client_payout_amount",
                tag: "Client payout (Cards with withdrawal)",
                name: "total_client_payout_transfer",
                width: 45
              }
            ]
          },
          {
            xtype: "box",
            anchor: "99%",
            html: "<hr>"
          },
          {
            name: "agent_part",
            fieldLabel: D.t("Agent's part"),
            cls: "editable-system-fields",
            margin: "3 3 0 0"
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            defaults: {
              anchor: "99%",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false,
              margin: "3 3 0 0"
            },
            items: [
              {
                name: "agent_fee_amount",
                fieldLabel: D.t("Agent fee amount"),
                readOnly: true,
                cls: "system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "agent_fee_amount_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              },
              {
                xtype: "textfield",
                name: "agent_fee_amount_transfer_id",
                hidden: true
              },
              {
                xtype: "textfield",
                name: "agent_fee_amount_hash_id",
                hidden: true
              },
              {
                xtype: "wcn_payment_panel",
                scope: me,
                amount_field: "agent_fee_amount",
                tag: "Agent payout (Cards with withdrawal)",
                name: "agent_fee_transfer",
                width: 45
              }
            ]
          },
          {
            xtype: "combo",
            valueField: "abbr",
            displayField: "abbr",
            forceSelection: true,
            queryMode: "local",
            store: {
              fields: ["abbr"],
              data: [{ abbr: "USDT" }, { abbr: "USTR" }]
            },
            keyNavEnabled: true,
            hideTrigger: false,
            name: "agent_payout_currency",
            fieldLabel: D.t("Agent payout currency"),
            editable: false,
            margin: "3 3 0 0",
            hidden: true
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            name: "swap_fee_panel",
            hidden: true,
            defaults: { margin: "5 3 0 0" },
            items: [
              {
                name: "swap_fee",
                fieldLabel: D.t("Swap fee"),
                readOnly: true,
                cls: "system-fields",
                labelWidth: 160,
                xtype: "numberfield",
                keyNavEnabled: false,
                hideTrigger: true,
                mouseWheelEnabled: false,
                flex: 1
              },
              {
                xtype: "textfield",
                name: "swap_fee_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            name: "agent_swap_amount_panel",
            hidden: true,
            defaults: { margin: "3 3 0 0" },
            items: [
              {
                name: "agent_swap_amount",
                fieldLabel: D.t("Agent swap amount"),
                readOnly: true,
                cls: "system-fields",
                labelWidth: 160,
                xtype: "numberfield",
                keyNavEnabled: false,
                hideTrigger: true,
                mouseWheelEnabled: false,
                flex: 1
              },
              {
                xtype: "textfield",
                name: "agent_swap_amount_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              },
              {
                xtype: "textfield",
                name: "agent_swap_amount_transfer_id",
                hidden: true
              },
              {
                xtype: "textfield",
                name: "agent_swap_amount_hash_id",
                hidden: true
              },
              {
                xtype: "wcn_payment_panel",
                scope: me,
                amount_field: "agent_swap_amount",
                tag: "Agent swap (Cards with withdrawal)",
                name: "agent_swap_amount_transfer",
                width: 45
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            defaults: { margin: "3 3 0 0" },
            name: "received_from_swap_panel",
            hidden: true,
            items: [
              {
                name: "received_from_swap",
                fieldLabel: D.t("Received from swap"),
                labelWidth: 160,
                xtype: "numberfield",
                keyNavEnabled: false,
                hideTrigger: true,
                mouseWheelEnabled: false,
                flex: 1
              },
              {
                xtype: "textfield",
                name: "received_from_swap_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            name: "agent_amount_panel",
            hidden: true,
            defaults: { margin: "3 3 0 0" },
            items: [
              {
                name: "agent_amount",
                fieldLabel: D.t("Agent payout amount"),
                readOnly: true,
                cls: "system-fields",
                labelWidth: 160,
                xtype: "numberfield",
                keyNavEnabled: false,
                hideTrigger: true,
                mouseWheelEnabled: false,
                flex: 1
              },
              {
                xtype: "textfield",
                name: "agent_amount_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              },
              {
                xtype: "textfield",
                name: "agent_amount_transfer_id",
                hidden: true
              },
              {
                xtype: "textfield",
                name: "agent_amount_hash_id",
                hidden: true
              },
              {
                xtype: "wcn_payment_panel",
                scope: me,
                amount_field: "agent_amount",
                tag: "Agent payout (Cards with withdrawal)",
                name: "agent_amount_transfer",
                width: 45
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            defaults: { margin: "3 3 0 0" },
            name: "swap_margin_panel",
            hidden: true,
            items: [
              {
                name: "swap_margin",
                fieldLabel: D.t("Swap margin"),
                readOnly: true,
                cls: "system-fields",
                labelWidth: 160,
                xtype: "numberfield",
                keyNavEnabled: false,
                hideTrigger: true,
                mouseWheelEnabled: false,
                flex: 1
              },
              {
                xtype: "textfield",
                name: "swap_margin_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            xtype: "box",
            anchor: "99%",
            html: "<hr>"
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            defaults: {
              anchor: "99%",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false,
              margin: "3 3 0 0"
            },
            items: [
              {
                name: "our_profit",
                fieldLabel: D.t("Our profit amount"),
                readOnly: true,
                cls: "system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "our_profit_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            name: "our_charges_panel",
            xtype: "panel",
            title: D.t("Our charges"),
            tools: [
              {
                xtype: "button",
                iconCls: "x-fa fa-plus",
                action: "add_charge"
              }
            ],
            layout: "anchor",
            items: []
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            defaults: { margin: "3 3 0 0" },
            name: "our_profit_netto_panel",
            items: [
              {
                name: "our_netto_profit",
                fieldLabel: D.t("Our profit netto"),
                readOnly: true,
                cls: "system-fields",
                labelWidth: 160,
                xtype: "numberfield",
                keyNavEnabled: false,
                hideTrigger: true,
                mouseWheelEnabled: false,
                flex: 1
              },
              {
                xtype: "textfield",
                name: "our_netto_profit_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              },
              {
                xtype: "textfield",
                name: "our_netto_profit_transfer_id",
                hidden: true
              },
              {
                xtype: "textfield",
                name: "our_netto_profit_hash_id",
                hidden: true
              },
              {
                xtype: "wcn_payment_panel",
                scope: me,
                amount_field: "our_netto_profit",
                tag: "Our payout (Cards with withdrawal)",
                name: "our_netto_profit_transfer",
                width: 45
              }
            ]
          }
        ]
      },
      this.buildTrancheCalculationPanel()
    ];
  },

  buildTrancheCalculationPanel() {
    let me = this;
    return {
      xtype: "form",
      layout: "anchor",
      hidden: true,
      height: Math.floor(Ext.Element.getViewportHeight() * 0.55),
      scrollable: {
        y: true
      },
      name: "tranche_details_panel",
      title: D.t("Tranche details"),
      tools: [
        {
          xtype: "button",
          type: "close",
          iconCls: "x-fa fa-close",
          listeners: {
            click: async () => {
              await me.controller.closeTranche(me);
            }
          }
        }
      ],
      defaults: {
        anchor: "99%",
        labelWidth: 160,
        xtype: "numberfield",
        keyNavEnabled: false,
        hideTrigger: true,
        mouseWheelEnabled: false
      },
      items: [
        {
          xtype: "textfield",
          name: "tranche_id",
          hidden: true
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: { margin: "3 3 0 0" },
          items: [
            {
              name: "amount_tranche",
              fieldLabel: D.t("Amount"),
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false,
              flex: 1
            },
            {
              xtype: "textfield",
              name: "amount_tranche_currency",
              readOnly: true,
              cls: "system-fields",
              width: 60
            }
          ]
        },
        {
          name: "client_rate_tranche",
          decimalPrecision: 99,
          fieldLabel: D.t("Client rate"),
          margin: "3 3 0 0"
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: { margin: "3 3 0 0" },
          items: [
            {
              name: "client_amount_brutto_tranche",
              fieldLabel: D.t("Client amount brutto"),
              readOnly: true,
              cls: "system-fields",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false,
              flex: 1
            },
            {
              xtype: "textfield",
              name: "client_amount_brutto_tranche_currency",
              readOnly: true,
              cls: "system-fields",
              width: 60
            }
          ]
        },
        {
          name: "our_rate_tranche",
          fieldLabel: D.t("Our rate"),
          decimalPrecision: 99,
          margin: "3 3 0 0"
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: { margin: "3 3 0 0" },
          items: [
            {
              name: "to_currency_amount_tranche",
              fieldLabel: D.t("Working currency amount"),
              readOnly: true,
              cls: "system-fields",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false,
              flex: 1
            },
            {
              xtype: "textfield",
              name: "to_currency_amount_tranche_currency",
              readOnly: true,
              cls: "system-fields",
              width: 60
            }
          ]
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: { margin: "3 3 0 0" },
          items: [
            {
              name: "rate_delta_profit_tranche",
              fieldLabel: D.t("Rate delta profit"),
              readOnly: true,
              cls: "system-fields",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false,
              flex: 1
            },
            {
              xtype: "textfield",
              name: "rate_delta_profit_tranche_currency",
              readOnly: true,
              cls: "system-fields",
              width: 60
            }
          ]
        },
        { name: "fee_percent_tranche", hidden: true },
        ,
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: { margin: "3 3 0 0" },
          items: [
            {
              name: "fee_amount_tranche",
              fieldLabel: D.t("Fee amount"),
              readOnly: true,
              cls: "system-fields",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false,
              flex: 1
            },
            {
              xtype: "textfield",
              name: "fee_amount_tranche_currency",
              readOnly: true,
              cls: "system-fields",
              width: 60
            }
          ]
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: { margin: "3 3 0 0" },
          items: [
            {
              name: "client_amount_netto_tranche",
              fieldLabel: D.t("Client amount netto"),
              readOnly: true,
              cls: "system-fields",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false,
              flex: 1
            },
            {
              xtype: "textfield",
              name: "client_amount_netto_tranche_currency",
              readOnly: true,
              cls: "system-fields",
              width: 60
            }
          ]
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: { margin: "3 3 0 0" },
          items: [
            {
              name: "total_tranche_profit",
              fieldLabel: D.t("Total tranche profit"),
              readOnly: true,
              cls: "system-fields",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false,
              flex: 1
            },
            {
              xtype: "textfield",
              name: "total_tranche_profit_currency",
              readOnly: true,
              cls: "system-fields",
              width: 60
            }
          ]
        }
      ]
    };
  },
  getAdditionalFields() {
    let fields = [
      "from_currency",
      "to_currency",
      "fee_percent",
      "total_client_payout_amount",
      "total_client_payout_amount_currency",
      "agent_fee_amount",
      "agent_fee_amount_currency",
      "our_profit",
      "our_profit_currency",
      "total_client_payout_amount_transfer_id",
      "agent_fee_amount_transfer_id",
      "total_client_payout_amount_hash_id",
      "agent_fee_amount_hash_id",
      "agent_part",
      "agent_payout_currency",
      "swap_fee",
      "swap_fee_currency",
      "agent_swap_amount",
      "agent_swap_amount_currency",
      "agent_swap_amount_transfer_id",
      "agent_swap_amount_hash_id",
      "agent_amount",
      "agent_amount_currency",
      "agent_amount_transfer_id",
      "agent_amount_hash_id",
      "our_netto_profit",
      "our_netto_profit_currency",
      "our_netto_profit_transfer_id",
      "our_netto_profit_hash_id",
      "received_from_swap",
      "received_from_swap_currency",
      "swap_margin",
      "swap_margin_currency"
    ];
    fields = fields.concat(
      this.controller.getGeneratedFields("our_charges_panel")
    );
    return fields;
  },
  getTrancheFields() {
    return ["amount_tranche", "client_rate_tranche", "delta"];
  }
});
