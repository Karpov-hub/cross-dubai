Ext.define("Crm.modules.orders.view.orderTypes.CryptoFiatWithRate", {
  extend: "Crm.modules.orders.view.orderTypes.BaseTypesContainer",

  controllerCls:
    "Crm.modules.orders.view.orderTypes.CryptoFiatWithRateController",

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
            xtype: "textfield",
            hidden: true,
            name: "_client_action_type"
          },
          {
            xtype: "textfield",
            hidden: true,
            name: "_which_percent_bigger"
          },
          {
            xtype: "textfield",
            hidden: true,
            name: "_formula"
          },
          {
            xtype: "segmentedbutton",
            name: "client_action_type",
            items: [
              {
                text: D.t("Client sell"),
                value: "sell"
              },
              {
                text: D.t("Client buy"),
                value: "buy"
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            defaults: {
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false,
              margin: "3 3 0 0"
            },
            items: [
              {
                name: "order_amount",
                fieldLabel: D.t("Order amount"),
                flex: 1
              },
              {
                xtype: "combo",
                valueField: "abbr",
                displayField: "abbr",
                queryMode: "local",
                editable: false,
                keyNavEnabled: true,
                hideTrigger: false,
                name: "from_currency",
                store: Ext.create("Core.data.ComboStore", {
                  dataModel: Ext.create(
                    "Crm.modules.currency.model.ActiveCurrencyModel"
                  ),
                  fieldSet: ["abbr"],
                  scope: this
                }),
                width: 80
              }
            ]
          },
          {
            fieldLabel: D.t("Counter currency"),
            xtype: "combo",
            valueField: "abbr",
            displayField: "abbr",
            queryMode: "local",
            editable: false,
            keyNavEnabled: true,
            hideTrigger: false,
            name: "to_currency",
            store: Ext.create("Core.data.ComboStore", {
              dataModel: Ext.create(
                "Crm.modules.currency.model.ActiveCurrencyModel"
              ),
              fieldSet: ["abbr"],
              scope: this
            }),
            margin: "3 3 0 0"
          },
          {
            name: "cross_rate",
            fieldLabel: D.t("Cross rate"),
            decimalPrecision: 99,
            defaultValue: 1,
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
                name: "swap_fee",
                fieldLabel: D.t("Platform swap fee"),
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
            xtype: "segmentedbutton",
            name: "which_percent_bigger",
            hidden: true,
            items: [
              {
                text: D.t("Our % bigger"),
                value: "our"
              },
              {
                text: D.t("Client % bigger"),
                value: "client"
              }
            ]
          },
          {
            xtype: "segmentedbutton",
            name: "formula",
            hidden: true,
            items: [
              {
                text: D.t("Amount * Rate"),
                value: "amountmulrate"
              },
              {
                text: D.t("Amount * 100 / Rate"),
                value: "amountmulhundreddelrate"
              }
            ]
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
                name: "cross_rate_amount",
                fieldLabel: D.t("Amount after cross-rate"),
                cls: "editable-system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "cross_rate_amount_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            name: "client_rate",
            fieldLabel: D.t("Client tariff, %"),
            decimalPrecision: 99,
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
                name: "client_amount_before_charges",
                fieldLabel: D.t("Client amount"),
                cls: "editable-system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "client_amount_before_charges_currency",
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
                name: "client_amount",
                fieldLabel: D.t("Client amount netto"),
                cls: "editable-system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "client_amount_currency",
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
                name: "delivery_fee",
                fieldLabel: D.t("Delivery fee"),
                flex: 1
              },
              {
                name: "delivery_fee_currency",
                width: 80,
                xtype: "combo",
                valueField: "abbr",
                displayField: "abbr",
                queryMode: "local",
                editable: false,
                keyNavEnabled: true,
                hideTrigger: false,
                store: Ext.create("Core.data.ComboStore", {
                  dataModel: Ext.create(
                    "Crm.modules.currency.model.ActiveCurrencyModel"
                  ),
                  fieldSet: ["abbr"],
                  scope: this
                })
              }
            ]
          },
          {
            name: "delivery_fee_cross_rate",
            fieldLabel: D.t("Delivery fee cross rate"),
            decimalPrecision: 99,
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
                name: "delivery_fee_after_cross",
                fieldLabel: D.t("Delivery fee"),
                cls: "editable-system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "delivery_fee_after_cross_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            name: "our_rate",
            fieldLabel: D.t("Our tariff, %"),
            decimalPrecision: 99,
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
                name: "our_rate_amount_before_charges",
                fieldLabel: D.t("Our amount"),
                cls: "editable-system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "our_rate_amount_before_charges_currency",
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
                name: "our_rate_amount",
                fieldLabel: D.t("Our amount netto"),
                cls: "editable-system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "our_rate_amount_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            name: "our_payout_amount_panel",
            xtype: "panel",
            tag: "Payout (Crypto-fiat with tariff delta)",
            title: D.t("Payout"),
            tools: [
              {
                xtype: "button",
                iconCls: "x-fa fa-plus",
                action: "add_payout_amount"
              }
            ],
            layout: "anchor",
            items: []
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
                fieldLabel: D.t("Our profit"),
                cls: "editable-system-fields",
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
                name: "our_netto_profit",
                fieldLabel: D.t("Our netto profit"),
                cls: "editable-system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "our_netto_profit_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              },
              ,
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
                tag: "Our payout (Crypto-fiat with tariff delta)",
                name: "our_netto_profit_transfer",
                width: 45
              }
            ]
          },
          {
            xtype: "textarea",
            labelAlign: "top",
            name: "note",
            fieldLabel: D.t("Note"),
            grow: true,
            margin: "3 3 0 0"
          }
        ]
      }
    ];
  },

  getAdditionalFields() {
    let fields = [
      "order_amount",
      "from_currency",
      "to_currency",
      "cross_rate",
      "cross_rate_amount",
      "cross_rate_amount_currency",
      "client_rate",
      "client_amount",
      "client_amount_currency",
      "delivery_fee",
      "delivery_fee_currency",
      "our_rate",
      "our_rate_amount",
      "our_rate_amount_currency",
      "client_action_type",
      "which_percent_bigger",
      "formula",
      "_client_action_type",
      "_which_percent_bigger",
      "_formula",
      "swap_fee",
      "swap_fee_currency",
      "delivery_fee_cross_rate",
      "delivery_fee_after_cross",
      "delivery_fee_after_cross_currency",
      "client_amount_before_charges",
      "client_amount_before_charges_currency",
      "our_rate_amount_before_charges",
      "our_rate_amount_before_charges_currency"
    ];
    fields = fields.concat(
      this.controller.getGeneratedFields("our_payout_amount_panel")
    );
    fields = fields.concat(
      this.controller.getGeneratedFields("our_charges_panel")
    );
    fields.push(
      "our_profit",
      "our_profit_currency",
      "our_netto_profit",
      "our_netto_profit_currency",
      "our_netto_profit_transfer_id",
      "our_netto_profit_hash_id",
      "note"
    );
    return fields;
  },
  disableAdditionalOrderFields() {
    return this.controller.disableAdditionalOrderFields(
      this.getAdditionalFields()
    );
  }
});
