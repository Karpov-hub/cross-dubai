Ext.define("Crm.modules.orders.view.WCNOrderForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Order: {no} {title_order_type}"),
  controllerCls: "Crm.modules.orders.view.WCNOrderFormController",
  formHeight: Math.floor(Ext.Element.getViewportHeight() * 0.9),
  formWidth: Math.floor(Ext.Element.getViewportWidth() * 0.9),
  formMargin: 0,

  buildItems() {
    return {
      xtype: "tabpanel",
      layout: "anchor",
      items: [
        {
          xtype: "panel",
          margin: 5,
          title: D.t("CE Order"),
          iconCls: "x-fa fa-calculator",
          height: this.formHeight,
          width: this.formWidth,
          layout: "border",
          items: [this.buildOrderDataPanel(), this.buildTranchesGridPanel()]
        },
        {
          xtype: "panel",
          margin: 5,
          layout: "anchor",
          iconCls: "x-fa fa-list",
          title: D.t("Report additional fields"),
          items: [
            {
              xtype: "fieldcontainer",
              layout: "anchor",
              defaults: {
                xtype: "fieldcontainer",
                layout: "hbox"
              },
              items: [
                {
                  defaults: {
                    xtype: "textfield",
                    labelWidth: 130
                  },
                  items: [
                    {
                      fieldLabel: D.t("ERC 20 address"),
                      name: "report_erc_address",
                      flex: 1
                    },
                    {
                      name: "report_erc_address_currency",
                      width: 120
                    }
                  ]
                },
                {
                  defaults: {
                    xtype: "textfield",
                    labelWidth: 130
                  },
                  items: [
                    {
                      fieldLabel: D.t("TRC 20 address"),
                      name: "report_trc_address",
                      flex: 1
                    },
                    {
                      name: "report_trc_address_currency",
                      width: 120
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  },
  buildOrderDataPanel() {
    return {
      xtype: "fieldcontainer",
      height: this.formHeight,
      width: "27%",
      layout: "border",
      region: "center",
      items: [this.buildGeneralPanel(), this.buildTrancheDetailsPanel()]
    };
  },
  buildTranchesGridPanel() {
    return {
      xtype: "panel",
      height: this.height,
      split: true,
      width: "73%",
      layout: "border",
      region: "east",
      items: [this.buildTranchesPanel(), this.buildTransfersPanel()]
    };
  },
  buildGeneralPanel() {
    return {
      xtype: "panel",
      height: Math.floor(this.formHeight * 0.2),
      scrollable: {
        y: true
      },
      layout: "anchor",
      region: "north",
      defaults: {
        anchor: "99%"
      },
      items: [
        {
          xtype: "textfield",
          name: "id",
          hidden: true
        },
        Ext.create("Core.form.DependedCombo", {
          hidden: true,
          valueField: "id",
          displayField: "legalname",
          name: "merchant",
          dataModel: "Crm.modules.accountHolders.model.UsersModel",
          fieldSet: "id,legalname,email,realm",
          allowBlank: false,
          fieldLabel: D.t("Group"),
          readOnly: true
        }),
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          items: [
            {
              xtype: "textfield",
              name: "short_id",
              fieldLabel: D.t("ID"),
              readOnly: true,
              flex: 1,
              margin: "0 3 0 0"
            },
            {
              xtype: "button",
              iconCls: "x-fa fa-copy",
              tooltip: D.t("Copy ID to clipboard"),
              action: "copy_short_id_to_clipboard",
              width: 30
            }
          ]
        },
        Ext.create("Ext.form.ComboBox", {
          name: "organisation",
          fieldLabel: D.t("Merchant"),
          valueField: "id",
          displayField: "name",
          editable: !Ext.platformTags.phone,
          queryMode: "local",
          store: Ext.create("Core.data.ComboStore", {
            dataModel: "Crm.modules.merchants.model.MerchantsModel",
            fieldSet: "id,user_id,name",
            scope: this
          })
        }),
        {
          xtype: "textfield",
          fieldLabel: D.t("Order No"),
          name: "no",
          cls: "system-fields",
          readOnly: true
        },
        {
          xtype: "combo",
          displayField: "name",
          fieldLabel: D.t("Order type"),
          valueField: "type",
          editable: false,
          name: "order_type",
          store: {
            fields: ["type", "name"],
            data: [
              {
                type: "StartFinal",
                name: D.t("Start/Final")
              },
              {
                type: "CardsWithWithdrawalFiat",
                name: D.t("Cards with withdrawal fiat")
              },
              {
                type: "CardsWithWithdrawal",
                name: D.t("Cards with withdrawal")
              },
              {
                type: "CryptoFiatWithRate",
                name: D.t("Crypto-fiat with tariff delta")
              },
              {
                type: "CryptoFiatWithExchangeRateDelta",
                name: D.t("Crypto-fiat with exchange rate delta")
              },
              {
                type: "FiatCryptoWithTariffDelta",
                name: D.t("Fiat-crypto with tariff delta")
              },
              {
                type: "FiatCryptoWithExchangeRateDelta",
                name: D.t("Fiat-crypto with exchange rate delta")
              }
            ]
          }
        },
        {
          xtype: "xdatefield",
          fieldLabel: D.t("Date"),
          cls: "system-fields",
          name: "ctime",
          submitFormat: "Y-m-d H:i:s",
          format: D.t("d.m.Y H:i:s"),
          readOnly: true
        },
        {
          xtype: "textfield",
          fieldLabel: D.t("Status"),
          cls: "system-fields",
          name: "status",
          readOnly: true
        },
        {
          xtype: "checkbox",
          name: "has_transfers",
          hidden: true
        }
      ]
    };
  },

  buildTrancheDetailsPanel() {
    return {
      xtype: "panel",
      layout: "anchor",
      region: "center",
      name: "tranche_panel",
      items: []
    };
  },

  buildTranchesPanel() {
    return {
      name: "tranche_grid_panel",
      xtype: "panel",
      height: Math.floor(this.formHeight * 0.5),
      layout: "anchor",
      region: "north",
      split: true,
      items: [
        Ext.create("Crm.modules.orders.view.TranchesGrid", {
          observe: [{ property: "ref_id", param: "id" }],
          name: "tranches_grid",
          title: null,
          iconCls: null,
          scope: this
        })
      ]
    };
  },
  buildTransfersPanel() {
    return {
      xtype: "panel",
      layout: "anchor",
      split: true,
      region: "center",
      items: [
        {
          xtype: "tabpanel",
          defaults: {
            xtype: "panel",
            layout: "fit"
          },
          items: [
            {
              title: D.t("Approved"),
              items: [
                Ext.create("Crm.modules.orders.view.TransfersGrid", {
                  observe: [{ property: "ref_id", param: "id" }],
                  title: null,
                  iconCls: null,
                  scope: this,
                  from_calc: true
                })
              ]
            },
            {
              title: D.t("Waiting for approval"),
              items: [
                Ext.create(
                  "Crm.modules.transfers.view.OrderNotApprovedTransfersGrid",
                  {
                    observe: [{ property: "ref_id", param: "id" }],
                    title: null,
                    iconCls: null,
                    scope: this,
                    from_calc: true
                  }
                )
              ]
            }
          ]
        }
      ]
    };
  },
  buildButtons() {
    let buttons = this.callParent(arguments);
    buttons.shift();
    buttons.unshift(
      {
        text: D.t("Generate report"),
        iconCls: "x-fa fa-download",
        disabled: true,
        action: "generate_report"
      },
      {
        text: D.t("Generate report for admin"),
        iconCls: "x-fa fa-download",
        hidden: true,
        disabled: true,
        action: "generate_admin_report"
      },
      {
        text: D.t("Generate report for client"),
        iconCls: "x-fa fa-download",
        hidden: true,
        disabled: true,
        action: "generate_client_report"
      }
    );
    return buttons;
  }
});
