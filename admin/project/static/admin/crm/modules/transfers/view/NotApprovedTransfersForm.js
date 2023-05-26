Ext.define("Crm.modules.transfers.view.NotApprovedTransfersForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Summary"),
  iconCls: "x-fa fa-money-bill-alt",

  formLayout: "anchor",

  requires: ["Ext.window.Toast"],

  formMargin: 0,

  width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 900,
  height: Ext.platformTags.phone ? Ext.Element.getViewportHeight() : 600,

  onActivate: function() {},
  onClose: function() {},
  syncSize: function() {},
  controllerCls:
    "Crm.modules.transfers.view.NotApprovedTransfersFormController",

  buildItems() {
    this.nfPanel = Ext.create("Ext.panel.Panel", {});
    return {
      xtype: "panel",
      scrollable: {
        y: true
      },
      layout: Ext.platformTags.phone
        ? {
            type: "accordion",
            titleCollapse: true,
            animate: true,
            activeOnTop: false,
            multi: !Ext.platformTags.phone
          }
        : "border",
      height: Ext.platformTags.phone
        ? Ext.Element.getViewportHeight() * 0.85
        : 600,
      items: [
        {
          title: D.t("General"),
          xtype: "panel",
          layout: "anchor",
          scrollable: {
            y: true
          },
          width: Ext.platformTags.phone ? "100%" : null,
          region: "center",
          defaults: {
            xtype: "textfield",
            readOnly: true,
            labelAlign: Ext.platformTags.phone ? "top" : "left",
            anchor: "100%",
            margin: 5
          },
          items: [
            { name: "id", hidden: true },
            {
              name: "plan_transfer_id",
              hidden: true
            },
            {
              name: "ref_id",
              hidden: true
            },
            {
              name: "plan_id",
              hidden: true
            },
            {
              name: "plan_name",
              fieldLabel: D.t("Plan name")
            },
            {
              name: "merchant_id",
              hidden: true
            },
            {
              name: "merchant_name",
              fieldLabel: D.t("Merchant")
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  flex: 1,
                  xtype: "textfield",
                  labelAlign: Ext.platformTags.phone ? "top" : "left",
                  readOnly: true,
                  name: "amount",
                  fieldLabel: D.t("Amount")
                },
                {
                  padding: "5 5 5 10",
                  xtype: "label",
                  width: 50,
                  name: "currency"
                }
              ]
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  flex: 1,
                  xtype: "textfield",
                  readOnly: true,
                  name: "fees",
                  fieldLabel: D.t("Fees")
                },
                {
                  padding: "5 5 5 10",
                  xtype: "label",
                  width: 50,
                  name: "fees_currency"
                }
              ],
              hidden: true
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  flex: 1,
                  xtype: "textfield",
                  readOnly: true,
                  name: "netto_amount",
                  fieldLabel: D.t("Amount netto")
                },
                {
                  padding: "5 5 5 10",
                  xtype: "label",
                  width: 50,
                  name: "netto_currency"
                }
              ],
              hidden: true
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  flex: 1,
                  xtype: "textfield",
                  readOnly: true,
                  name: "rate",
                  fieldLabel: D.t("Exchange rate")
                },
                {
                  padding: "5 5 5 10",
                  xtype: "label",
                  width: 50,
                  name: "rate_currency"
                }
              ],
              hidden: true
            },
            {
              xtype: "fieldcontainer",
              layout: "hbox",
              items: [
                {
                  flex: 1,
                  xtype: "textfield",
                  readOnly: true,
                  name: "result_amount",
                  fieldLabel: D.t("Amount to send")
                },
                {
                  padding: "5 5 5 10",
                  xtype: "label",
                  width: 50,
                  name: "result_currency"
                }
              ],
              hidden: true
            },
            {
              name: "description",
              fieldLabel: D.t("Description")
            },
            {
              margin: "20 5 5 5",
              regex: /^[0-9\.]{1,}$/,
              keyNavEnabled: false,
              hideTrigger: true,
              mouseWheelEnabled: false,
              name: "confirmation_amount",
              readOnly: false,
              allowBlank: false,
              fieldLabel: D.t('Repeat value from "Amount" for sending')
            },
            {
              xtype: "box",
              anchor: "100%",
              html: "<hr>"
            },
            this.nfPanel
          ]
        },
        {
          title: D.t("Variables"),
          xtype: "panel",
          layout: "anchor",
          region: "east",
          width: Ext.platformTags.phone ? "100%" : "50%",
          split: true,
          items: [
            {
              xtype: "textfield",
              name: "tariff",
              hidden: true
            },
            {
              margin: 5,
              xtype: "textfield",
              anchor: "100%",
              fieldLabel: D.t("Tariff"),
              name: "tariff_name",
              readOnly: true
            },
            {
              xtype: "gridfield",
              disableRemoveAction: true,
              layout: "fit",
              scrollable: true,
              name: "variables",
              fields: ["key", "value", "descript"],
              columns: [
                {
                  flex: 1,
                  text: D.t("Variable"),
                  dataIndex: "key",
                  renderer(v, m, r) {
                    return r.data.descript;
                  }
                },
                {
                  flex: 1,
                  text: D.t("Value"),
                  dataIndex: "value"
                }
              ]
            }
          ]
        }
      ]
    };
  },

  buildButtons() {
    let buttons = this.callParent(arguments);
    let buttons_arr = [
      {
        action: "approve",
        iconCls: "x-fa fa-check-circle",
        text: D.t("Approve"),
        disabled: true
      },
      {
        action: "reject",
        iconCls: "x-fa fa-ban",
        text: D.t("Reject"),
        disabled: true
      },
      {
        action: "delete",
        iconCls: "x-fa fa-trash",
        text: D.t("Delete"),
        disabled: true
      }
    ];
    buttons_arr.push(buttons[1], buttons[5]);
    return buttons_arr;
  }
});
