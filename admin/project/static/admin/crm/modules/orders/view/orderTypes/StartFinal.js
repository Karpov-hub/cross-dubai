Ext.define("Crm.modules.orders.view.orderTypes.StartFinal", {
  extend: "Crm.modules.orders.view.orderTypes.BaseTypesContainer",

  controllerCls: "Crm.modules.orders.view.orderTypes.StartFinalController",

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
            name: "_order_subtype"
          },
          {
            xtype: "segmentedbutton",
            name: "order_subtype",
            items: [
              {
                text: D.t("To usdt final"),
                value: "to_usdt_final"
              },
              {
                text: D.t("From usdt final"),
                value: "from_usdt_final"
              },
              {
                text: D.t("To usdt start"),
                value: "to_usdt_start"
              },
              {
                text: D.t("From usdt start"),
                value: "from_usdt_start"
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            margin: "3 3 0 0",
            defaults: {
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false
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
            fieldLabel: D.t("To currency"),
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
            name: "client_rate",
            fieldLabel: D.t("Platform rate"),
            decimalPrecision: 99,
            margin: "3 3 0 0"
          },
          {
            name: "our_rate",
            fieldLabel: D.t("Our rate"),
            decimalPrecision: 99,
            margin: "3 3 0 0"
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            margin: "3 3 0 0",
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
                name: "delivery_fee",
                fieldLabel: D.t("Delivery fee"),
                flex: 1
              },
              {
                xtype: "textfield",
                name: "delivery_fee_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            margin: "3 3 0 0",
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
                name: "delivery_fee_after_cross",
                fieldLabel: D.t("Final delivery fee"),
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
            xtype: "fieldcontainer",
            layout: "hbox",
            margin: "3 3 0 0",
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
                name: "amount_to_client",
                fieldLabel: D.t("Client amount"),
                cls: "editable-system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "amount_to_client_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            margin: "3 3 0 0",
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
                name: "amount_from_client",
                fieldLabel: D.t("Received client amount"),
                cls: "editable-system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "amount_from_client_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            margin: "3 3 0 0",
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
                name: "amount_to_platform",
                fieldLabel: D.t("Platform amount"),
                cls: "editable-system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "amount_to_platform_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },

          {
            xtype: "fieldcontainer",
            layout: "hbox",
            margin: "3 3 0 0",
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
                name: "amount_from_platform",
                fieldLabel: D.t("Received platform amount"),
                cls: "editable-system-fields",
                flex: 1
              },
              {
                xtype: "textfield",
                name: "amount_from_platform_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            margin: "3 3 10 0",
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
            xtype: "textfield",
            hidden: true,
            name: "_recalculation"
          },
          {
            xtype: "segmentedbutton",
            hidden: true,
            name: "from_usdt_start_recalculation",
            items: [
              {
                text: D.t("None"),
                value: "none"
              },
              {
                text: D.t("From usdt start"),
                value: "from_usdt_start"
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            name: "from_usdt_start_panel",
            hidden: true,
            layout: "anchor",
            defaults: {
              anchor: "100%",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false
            },
            items: []
          },
          {
            xtype: "segmentedbutton",
            hidden: true,
            name: "to_usdt_final_recalculation",
            items: [
              {
                text: D.t("None"),
                value: "none"
              },
              {
                text: D.t("To usdt final"),
                value: "to_usdt_final"
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            name: "to_usdt_final_panel",
            layout: "anchor",
            hidden: true,
            defaults: {
              anchor: "100%",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false
            },
            items: []
          },

          {
            name: "payout_amount_panel",
            xtype: "panel",
            tag: "Payout (Start/Final)",
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
            xtype: "checkbox",
            name: "is_penalty",
            inputValue: true,
            uncheckedValue: false,
            fieldLabel: D.t("Ended with penalty")
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            margin: "3 3 10 0",
            defaults: {
              anchor: "99%",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              hidden: true,
              mouseWheelEnabled: false
            },
            items: [
              {
                name: "client_penalty",
                fieldLabel: D.t("Client penalty"),
                flex: 1
              },
              {
                xtype: "textfield",
                name: "client_penalty_currency",
                readOnly: true,
                cls: "system-fields",
                width: 60
              }
            ]
          },
          {
            xtype: "fieldcontainer",
            layout: "hbox",
            margin: "3 3 10 0",
            defaults: {
              anchor: "99%",
              labelWidth: 160,
              xtype: "numberfield",
              keyNavEnabled: false,
              hideTrigger: true,
              hidden: true,
              mouseWheelEnabled: false
            },
            items: [
              {
                name: "platform_penalty",
                fieldLabel: D.t("Platform penalty"),
                flex: 1
              },
              {
                xtype: "textfield",
                name: "platform_penalty_currency",
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
                tag: "Our payout (Start/Final)",
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
      "_order_subtype",
      "order_amount",
      "from_currency",
      "to_currency",
      "cross_rate",
      "client_rate",
      "our_rate",
      "delivery_fee",
      "delivery_fee_currency",
      "delivery_fee_after_cross",
      "delivery_fee_after_cross_currency",
      "amount_to_client",
      "amount_to_client_currency",
      "_recalculation",
      "amount_from_client",
      "amount_from_client_currency",
      "amount_to_platform",
      "amount_to_platform_currency",
      "amount_from_platform",
      "amount_from_platform_currency",
      "is_penalty",
      "client_penalty",
      "client_penalty_currency",
      "platform_penalty",
      "platform_penalty_currency",
      "our_profit",
      "our_profit_currency"
    ];
    fields = fields.concat(
      this.controller.getGeneratedFields("payout_amount_panel")
    );
    fields = fields.concat(
      this.controller.getGeneratedFields("our_charges_panel")
    );
    fields.push(
      "our_netto_profit_transfer_id",
      "our_netto_profit_hash_id",
      "our_netto_profit",
      "our_netto_profit_currency",
      "note"
    );
    fields = fields.concat(this.getRecalcFields());
    return fields;
  },
  getRecalcFields() {
    return [
      "recalc_cross_rate",
      "recalc_client_rate",
      "recalc_our_rate",
      "recalc_delivery_fee",
      "recalc_delivery_fee_currency",
      "recalc_delivery_fee_after_cross",
      "recalc_delivery_fee_after_cross_currency",
      "recalc_amount_to_client",
      "recalc_amount_to_client_currency",
      "recalc_amount_from_client",
      "recalc_amount_from_client_currency",
      "recalc_amount_to_platform",
      "recalc_amount_to_platform_currency",
      "recalc_amount_from_platform",
      "recalc_amount_from_platform_currency",
      "recalc_our_profit",
      "recalc_our_profit_currency",
      "recalc_to_currency"
    ];
  },
  disableAdditionalOrderFields() {
    return this.controller.disableAdditionalOrderFields(
      this.getAdditionalFields()
    );
  },

  recalculationFieldsData() {
    return [
      {
        fieldLabel: D.t("To currency"),
        xtype: "combo",
        valueField: "abbr",
        displayField: "abbr",
        queryMode: "local",
        editable: false,
        keyNavEnabled: true,
        hideTrigger: false,
        name: "recalc_to_currency",
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
        name: "recalc_cross_rate",
        fieldLabel: D.t("Cross rate"),
        decimalPrecision: 99,
        defaultValue: 1,
        margin: "3 3 0 0"
      },
      {
        name: "recalc_client_rate",
        fieldLabel: D.t("Platform rate"),
        decimalPrecision: 99,
        margin: "3 3 0 0"
      },
      {
        name: "recalc_our_rate",
        fieldLabel: D.t("Our rate"),
        decimalPrecision: 99,
        margin: "3 3 0 0"
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        margin: "3 3 0 0",
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
            name: "recalc_delivery_fee",
            fieldLabel: D.t("Delivery fee"),
            flex: 1
          },
          {
            xtype: "textfield",
            name: "recalc_delivery_fee_currency",
            readOnly: true,
            cls: "system-fields",
            width: 60
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        margin: "3 3 0 0",
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
            name: "recalc_delivery_fee_after_cross",
            fieldLabel: D.t("Final delivery fee"),
            cls: "editable-system-fields",
            flex: 1
          },
          {
            xtype: "textfield",
            name: "recalc_delivery_fee_after_cross_currency",
            readOnly: true,
            cls: "system-fields",
            width: 60
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        margin: "3 3 0 0",
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
            name: "recalc_amount_to_client",
            fieldLabel: D.t("Client amount"),
            cls: "editable-system-fields",
            flex: 1
          },
          {
            xtype: "textfield",
            name: "recalc_amount_to_client_currency",
            readOnly: true,
            cls: "system-fields",
            width: 60
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        margin: "3 3 0 0",
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
            name: "recalc_amount_from_client",
            fieldLabel: D.t("Received client amount"),
            cls: "editable-system-fields",
            flex: 1
          },
          {
            xtype: "textfield",
            name: "recalc_amount_from_client_currency",
            readOnly: true,
            cls: "system-fields",
            width: 60
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        margin: "3 3 0 0",
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
            name: "recalc_amount_to_platform",
            fieldLabel: D.t("Platform amount"),
            cls: "editable-system-fields",
            flex: 1
          },
          {
            xtype: "textfield",
            name: "recalc_amount_to_platform_currency",
            readOnly: true,
            cls: "system-fields",
            width: 60
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        margin: "3 3 0 0",
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
            name: "recalc_amount_from_platform",
            fieldLabel: D.t("Received platform amount"),
            cls: "editable-system-fields",
            flex: 1
          },
          {
            xtype: "textfield",
            name: "recalc_amount_from_platform_currency",
            readOnly: true,
            cls: "system-fields",
            width: 60
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        margin: "3 3 10 0",
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
            name: "recalc_our_profit",
            fieldLabel: D.t("Our profit"),
            cls: "editable-system-fields",
            flex: 1
          },
          {
            xtype: "textfield",
            name: "recalc_our_profit_currency",
            readOnly: true,
            cls: "system-fields",
            width: 60
          }
        ]
      }
    ];
  }
});
