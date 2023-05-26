Ext.define("Crm.modules.orders.view.orderTypes.CardsWithWithdrawalFiat", {
  extend: "Crm.modules.orders.view.orderTypes.BaseTypesContainer",

  controllerCls:
    "Crm.modules.orders.view.orderTypes.CardsWithWithdrawalFiatController",

  buildItems() {
    let me = this;
    return [
      {
        xtype: "form",
        layout: "anchor",
        name: "order_totals_panel",
        height: Math.floor(Ext.Element.getViewportHeight() * 0.55),
        scrollable: {
          y: true
        },
        title: D.t("Order totals"),
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
            xtype: "fieldcontainer",
            layout: "hbox",
            defaults: { margin: "3 3 0 0" },
            items: [
              {
                name: "total_our_amount",
                fieldLabel: D.t("Total our amount"),
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
                name: "total_our_amount_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          // {
          //   name: "delta",
          //   fieldLabel: D.t("Rate delta,%"),
          //   decimalPrecision: 99,
          //   cls: "editable-system-fields",
          //   margin: "0 3 0 0"
          // },
          {
            name: "fee_percent",
            fieldLabel: D.t("Fee, %"),
            decimalPrecision: 99,
            cls: "editable-system-fields",
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
            defaults: { margin: "3 3 0 0" },
            items: [
              {
                name: "total_client_amount",
                fieldLabel: D.t("Total client amount brutto"),

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
                name: "total_client_amount_currency",
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
                name: "total_fee",
                fieldLabel: D.t("Total fee"),
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
                name: "total_fee_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            defaults: {
              margin: "3 3 0 0"
            },
            items: [
              {
                name: "client_amount_netto",
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
                name: "client_amount_netto_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              },
              {
                xtype: "textfield",
                name: "client_amount_netto_transfer_id",
                hidden: true
              },
              {
                xtype: "textfield",
                name: "client_amount_netto_hash_id",
                hidden: true
              },
              {
                xtype: "wcn_payment_panel",
                scope: me,
                tag: "Client payout (Cards with withdrawal fiat)",
                amount_field: "client_amount_netto",
                name: "client_amount_netto_transfer",
                width: 45
              }
            ]
          },
          {
            xtype: "combo",
            valueField: "abbr",
            margin: "3 3 0 0",
            displayField: "abbr",
            store: Ext.create("Core.data.ComboStore", {
              dataModel: Ext.create(
                "Crm.modules.currency.model.ActiveCurrencyModel"
              ),
              fieldSet: ["abbr"],
              scope: this
            }),
            keyNavEnabled: true,
            hideTrigger: false,
            name: "client_currency",
            fieldLabel: D.t("Client payout currency"),
            editable: false
          },
          {
            name: "our_rate",
            fieldLabel: D.t("Our rate for client payout"),
            decimalPrecision: 99,
            hidden: true,
            margin: "3 3 0 0"
          },
          {
            name: "client_rate",
            fieldLabel: D.t("Client payout rate"),
            decimalPrecision: 99,
            hidden: true,
            margin: "3 3 0 0"
          },
          {
            name: "client_payout_rate_delta",
            fieldLabel: D.t("Client payout rate delta"),
            decimalPrecision: 99,
            readOnly: true,
            hidden: true,
            cls: "system-fields",
            margin: "3 3 0 0"
          },
          {
            name: "our_rate_client_payout",
            xtype: "numberfield",
            hidden: true,
            flex: 1
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            name: "client_payout_panel",
            hidden: true,
            defaults: {
              margin: "3 3 0 0"
            },
            items: [
              {
                name: "client_payout",
                fieldLabel: D.t("Final client payout amount"),
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
                name: "client_payout_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            name: "client_currency_conversion_profit",
            hidden: true,
            defaults: {
              margin: "3 3 0 0"
            },
            items: [
              {
                name: "client_currency_conversion_profit_amount",
                fieldLabel: D.t("Conversion profit"),
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
                name: "client_currency_conversion_profit_amount_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            name: "working_currency_conversion_profit",
            hidden: true,
            defaults: {
              margin: "3 3 0 0"
            },
            items: [
              {
                name: "working_currency_conversion_profit_amount",
                fieldLabel: D.t("Conversion profit"),
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
                name: "working_currency_conversion_profit_amount_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            name: "total_conversion_amount_netto",
            hidden: true,
            defaults: {
              margin: "3 3 0 0"
            },
            items: [
              {
                name: "total_conversion_amount_netto_profit",
                fieldLabel: D.t("Final client amount netto"),
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
                name: "total_conversion_amount_netto_profit_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              },
              {
                xtype: "textfield",
                name: "total_conversion_amount_netto_profit_transfer_id",
                hidden: true
              },
              {
                xtype: "textfield",
                name: "total_conversion_amount_netto_profit_hash_id",
                hidden: true
              },
              {
                xtype: "wcn_payment_panel",
                scope: me,
                hidden: true,
                amount_field: "total_conversion_amount_netto_profit",
                tag: "Client payout (Cards with withdrawal fiat)",
                name: "total_conversion_amount_netto_profit_transfer",
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
            xtype: "fieldcontainer",
            layout: "hbox",
            defaults: {
              margin: "3 3 0 0"
            },
            items: [
              {
                name: "total_profit",
                fieldLabel: D.t("Total profit"),
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
                name: "total_profit_currency",
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
            name: "agent_part",
            fieldLabel: D.t("Agent's part"),
            cls: "editable-system-fields",
            margin: "3 3 0 0"
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            defaults: {
              margin: "3 3 0 0"
            },
            items: [
              {
                name: "agent_fee",
                fieldLabel: D.t("Agent fee"),
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
                name: "agent_fee_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              },
              {
                xtype: "textfield",
                name: "agent_fee_transfer_id",
                hidden: true
              },
              {
                xtype: "textfield",
                name: "agent_fee_hash_id",
                hidden: true
              },
              {
                xtype: "wcn_payment_panel",
                scope: me,
                amount_field: "agent_fee",
                tag: "Agent payout (Cards with withdrawal fiat)",
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
            store: Ext.create("Core.data.ComboStore", {
              dataModel: Ext.create(
                "Crm.modules.currency.model.ActiveCurrencyModel"
              ),
              fieldSet: ["abbr"],
              scope: this
            }),
            keyNavEnabled: true,
            hideTrigger: false,
            name: "agent_currency",
            fieldLabel: D.t("Agent payout currency"),
            editable: false,
            margin: "3 3 0 0"
          },
          {
            name: "agent_rate",
            fieldLabel: D.t("Agent payout rate"),
            decimalPrecision: 99,
            hidden: true,
            margin: "3 3 0 0"
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
                tag: "Agent swap (Cards with withdrawal fiat)",
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
                tag: "Agent payout (Cards with withdrawal fiat)",
                name: "agent_amount_transfer",
                width: 45,
                hidden: true
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
            defaults: { margin: "3 3 0 0" },
            items: [
              {
                name: "our_profit",
                fieldLabel: D.t("Our profit"),
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
                tag: "Our payout (Cards with withdrawal fiat)",
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
          name: "client_rate_tranche",
          fieldLabel: D.t("Client rate"),
          decimalPrecision: 99,
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
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: { margin: "3 3 0 0" },
          items: [
            {
              name: "service_fee_tranche",
              fieldLabel: D.t("Service fee"),
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
              name: "service_fee_tranche_currency",
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
        },
        {
          name: "rate_delta_tranche",
          fieldLabel: D.t("Rate delta"),
          readOnly: true,
          cls: "system-fields",
          margin: "3 3 0 0"
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
        }
      ]
    };
  },
  getAdditionalFields() {
    let fields = [
      "from_currency",
      "to_currency",
      "client_currency",
      "our_rate",
      "client_rate",
      "client_payout",
      "agent_fee",
      "agent_currency",
      "agent_rate",
      "agent_amount",
      "our_profit",
      "our_profit_currency",
      "total_our_amount",
      "total_client_amount",
      "total_fee",
      "total_profit",
      "client_amount_netto",
      "client_amount_netto_transfer_id",
      "client_amount_netto_hash_id",
      "agent_fee_transfer_id",
      "agent_fee_hash_id",
      "agent_part",
      "delta",
      "fee_percent",
      "swap_fee",
      "swap_fee_currency",
      "agent_swap_amount",
      "agent_swap_amount_currency",
      "our_netto_profit",
      "our_netto_profit_currency",
      "agent_swap_amount_transfer_id",
      "agent_swap_amount_hash_id",
      "agent_amount_transfer_id",
      "agent_amount_hash_id",
      "our_netto_profit_transfer_id",
      "our_netto_profit_hash_id",
      "received_from_swap",
      "received_from_swap_currency",
      "swap_margin",
      "swap_margin_currency",
      "agent_amount_currency",
      "total_profit_currency",
      "total_our_amount_currency",
      "total_client_amount_currency",
      "total_fee_currency",
      "client_amount_netto_currency",
      "client_payout_currency",
      "agent_fee_currency",
      "client_currency_conversion_profit_amount",
      "client_currency_conversion_profit_amount_currency",
      "working_currency_conversion_profit_amount",
      "working_currency_conversion_profit_amount_currency",
      "total_conversion_amount_netto_profit",
      "total_conversion_amount_netto_profit_currency",
      "our_rate_client_payout",
      "client_payout_rate_delta"
    ];
    fields = fields.concat(
      this.controller.getGeneratedFields("our_charges_panel")
    );
    return fields;
  },
  getTrancheFields() {
    return ["amount_tranche", "our_rate_tranche"];
  }
});
