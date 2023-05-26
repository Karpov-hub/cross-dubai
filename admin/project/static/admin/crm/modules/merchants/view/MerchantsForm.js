Ext.define("Crm.modules.merchants.view.MerchantsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Merchant: {name}"),

  formLayout: "fit",
  formMargin: 0,

  requires: [
    "Ext.form.CheckboxGroup",
    "Core.form.DependedCombo",
    "Ext.window.Toast"
  ],

  controllerCls: "Crm.modules.merchants.view.MerchantsFormController",

  buildItems() {
    return {
      name: "merchants_tabpanel",
      xtype: "tabpanel",
      layout: "fit",
      items: [
        this.buildGeneral(),
        this.buildAccountsPanel(),
        this.buildTariffPanel(),
        // this.buildContractsPanel(),
        this.buildTechPanel(),
        this.buildCampaignsPanel(),
        this.buildTransfers(),
        this.buildOrders(),
        this.buildBankProfile(),
        this.buildNonCustodialWalletsPanel()
      ]
    };
  },

  buildContractsPanel() {
    return {
      name: "contracts_panel",
      xtype: "panel",
      layout: "fit",
      title: D.t("Contracts"),
      items: [
        Ext.create("Crm.modules.contracts.view.ContractsGrid", {
          scope: this,
          observe: [{ property: "owner_id", param: "id" }]
        })
      ]
    };
  },

  buildTariffPanel() {
    return Ext.create("Crm.modules.tariffs.view.TariffSettingsPanel", {
      name: "tariff_panel",
      merchant_accs_search_params: {
        field: "merchant",
        value: this.recordId
      }
    });
  },

  buildTechPanel() {
    return {
      name: "tech_panel",
      xtype: "panel",
      layout: "fit",
      title: D.t("Tech"),
      items: Ext.create("Crm.modules.merchants.view.CustomMerchantsGrid", {
        scope: this,
        observe: [{ property: "merchant_id", param: "id" }]
      })
    };
  },

  buildCampaignsPanel() {
    return {
      name: "campaigns_panel",
      xtype: "panel",
      layout: "fit",
      title: D.t("Campaigns"),
      items: Ext.create("Crm.modules.campaigns.view.CampaignGrid", {
        scope: this,
        observe: [{ property: "merchant_id", param: "id" }]
      })
    };
  },

  buildNonCustodialWalletsPanel() {
    return {
      xtype: "panel",
      action: "free_wallets_panel",
      layout: "fit",
      region: "center",
      cls: "grayTitlePanel",
      title: D.t("Off-system addresses"),
      items: this.freeWalletsGrid
    };
  },

  buildMerchantCategoriesMulticombo() {
    return Ext.create(
      "Crm.modules.merchantCategories.view.merchantCategoriesCombo",
      {
        name: "categories",
        margin: 5,
        fieldLabel: D.t("Categories")
      }
    );
  },

  buildGeneral() {
    this.merchantCombo = Ext.create("Core.form.DependedCombo", {
      labelWidth: 150,
      valueField: "id",
      displayField: "legalname",
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        "{legalname}",
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{legalname}</li>',
        "</tpl></ul>"
      ),
      name: "user_id",
      dataModel: "Crm.modules.accountHolders.model.UsersModel",
      fieldSet: "id,legalname",
      fieldLabel: D.t("Client")
    });

    this.freeWalletsGrid = Ext.create(
      "Crm.modules.nonCustodialWallets.view.MerchantWalletsGrid",
      {
        title: null,
        iconCls: null,
        scope: this,
        observe: [{ property: "merchant_id", param: "id" }]
      }
    );

    return {
      xtype: "panel",
      title: D.t("General"),
      layout: "anchor",
      scrollable: true,
      horizontal: true,
      defaults: {
        xtype: "textfield",
        anchor: "100%",
        margin: 5,
        labelWidth: 150
      },
      items: [
        {
          name: "id",
          hidden: true
        },
        { xtype: "textfield", name: "user_wallets", hidden: true },
        {
          xtype: "textfield",
          name: "monitor_wallets",
          hidden: true
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: {
            flex: 1
          },
          items: [this.merchantCombo]
        },
        {
          name: "name",
          fieldLabel: D.t("Merchant name")
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          labelWidth: 300,
          items: [
            this.buildCountryCombo(),
            this.buildTaxNumberFiled(),
            this.buildVatField()
          ]
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          fieldLabel: D.t("Contacts"),
          defaults: {
            flex: 1,
            xtype: "textfield"
          },
          items: [
            {
              name: "email",
              emptyText: D.t("Email"),
              margin: "0 10 0 0",
              allowBlank: true
            },
            {
              name: "phone",
              emptyText: D.t("Phone"),
              margin: "0 10 0 0",
              allowBlank: true
            },
            {
              name: "website",
              emptyText: D.t("Website")
            }
          ]
        },
        {
          name: "other_websites",
          fieldLabel: D.t("Other websites")
        },
        {
          name: "description",
          fieldLabel: D.t("Description")
        },
        this.buildAddress(),
        {
          name: "additional_info",
          fieldLabel: D.t("Additional info")
        },
        this.buildMerchantCategoriesMulticombo(),
        {
          name: "registration",
          fieldLabel: D.t("Registration")
        },
        {
          name: "registration_info",
          fieldLabel: D.t("Registration Info")
        },
        this.buildAccountsGrid(),
        {
          name: "active",
          xtype: "checkbox",
          fieldLabel: D.t("Activated")
        }
      ]
    };
  },

  buildAccountsGrid() {
    let me = this;
    return {
      xtype: "grid",
      region: "center",
      name: "accounts",
      layout: "fit",
      height: 210,
      width: 450,
      title: "Addresses",
      store: {
        fields: ["address", "id", "id_merchant"],
        data: []
      },
      tbar: [
        {
          iconCls: "x-fa fa-sync",
          action: "update_btn",
          margin: "0 5 0 0"
        }
      ],
      bind: {},
      columns: [
        {
          text: D.t("Crypto address"),
          flex: 1,
          sortable: false,
          dataIndex: "address",
          menuDisabled: true,
          editor: false
        },
        {
          xtype: "actioncolumn",
          width: "25",
          items: [
            {
              iconCls: "x-fa fa-files-o",
              tooltip: D.t("Copy to clipboard"),
              handler: me.controller.copyAddressToClibboard
            }
          ]
        }
      ]
    };
  },

  buildVatField() {
    this.vatCircle = Ext.create("Ext.panel.Panel", {
      region: "center",
      html:
        '<iframe width="25px" height="25px" frameborder="0" style="border: null"></iframe>'
    });

    return {
      xtype: "fieldcontainer",
      layout: "hbox",
      items: [
        {
          name: "vat",
          xtype: "textfield",
          labelWidth: 70,
          flex: 1,
          fieldLabel: D.t("VAT")
        },
        {
          xtype: "button",
          width: 25,
          id: "circle_btn",
          cls: "circle_btn_cls",
          margin: "0 5 0 5",
          iconCls: "x-fa fa-circle"
        },
        {
          xtype: "button",
          action: "checkVAT",
          width: 100,
          text: D.t("Check VAT")
        }
      ]
    };
  },

  buildCountryCombo() {
    return {
      xtype: "dependedcombo",
      name: "country",
      labelWidth: 150,
      flex: 1,
      margin: "0 10 0 0",
      fieldLabel: D.t("Registration country"),
      valueField: "abbr2",
      displayField: "name",
      dataModel: "Crm.modules.settings.model.CountriesModel",
      fieldSet: "abbr2,name"
    };
  },

  buildTaxNumberFiled() {
    return {
      xtype: "textfield",
      name: "tax_number",
      labelWidth: 100,
      margin: "0 10 0 0",
      fieldLabel: D.t("Tax number")
    };
  },

  buildAddress() {
    return {
      xtype: "form",
      layout: "anchor",
      padding: 5,
      defaults: {
        xtype: "fieldset",
        anchor: "100%",
        defaults: {
          xtype: "textfield",
          anchor: "100%",
          defaults: {
            xtype: "textfield"
          }
        }
      },
      items: [
        {
          title: D.t("Address"),
          items: [
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  emptyText:
                    "Long info about address, building entrance floor etc",
                  flex: 1,
                  name: "address",
                  margin: "0 0 0 3"
                }
              ]
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  name: "street",
                  margin: "0 0 0 3",
                  flex: 1,
                  emptyText: D.t("Street")
                },
                {
                  name: "house",
                  margin: "0 0 0 3",
                  flex: 1,
                  emptyText: D.t("Building")
                },
                {
                  name: "short_address",
                  margin: "0 0 0 3",
                  flex: 1,
                  emptyText: D.t("Short info about address")
                }
              ]
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  emptyText: "City district",
                  flex: 1,
                  name: "city_district",
                  margin: "0 0 0 3"
                }
              ]
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  name: "zip",
                  margin: "0 0 0 3",
                  flex: 1,
                  emptyText: D.t("ZIP")
                },
                {
                  name: "city",
                  margin: "0 0 0 3",
                  flex: 1,
                  emptyText: D.t("City")
                },
                {
                  name: "region",
                  margin: "0 0 0 3",
                  flex: 1,
                  emptyText: D.t("Region")
                }
              ]
            }
          ]
        }
      ]
    };
  },

  buildButtons: function() {
    let buttons = this.callParent(arguments);
    for (let btn of buttons) {
      if (["save", "apply"].includes(btn.action)) btn.disabled = true;
    }
    return buttons;
  },

  buildOrders() {
    return {
      xtype: "panel",
      name: "orders_panel",
      layout: "fit",
      title: D.t("Orders"),
      items: Ext.create("Crm.modules.merchants.view.OrdersGrid", {
        observe: [{ property: "organisation", param: "id" }],
        scope: this
      })
    };
  },

  buildTransfers() {
    return {
      name: "transfers_panel",
      xtype: "panel",
      layout: "fit",
      title: D.t("Transfers"),
      items: Ext.create("Crm.modules.merchants.view.TransfersGrid", {
        scope: this,
        observe: [{ property: "merchant_id", param: "id" }]
      })
    };
  },

  buildBankProfile() {
    return {
      name: "banking_profile_panel",
      xtype: "panel",
      cls: "grayTitlePanel",
      layout: "anchor",
      region: "center",
      title: D.t("Banking Profile"),
      items: [
        Ext.create("Crm.modules.merchants.view.MerchantAccountDetailsGrid", {
          model: "Crm.modules.merchants.model.MerchantAccountDetailsModel",
          observe: [{ property: "merchant_id", param: "id" }],
          title: null,
          iconCls: null,
          scope: this
        })
      ]
    };
  },

  buildAccountsPanel() {
    return {
      name: "accounts_and_addresses_panel",
      xtype: "tabpanel",
      layout: "fit",
      title: D.t("Accounts & Addresses"),
      defaults: {
        xtype: "fieldcontainer",
        layout: "fit"
      },
      items: [
        {
          title: D.t("User"),
          items: [
            Ext.create(
              "Crm.modules.accounts.view.MerchantAccountsWithGasGrid",
              {
                observe: [
                  { property: "merchant_id", param: "id" },
                  { property: "wallet_type", param: "user_wallets" }
                ],
                title: null,
                iconCls: null,
                scope: this
              }
            )
          ]
        },
        {
          title: D.t("Monitor"),
          items: [
            Ext.create(
              "Crm.modules.accounts.view.MerchantAccountsWithGasGrid",
              {
                observe: [
                  { property: "merchant_id", param: "id" },
                  { property: "wallet_type", param: "monitor_wallets" }
                ],
                title: null,
                iconCls: null,
                scope: this
              }
            )
          ]
        },
        {
          title: D.t("All"),
          items: [
            Ext.create(
              "Crm.modules.accounts.view.MerchantAccountsWithGasGrid",
              {
                observe: [{ property: "merchant_id", param: "id" }],
                title: null,
                iconCls: null,
                scope: this
              }
            )
          ]
        }
      ]
    };
  }
});
