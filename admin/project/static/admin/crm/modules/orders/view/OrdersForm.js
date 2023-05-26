Ext.define("Crm.modules.orders.view.OrdersForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Order"),
  requires: ["Core.form.DependedCombo"],
  controllerCls: "Crm.modules.orders.view.OrdersFormController",
  formLayout: "fit",
  formMargin: 0,
  modal: false,

  buildGeneralTab() {
    return {
      xtype: "panel",
      title: D.t("General"),
      layout: "border",
      items: [this.buildGenereal(), this.buildTransfers()]
    };
  },

  buildItems() {
    return {
      xtype: "tabpanel",
      layout: "fit",
      items: [this.buildGeneralTab(), this.buildDocumentsTab()]
    };
  },

  buildDocumentsTab() {
    return {
      xtype: "panel",
      title: D.t("Documents"),
      layout: "anchor",
      layout: "fit",
      items: Ext.create("Crm.modules.orders.view.FilesGrid", {
        scope: this,
        observe: [{ property: "owner_id", param: "id" }],
        model: "Crm.modules.orders.model.FilesModel"
      })
    };
  },
  buildGenereal() {
    this.realmField = Ext.create("Ext.form.field.Text", {
      name: "realm",
      hidden: true
    });
    this.merchantCombo = Ext.create("Core.form.DependedCombo", {
      valueField: "id",
      displayField: "legalname",
      name: "merchant",
      dataModel: "Crm.modules.accountHolders.model.UsersModel",
      fieldSet: "id,legalname,email,realm",
      allowBlank: false,
      fieldLabel: D.t("Client"),
      readOnly: true
    });
    this.org_combo = Ext.create("Ext.form.ComboBox", {
      xtype: "combo",
      name: "organisation",
      fieldLabel: D.t("Merchant"),
      valueField: "id",
      displayField: "name",
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: "Crm.modules.merchants.model.MerchantsModel",
        fieldSet: "id,user_id,name",
        scope: this
      })
    });
    this.contractsCombo = Ext.create("Core.form.DependedCombo", {
      xtype: "dependedcombo",
      valueField: "id",
      allowBlank: false,
      displayField: "contract_subject",
      name: "contract_id",
      queryMode: "local",
      parentEl: this.org_combo,
      parentField: "owner_id",
      dataModel: "Crm.modules.contracts.model.ContractsModel",
      fieldSet: "id,contract_subject,memo,status",
      fieldLabel: D.t("Contracts"),
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">{contract_subject}{[values.memo ? " ("+values.memo+")" : ""]} - {[["Pending","Approved","Terminated"][values.status]]}</tpl>'
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        `<ul class="x-list-plain"><tpl for=".">
        <li role="option" class="x-boundlist-item">{contract_subject}{[values.memo ? " ("+values.memo+")" : ""]} - {[["Pending","Approved","Terminated"][values.status]]}</li>
        </tpl></ul>`
      )
    });
    this.realmDepartmentsCombo = Ext.create("Core.form.DependedCombo", {
      valueField: "id",
      displayField: "name",
      allowBlank: false,
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        "{name} ({status})",
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{name} ({status})</li>',
        "</tpl></ul>"
      ),
      parentEl: this.realmField,
      parentField: "realm",
      name: "realm_department",
      dataModel: "Crm.modules.merchants.model.RealmDepartmentModel",
      fieldSet: "id,realm,name,status",
      fieldLabel: D.t("Recipient"),
      hidden:true,
      readOnly: true
    });
    this.orgWalletsStore = Ext.create("Core.data.Store", {
      dataModel: "Crm.modules.wallets.model.OrgWalletsModel",
      fieldSet: "org,num,curr_name",
      scope: this,
      exProxyParams: { currency: null, org: null }
    });
    let me = this;
    return {
      xtype: "panel",
      layout: "anchor",
      cls: "grayTitlePanel",
      width: 500,
      split: true,
      region: "west",
      bodyPadding: 5,
      defaults: { anchor: "100%" },
      items: [
        { name: "id", hidden: true, xtype: "textfield" },
        {
          name: "ctime",
          hidden: true,
          xtype: "xdatefield"
        },
        this.merchantCombo,
        this.org_combo,
        // this.contractsCombo,
        // this.realmDepartmentsCombo,
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: { flex: 1 },
          fieldLabel: D.t("Amount"),
          action: "amount_panel",
          allowBlank: false,
          items: [
            Ext.create("Crm.modules.currency.view.CurrencyCombo", {
              name: "currency",
              labelWidth: 40,
              fieldLabel: D.t("from"),
              margin: "0 10 0 0",
              allowBlank: false,
              action: "currency_field"
            }),
            {
              name: "old_currency",
              xtype: "textfield",
              hidden: true,
              action: "old_currency"
            },
            Ext.create("Crm.modules.currency.view.CurrencyCombo", {
              name: "res_currency",
              labelWidth: 40,
              emptyText: "No",
              listConfig: {
                tpl:
                  '<div class="my-boundlist-item-menu">No</div>' +
                  '<tpl for=".">' +
                  '<div class="x-boundlist-item">{abbr}</div></tpl>',
                listeners: {
                  el: {
                    delegate: ".my-boundlist-item-menu",
                    click: function() {
                      me.down("[name=res_currency]").clearValue();
                    }
                  }
                }
              },
              fieldLabel: D.t("to")
            })
          ]
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: { flex: 1 },
          items: [
            {
              name: "amount2",
              fieldLabel: D.t("Amount 2"),
              xtype: "textfield",
              allowDecimals: true,
              minValue: 0,
              margin: "0 10 0 0"
            },
            Ext.create("Crm.modules.currency.view.CurrencyCombo", {
              name: "currency2",
              labelWidth: 40,
              fieldLabel: D.t("from")
            })
          ]
        },
        {
          xtype: "xdatefield",
          name: "order_date",
          format: D.t("d/m/Y"),
          submitFormat: "Y-m-d",
          fieldLabel: D.t("Order date")
        },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          fieldLabel: D.t("Period"),
          defaults: {
            xtype: "xdatefield",

            submitFormat: "Y-m-d",
            format: D.t("d/m/Y"),
            flex: 1
          },
          items: [
            {
              name: "date_from",
              margin: "0 3 0 0",
              allowBlank: false,
              format: D.t("d/m/Y"),
              value: new Date(),
              emptyText: D.t("Date from")
            },
            {
              name: "date_to",
              margin: "0 0 0 3",
              format: D.t("d/m/Y"),
              allowBlank: false,
              // value: new Date(Date.now() + 86400000),
              emptyText: D.t("Date To")
            }
          ]
        },
        // {
        //   xtype: "fieldcontainer",
        //   layout: "hbox",
        //   defaults: {
        //     xtype: "xdatefield",
        //     submitFormat: "Y-m-d",
        //     format: D.t("m/d/Y"),
        //     flex: 1,
        //     value: new Date()
        //   },
        //   items: [
        //     {
        //       name: "ctime",
        //       fieldLabel: D.t("Date")
        //     }
        //   ]
        // },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          defaults: {
            flex: 1
          },
          items: [
            {
              xtype: "textfield",
              margin: "0 10 0 0",
              name: "order_num",
              allowBlank: false,
              fieldLabel: D.t("Order number")
            },
            {
              name: "status",
              fieldLabel: D.t("Status"),
              xtype: "combo",
              queryMode: "local",
              allowBlank: false,
              displayField: "value",
              valueField: "key",
              labelWidth: 60,
              store: {
                fields: ["key", "value"],
                data: [
                  {
                    key: 1,
                    value: "Ongoing"
                  },
                  {
                    key: 2,
                    value: "Completed"
                  },
                  {
                    key: 3,
                    value: "Suspended"
                  }
                ]
              }
            }
          ]
        },
        {
          xtype: "textareafield",
          fieldLabel: D.t("Order details"),
          height: 40,
          grow: true,
          name: "details"
        },
        {
          xtype: "textareafield",
          fieldLabel: D.t("Bank details"),
          height: 40,
          grow: true,
          name: "bank_details"
        },
        {
          xtype: "textfield",
          fieldLabel: D.t("Website"),
          name: "merchant_website"
        },
        {
          xtype: "textfield",
          fieldLabel: D.t("Other websites"),
          name: "merchant_owebsites"
        },
        {
          xtype: "dependedcombo",
          valueField: "name",
          displayField: "name",
          displayTpl: Ext.create(
            "Ext.XTemplate",
            '<tpl for=".">',
            "{name} {bank_details}",
            "</tpl>"
          ),
          tpl: Ext.create(
            "Ext.XTemplate",
            '<ul class="x-list-plain"><tpl for=".">',
            '<li role="option" class="x-boundlist-item">{name} {bank_details}</li>',
            "</tpl></ul>"
          ),
          name: "external_wallet_iban",
          flex: 1,
          queryMode: "local",
          parentEl: this.org_combo,
          parentField: "org",
          dataModel: "Crm.modules.banks.model.OrgIBANModel",
          fieldSet: "org,name,bank_details",
          fieldLabel: D.t("To IBAN"),
          hidden: true
        },
        {
          xtype: "combo",
          valueField: "num",
          displayField: "num",
          displayTpl: Ext.create(
            "Ext.XTemplate",
            '<tpl for=".">',
            "{num} {curr_name}",
            "</tpl>"
          ),
          tpl: Ext.create(
            "Ext.XTemplate",
            '<ul class="x-list-plain"><tpl for=".">',
            '<li role="option" class="x-boundlist-item">{num} {curr_name}</li>',
            "</tpl></ul>"
          ),
          name: "external_wallet_crypto",
          flex: 1,
          queryMode: "remote",
          triggerAction: "query",
          store: this.orgWalletsStore,
          fieldSet: "org,num,curr_name",
          fieldLabel: D.t("To Crypto Wallet"),
          hidden: true
        },
        // {
        //   xtype: "fieldcontainer",
        //   layout: "hbox",
        //   defaults: {
        //     xtype: "button",
        //     flex: 1,
        //     disabled: true
        //   },
        //   items: [
        //     {
        //       xtype: "button",
        //       margin: "0 5 5 0",
        //       text: D.t("Invoice from the contractor"),
        //       action: "select_contractor"
        //     },
        //     // {
        //     //   margin: "0 5 5 0",
        //     //   text: D.t("Send payment details"),
        //     //   action: "send_pay_details"
        //     // },
        //     {
        //       xtype: "button",
        //       margin: "0 0 5 5",
        //       text: D.t("Invoice"),
        //       action: "invoice"
        //     }
        //   ]
        // },
        // {
        //   xtype: "button",
        //   disabled: true,
        //   margin: "0 0 5 0",
        //   text: D.t("Advertising report"),
        //   action: "get_advertising_report"
        // },
        // {
        //   xtype: "button",
        //   disabled: true,
        //   margin: "5 0 0 0",
        //   text: D.t("Custom advertising report"),
        //   action: "get_custom_advertising_report"
        // }
      ]
    };
  },
  buildTransfers() {
    return {
      xtype: "panel",
      action: "transfers_panel",
      disabled: true,
      cls: "grayTitlePanel",
      layout: "fit",
      region: "center",
      title: D.t("Transfers"),
      tbar: [
        {
          name: "deposit_btn",
          xtype: "button",
          margin: "0 5 0 0",
          text: D.t("Deposit"),
          action: "deposit"
        },
        // {
        //   name: "withdrawal_btn",
        //   xtype: "button",
        //   margin: "0 5 0 0",
        //   text: D.t("Withdrawal"),
        //   action: "withdrawal",
        // },
        // {
        //   name: "bankcharges_btn",
        //   xtype: "button",
        //   margin: "0 5 0 0",
        //   text: D.t("Bank charges"),
        //   action: "bankcharges",
        // },
        {
          name: "move_transfers_btn",
          xtype: "button",
          margin: "0 5 0 0",
          text: D.t("Move transfers"),
          action: "move_transfers"
        },
        {
          name: "inner_transfer_btn",
          xtype: "button",
          margin: "0 5 0 0",
          text: D.t("Inter account transfer"),
          action: "inner_transfer"
        },
        "-",
        {
          xtype: "button",
          margin: "0 5 0 0",
          text: D.t("Transfer by plan"),
          action: "plan_transfer",
          name: "transfer_by_plan_btn"
        }
      ],
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
                  name: "transfers_grid",
                  title: null,
                  iconCls: null,
                  scope: this
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
                    scope: this
                  }
                )
              ]
            }
          ]
        }
      ]
    };
  },
  buildButtons: function() {
    return [
      {
        tooltip: D.t("Remove this record"),
        iconCls: "x-fa fa-trash-alt",
        action: "remove",
        disabled: true
      },
      "->",
      {
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square",
        action: "save"
      },
      "-",
      {
        text: D.t("Save"),
        iconCls: "x-fa fa-check",
        action: "apply"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
