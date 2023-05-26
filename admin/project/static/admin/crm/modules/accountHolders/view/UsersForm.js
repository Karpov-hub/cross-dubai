Ext.define("Crm.modules.accountHolders.view.UsersForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t(
    "Company: {legalname} ({[values.blocked ? 'Blocked':'Active']})"
  ),

  iconCls: "x-fa fa-user",

  requires: [
    "Desktop.core.widgets.GridField",
    "Core.form.DateField",
    "Core.form.DependedCombo",
    "Ext.window.Toast"
  ],

  formLayout: "fit",
  formMargin: 0,

  controllerCls: "Crm.modules.accountHolders.view.UsersFormController",

  buildItems() {
    return {
      xtype: "tabpanel",
      layout: "fit",
      items: [
        this.buildGeneral(),
        this.buildMerchants(),
        this.buildTariffPanel(),
        this.buildAccountsAndAddressesPanel(),
        this.buildCryptoWallets(),
        this.buildOrders(),
        this.buildNonCustodialWalletsPanel(),
        this.buildNotificationSettings(),
        this.buildTelegramAppsPanel()
      ]
    };
  },

  buildGeneral() {
    this.accountsGrid = Ext.create(
      "Crm.modules.accounts.view.UserAccountsGrid",
      {
        title: null,
        iconCls: null,
        scope: this,
        observe: [{ property: "owner", param: "id" }]
      }
    );
    this.accountsAddressesGrid = Ext.create(
      "Crm.modules.accounts.view.ClientAccountsWithGasGrid",
      {
        title: null,
        iconCls: null,
        scope: this,
        observe: [{ property: "owner_id", param: "id" }]
      }
    );
    this.freeWalletsGrid = Ext.create(
      "Crm.modules.nonCustodialWallets.view.ClientWalletsGrid",
      {
        title: null,
        iconCls: null,
        scope: this,
        observe: [{ property: "user_id", param: "id" }]
      }
    );
    return {
      xtype: "panel",
      title: D.t("General"),
      layout: {
        type: "accordion",
        titleCollapse: true,
        animate: true,
        activeOnTop: false,
        multi: !Ext.platformTags.phone
      },
      items: [
        {
          xtype: "panel",
          layout: "anchor",
          title: D.t("General"),
          height: 325,
          scrollable: true,
          defaults: {
            anchor: "100%",
            xtype: "textfield",
            margin: 5,
            labelWidth: 110
          },
          items: this.buildUserProfileFields()
        },
        {
          xtype: "panel",
          layout: "fit",
          title: D.t("Transfers"),
          items: Ext.create("Crm.modules.transfers.view.TransfersGrid", {
            scope: this,
            title: null,
            iconCls: null,
            observe: [{ property: "user_id", param: "id" }],
            model: "Crm.modules.accountHolders.model.TransfersModel"
          })
        }
      ]
    };
  },

  buildUserProfileFields() {
    return Ext.platformTags.phone ? this.buildMobile() : this.buildDesktop();
  },
  buildMobile() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "sumsub_id",
        hidden: true
      },
      this.buildRealmCombo(),
      {
        xtype: "textfield",
        name: "legalname",
        fieldLabel: D.t("Client name"),
        labelAlign: "top"
      },
      {
        xtype: "combo",
        name: "role",
        fieldLabel: D.t("Client role"),
        valueField: "id",
        displayField: "name",
        editable: false,
        allowBlank: false,
        store: Ext.create("Core.data.ComboStore", {
          dataModel: Ext.create(
            "Crm.modules.clientRoles.model.ClientRolesModel"
          ),
          fieldSet: "id,name,is_default",
          scope: this
        }),
        labelAlign: "top"
      },
      {
        xtype: "textfield",
        name: "email",
        fieldLabel: D.t("E-mail"),
        allowBlank: false,
        labelAlign: "top"
      },
      {
        xtype: "textfield",
        name: "phone",
        fieldLabel: D.t("Phone"),
        allowBlank: false,
        labelAlign: "top"
      },
      {
        xtype: "xdatefield",
        submitFormat: "Y-m-d",
        format: D.t("m/d/Y"),
        name: "ctime",
        fieldLabel: D.t("Reg. date"),
        labelAlign: "top"
      },
      this.buildTypeCombo(),
      {
        xtype: "combo",
        name: "otp_transport",
        fieldLabel: D.t("Otp channel"),
        valueField: "name",
        editable: false,
        displayField: "name",
        allowBlank: false,
        store: {
          fields: ["name"],
          data: [
            { name: "test" },
            { name: "email" },
            { name: "google authenticator" }
          ]
        },
        labelAlign: "top"
      },
      {
        xtype: "combo",
        name: "communication_lang",
        flex: 1,
        fieldLabel: D.t("Prefer language"),
        valueField: "value",
        displayField: "key",
        allowBlank: false,
        editable: false,
        store: {
          fields: ["key", "value"],
          data: [
            { key: D.t("English"), value: "en" },
            { key: D.t("Russian"), value: "ru" }
          ]
        },
        labelAlign: "top"
      },
      {
        xtype: "fieldcontainer",
        layout: "vbox",
        defaults: {
          labelWidth: 150
        },
        items: [
          {
            xtype: "checkbox",
            name: "inner_client",
            fieldLabel: D.t("Inner client")
          },
          {
            name: "on_top",
            xtype: "checkbox",
            fieldLabel: D.t("Pin to top")
          },
          {
            xtype: "checkbox",
            name: "activated",
            hidden: true,
            fieldLabel: D.t("Activated")
          },
          {
            xtype: "checkbox",
            name: "blocked",
            fieldLabel: D.t("Blocked")
          },
          {
            xtype: "checkbox",
            name: "google_auth",
            fieldLabel: D.t("Google Authenticator")
          },
          {
            xtype: "checkbox",
            name: "kyc",
            fieldLabel: D.t("KYC")
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        name: "tg_container_placement",
        items: [
          //  this.buildTelegramContainer()
        ]
      }
    ];
  },
  buildDesktop() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "sumsub_id",
        hidden: true
      },

      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          flex: 1
        },
        items: [
          this.buildRealmCombo(),
          {
            xtype: "textfield",
            name: "legalname",
            fieldLabel: D.t("Client name"),
            margin: "0 3 0 0"
          },
          {
            xtype: "combo",
            name: "role",
            flex: 1,
            margin: "0 0 0 3",
            fieldLabel: D.t("Client role"),
            valueField: "id",
            displayField: "name",
            editable: false,
            allowBlank: false,
            store: Ext.create("Core.data.ComboStore", {
              dataModel: Ext.create(
                "Crm.modules.clientRoles.model.ClientRolesModel"
              ),
              fieldSet: "id,name,is_default",
              scope: this
            })
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          xtype: "textfield",
          flex: 1
        },
        items: [
          {
            name: "email",
            margin: "0 3 0 0",
            fieldLabel: D.t("E-mail"),
            allowBlank: false
          },
          {
            name: "phone",
            margin: "0 0 0 3",
            fieldLabel: D.t("Phone"),
            allowBlank: false
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          xtype: "xdatefield",
          submitFormat: "Y-m-d",
          format: D.t("m/d/Y")
        },
        items: [
          {
            name: "ctime",
            fieldLabel: D.t("Reg. date"),
            flex: 1,
            margin: "0 3 0 0"
          },
          {
            xtype: "textfield",
            name: "wcc",
            flex: 1,
            labelWidth: 210,
            fieldLabel: D.t("Working communication channel"),
            emptyText: D.t("eg. telegram @Jhon"),
            margin: "0 0 0 3"
          },
          this.buildTypeCombo(),
          {
            xtype: "combo",
            name: "otp_transport",
            flex: 1,
            margin: "0 0 0 3",
            labelWidth: 130,
            fieldLabel: D.t("Otp default channel"),
            editable: false,
            valueField: "name",
            displayField: "name",
            allowBlank: false,
            store: {
              fields: ["name"],
              data: [
                { name: "test" },
                { name: "email" },
                { name: "google authenticator" }
              ]
            }
          },
          {
            xtype: "combo",
            name: "communication_lang",
            flex: 1,
            margin: "0 0 0 3",
            labelWidth: 160,
            fieldLabel: D.t("Communication language"),
            editable: false,
            valueField: "value",
            displayField: "key",
            allowBlank: false,
            store: {
              fields: ["key", "value"],
              data: [
                { key: D.t("English"), value: "en" },
                { key: D.t("Russian"), value: "ru" }
              ]
            }
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        items: [
          {
            xtype: "checkbox",
            name: "inner_client",
            margin: "0 0 10 0",
            flex: 1,
            fieldLabel: D.t("Inner client")
          },
          {
            name: "on_top",
            xtype: "checkbox",
            flex: 1,
            margin: "0 0 10 0",
            fieldLabel: D.t("Pin to top")
          },
          {
            xtype: "checkbox",
            name: "activated",
            flex: 1,
            margin: "0 0 10 0",
            fieldLabel: D.t("Activated")
          },
          {
            xtype: "checkbox",
            name: "blocked",
            flex: 1,
            margin: "0 0 10 0",
            fieldLabel: D.t("Blocked")
          },
          {
            xtype: "checkbox",
            name: "google_auth",
            flex: 1,
            margin: "0 0 10 0",
            labelWidth: 130,
            fieldLabel: D.t("Google Authenticator")
          },
          {
            xtype: "checkbox",
            name: "kyc",
            margin: "0 0 10 0",
            flex: 1,
            fieldLabel: D.t("KYC")
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        name: "tg_container_placement",
        items: [
          //  this.buildTelegramContainer()
        ]
      }
    ];
  },

  buildOrders() {
    return {
      xtype: "panel",
      name: "orders_panel",
      layout: "fit",
      title: D.t("Orders"),
      items: Ext.create("Crm.modules.accountHolders.view.OrdersGrid", {
        observe: [{ property: "merchant", param: "id" }],
        scope: this
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

  buildAccountsAndAddressesPanel() {
    return {
      xtype: "panel",
      action: "accounts_addresses_panel",
      layout: "fit",
      region: "center",
      cls: "grayTitlePanel",
      title: D.t("Accounts & Addresses"),
      items: this.accountsAddressesGrid
    };
  },

  buildTelegramAppsPanel() {
    return {
      xtype: "panel",
      action: "tg_apps_panel",
      layout: "fit",
      region: "center",
      cls: "grayTitlePanel",
      title: D.t("Telegram apps"),
      items: Ext.create("Crm.modules.telegram.view.TelegramAppGrid", {
        title: null,
        iconCls: null,
        scope: this,
        observe: [{ property: "user_id", param: "id" }]
      })
    };
  },

  buildAnalyticsPanel() {
    return {
      xtype: "panel",
      title: D.t("Analitycs"),
      layout: "fit",
      items: [
        Ext.create("Crm.modules.orders.view.AnalitycsForm", {
          scope: this,
          observe: [{ property: "merchant", param: "id" }]
        })
      ]
    };
  },

  buildNotes() {
    return {
      xtype: "panel",
      title: D.t("Notes"),
      layout: "anchor",
      padding: 5,
      items: [
        {
          xtype: "textfield",
          anchor: "100%",
          name: "notes"
        }
      ]
    };
  },

  buildKyc() {
    return {
      xtype: "panel",
      title: D.t("KYC"),
      layout: "border",
      items: [
        {
          xtype: "panel",
          region: "center",
          layout: "border",
          items: [
            {
              xtype: "panel",
              layout: "anchor",
              region: "north",
              height: 325,
              cls: "grayTitlePanel",
              items: Ext.create("Crm.modules.kyc.view.ProfileGrid", {
                scope: this,
                observe: [{ property: "user_id", param: "id" }]
              })
            },
            {
              xtype: "panel",
              layout: "fit",
              region: "center",
              cls: "grayTitlePanel",
              items: Ext.create("Crm.modules.kyc.view.AddressGrid", {
                scope: this,
                observe: [{ property: "user_id", param: "id" }]
              })
            }
          ]
        },
        {
          xtype: "panel",
          region: "east",
          cls: "grayTitlePanel",
          width: "50%",
          layout: "fit",
          split: true,
          items: Ext.create("Crm.modules.kyc.view.CompanyGrid", {
            scope: this,
            observe: [{ property: "user_id", param: "id" }]
          })
        }
      ]
    };
  },

  buildAddress(name, text) {
    return {
      xtype: "fieldcontainer",
      layout: "hbox",
      fieldLabel: D.t(text),
      defaults: {
        xtype: "textfield"
      },
      items: [
        {
          name: `zip_${name}`,
          margin: "0 3 0 0",
          width: 100,
          emptyText: D.t("ZIP")
        },
        {
          name: `city_${name}`,
          margin: "0 0 0 3",
          flex: 1,
          emptyText: D.t("city")
        },
        {
          name: `street_${name}`,
          margin: "0 0 0 3",
          flex: 1,
          emptyText: D.t("street")
        },
        {
          name: `house_${name}`,
          margin: "0 0 0 3",
          flex: 1,
          emptyText: D.t("house")
        },
        {
          name: `apartment_${name}`,
          margin: "0 0 0 3",
          flex: 1,
          emptyText: D.t("apartment")
        }
      ]
    };
  },

  buildTypeCombo() {
    let cmp = {
      fieldLabel: D.t("Client type"),
      xtype: "combo",
      labelAlign: Ext.platformTags.phone ? "top" : "left",
      readOnly: false,
      editable: false,
      name: "type",
      store: {
        fields: ["code", "name"],
        data: [
          { code: 0, name: D.t("Project") },
          { code: 1, name: D.t("Company") }
        ]
      },
      valueField: "code",
      displayField: "name"
    };
    if (!Ext.platformTags.phone) {
      cmp.labelWidth = 130;
      cmp.flex = 1;
      cmp.margin = "0 0 0 3";
    }
    return cmp;
  },

  buildRealmCombo() {
    return Ext.create("Crm.modules.realm.view.RealmCombo", {
      name: "realm",
      margin: "0 3 0 0",
      allowBlank: false,
      hidden: true
    });
  },

  buildInvoiceCombo() {
    return {
      xtype: "dependedcombo",
      name: "invoice_tpl",
      fieldLabel: D.t("Invoice type"),
      valueField: "id",
      margin: "0 5 0 5",
      displayField: "name",
      dataModel: "Crm.modules.invoiceTemplates.model.InvoiceTemplatesModel",
      fieldSet: "id,name"
    };
  },

  buildCountryCombo() {
    return {
      xtype: "dependedcombo",
      name: "country",
      fieldLabel: D.t("Country"),
      valueField: "abbr2",
      margin: "0 0 0 3",
      displayField: "name",
      dataModel: "Crm.modules.settings.model.CountriesModel",
      fieldSet: "abbr2,name"
    };
  },

  buildTariffPanel() {
    return Ext.create("Crm.modules.tariffs.view.TariffSettingsPanel", {
      merchant_accs_search_params: {
        field: "client",
        value: this.recordId
      }
    });
  },

  buildIBANS() {
    return {
      xtype: "panel",
      layout: "fit",
      title: D.t("IBANs"),
      items: Ext.create("Crm.modules.banks.view.IBANGrid", {
        scope: this,
        observe: [{ property: "owner", param: "id" }]
      })
    };
  },

  buildNotifications() {
    return {
      xtype: "panel",
      layout: "fit",
      title: D.t("Notifications"),
      items: Ext.create("Crm.modules.notifications.view.NotificationsGrid", {
        scope: this,
        observe: [{ property: "user_id", param: "id" }]
      })
    };
  },

  buildMerchants() {
    return {
      xtype: "panel",
      layout: "fit",
      title: D.t("Merchants"),
      items: Ext.create("Crm.modules.merchants.view.MerchantsGrid", {
        scope: this,
        observe: [{ property: "user_id", param: "id" }]
      })
    };
  },

  buildIPs() {
    return {
      xtype: "panel",
      title: D.t("IP address"),

      xtype: "gridfield",
      hideLabel: true,
      region: "center",
      name: "ip",
      layout: "fit",
      fields: ["ip"],
      columns: [
        {
          text: D.t("Address"),
          flex: 1,
          sortable: false,
          dataIndex: "ip",
          menuDisabled: true,
          editor: true
        }
      ]
    };
  },

  buildUserTickets() {
    return {
      xtype: "panel",
      title: D.t("User Tickets"),
      items: [
        Ext.create("Crm.modules.support.view.SupportGrid", {
          title: null,
          iconCls: null,
          scope: this,
          observe: [{ property: "user_id", param: "id" }]
        })
      ]
    };
  },

  buildUserDocsPanel() {
    return {
      xtype: "panel",
      layout: "fit",
      title: D.t("Documents"),
      items: Ext.create("Crm.modules.userDocs.view.userDocsGrid", {
        scope: this,
        observe: [{ property: "user_id", param: "id" }]
      })
    };
  },

  buildCryptoWallets() {
    return {
      xtype: "panel",
      layout: "fit",
      title: D.t("Address book"),
      items: Ext.create("Crm.modules.wallets.view.WalletsGrid", {
        scope: this,
        observe: [{ property: "user_id", param: "id" }]
      })
    };
  },

  buildPaymentDetailsPanel() {
    return {
      xtype: "panel",
      title: D.t("Payment details"),
      layout: "fit",
      items: [
        {
          xtype: "textareafield",
          grow: true,
          name: "payment_details"
        }
      ]
    };
  },

  buildTelegramContainer() {
    return Ext.create("Crm.modules.telegram.view.TelegramChannelComponent", {
      ref_id: this.recordId,
      user_id: this.recordId
    });
  },

  buildNotificationSettings() {
    const panel = Ext.create(
      "Crm.modules.clientNotifications.view.NotificationSettingsPanel",
      {
        scope: this,
        user_id: this.recordId
      }
    );
    panel.controller.setValues({ user_id: this.recordId });
    return panel;
  },

  buildButtons: function() {
    let items = this.callParent();
    if (Ext.platformTags.phone)
      items.splice(0, 1, {
        xtype: "button",
        text: D.t("Actions"),
        menu: [
          {
            text: D.t("LogIn"),
            action: "get_session"
          },
          {
            text: D.t("Generate and send password"),
            action: "send_pass"
          }
        ]
      });
    else
      items.splice(
        0,
        1,
        {
          xtype: "button",
          text: D.t("LogIn"),
          action: "get_session"
        },
        {
          xtype: "button",
          text: D.t("Generate and send password"),
          action: "send_pass"
        }
      );
    return items;
  }
});
