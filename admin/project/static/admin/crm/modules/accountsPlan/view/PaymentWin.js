Ext.define("Crm.modules.accountsPlan.view.PaymentWin", {
  extend: "Core.form.FormWindow",

  titleTpl: "Payment by plan",
  iconCls: "x-fa fa-money-bill-alt",

  formLayout: "fit",

  formMargin: 0,

  width: Ext.platformTags.phone
    ? Ext.Element.getViewportWidth()
    : Ext.Element.getViewportWidth() * 0.7,
  height: Ext.platformTags.phone ? Ext.Element.getViewportHeight() : 450,

  onActivate: function () { },
  onClose: function () { },
  syncSize: function () { },

  requires: ["Ext.form.field.Number", "Ext.window.Toast"],

  controllerCls: "Crm.modules.accountsPlan.view.PaymentWinController",
  model: Ext.create("Crm.modules.accountsPlan.model.MerchPlansModel"),

  buildForm: function () {
    return {
      xtype: "form",
      layout: this.formLayout,
      margin: this.formMargin,
      items: {
        xtype: "panel",
        layout: Ext.platformTags.phone
          ? {
            type: "accordion",
            titleCollapse: true,
            animate: true,
            activeOnTop: false,
            multi: !Ext.platformTags.phone
          }
          : "border",
        items: [this.buildGeneral(), this.buildVariables()]
      }
    };
  },

  buildGeneral() {
    return {
      xtype: "panel",
      layout: "anchor",
      flex: 1,
      region: "center",
      title: D.t("General"),
      scrollable: true,
      defaults: {
        xtype: "textfield",
        anchor: "100%",
        labelWidth: 160,
        labelAlign: Ext.platformTags.phone ? "top" : "left",
        margin: 5
      },
      items: this.buildAllItems()
    };
  },

  buildVariables() {
    return {
      xtype: "panel",
      region: "east",
      split: true,
      height: this.height - 100,
      width: this.width / 1.7,
      scrollable: {
        y: true
      },
      layout: "fit",
      title: D.t("Variables"),
      items: [
        Ext.create("Crm.modules.tariffs.view.TariffSettingsPanel", {
          title: null,
          titleTpl: null,
          merchant_accs_search_params: {
            field: "merchant",
            value: this.config.merchant_id
          },
          client_accs_search_params: {
            field: "client",
            value: this.config.client_id
          }
        })
      ]
    };
  },

  buildItems: function () {
    this.merchantField = Ext.create("Ext.form.field.Text", {
      name: "merchant_id",
      hidden: true
    });
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "ref_id",
        hidden: true
      },
      { name: "plan_transfer_id", hidden: true },
      this.merchantField,
      this.buildPlanCombo(),
      {
        xtype: "checkbox",
        name: "internaltransfer",
        margin: "5 0 12 5",
        flex: 1,
        fieldLabel: D.t("Internal transfer"),
        hidden: true
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        fieldLabel: D.t("Amount"),
        items: [
          {
            xtype: "textfield",
            name: "amount",
            regex: /^[0-9\.]{1,}$/,
            value: 0,
            anchor: false,
            width: 150,
            width: Ext.platformTags.phone ? "80%" : 150,
            margin: "0 10 0 0",
            validator: (value) => this.controller.validateAmountValue(value),
            editable: true,
            minValue: 0
          },
          {
            xtype: "label",
            width: 50,
            name: "currency",
            text: ""
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        fieldLabel: D.t("Fees"),
        items: [
          {
            xtype: "textfield",
            name: "fees",
            value: 0,
            anchor: false,
            width: Ext.platformTags.phone ? "80%" : 150,
            margin: "0 10 0 0",
            editable: false,
            disabled: true,
            minValue: 0
          },

          {
            xtype: "label",
            width: 50,
            name: "fees_currency",
            text: ""
          }
        ],
        hidden: true
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        fieldLabel: D.t("Amount netto"),
        items: [
          {
            xtype: "textfield",
            name: "netto_amount",
            value: 0,
            anchor: false,
            width: Ext.platformTags.phone ? "80%" : 150,
            margin: "0 10 0 0",
            editable: false,
            disabled: true,
            minValue: 0
          },
          {
            xtype: "label",
            width: 50,
            name: "netto_currency",
            text: ""
          }
        ],
        hidden: true
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        fieldLabel: D.t("Exchange rate"),
        items: [
          {
            xtype: "textfield",
            name: "rate",
            value: 0,
            anchor: false,
            margin: "0 10 0 0",
            editable: false,
            disabled: true,
            minValue: 0
          }
        ],
        hidden: true
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        fieldLabel: D.t("Amount to send"),
        items: [
          {
            xtype: "textfield",
            name: "result_amount",
            regex: /^[0-9\.]{1,}$/,
            value: 0,
            anchor: false,
            width: Ext.platformTags.phone ? "80%" : 150,
            margin: "0 10 0 0",
            editable: true,
            minValue: 0
          },
          {
            xtype: "label",
            width: 50,
            name: "result_currency",
            text: ""
          }
        ],
        hidden: true
      },
      {
        name: "description",
        fieldLabel: D.t("Description")
      },
      {
        name: "order_id",
        hidden: true
      },
      {
        name: "is_draft",
        hidden: true,
        value: true,
        xtype: "checkbox"
      },
      {
        name: "last_rejection_reason",
        xtype: "textarea",
        hidden: true
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        fieldLabel: D.t("Exchange fee"),
        name: "swap_exchange_fee_container",
        hidden: true,
        items: [
          {
            xtype: "textfield",
            name: "swap_exchange_fee",
            value: 0,
            anchor: false,
            width: Ext.platformTags.phone ? "80%" : 150,
            margin: "0 10 0 0",
            editable: false,
            disabled: true,
            minValue: 0
          },
          {
            xtype: "label",
            width: 50,
            name: "swap_exchange_fee_currency",
            text: ""
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        fieldLabel: D.t("Network fee"),
        name: "swap_network_fee_container",
        hidden: true,
        items: [
          {
            xtype: "textfield",
            name: "swap_network_fee",
            value: 0,
            anchor: false,
            width: Ext.platformTags.phone ? "80%" : 150,
            margin: "0 10 0 0",
            editable: false,
            disabled: true,
            minValue: 0
          },
          {
            xtype: "label",
            width: 50,
            name: "swap_network_fee_currency",
            text: ""
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        fieldLabel: D.t("Approx. estimated amount"),
        name: "swap_to_amount_container",
        hidden: true,
        items: [
          {
            xtype: "textfield",
            name: "swap_to_amount",
            value: 0,
            anchor: false,
            width: Ext.platformTags.phone ? "80%" : 150,
            margin: "0 10 0 0",
            editable: false,
            disabled: true,
            minValue: 0
          },
          {
            xtype: "label",
            width: 50,
            name: "swap_to_amount_currency",
            text: ""
          }
        ]
      }
    ];
  },

  buildButtons: function () {
    let [btn1, btn2] = this.buildSenButton();
    var btns = [
      btn1,
      {
        xtype: "button",
        iconCls: Ext.platformTags.phone ? null : "x-fab fa-firstdraft",
        action: "save_as_draft",
        hidden: true,
        text: D.t("Save as draft")
      },
      {
        xtype: "button",
        hidden: true,
        iconCls: "x-fa fa-exclamation-triangle",
        action: "show_rejection_reason",
        text: Ext.platformTags.phone ? null : D.t("Show rejection reason")
      },
      "-",
      btn2,
      "->",
      {
        text: D.t("Close"),
        iconCls: "x-fa fa-ban",
        action: "formclose",
        hidden: Ext.platformTags.phone
      }
    ];

    return btns;
  },

  buildSenButton() {
    return [
      {
        text: D.t("Send transfer"),
        iconCls: Ext.platformTags.phone ? null : "x-fa fa-check-square",
        action: "transfer"
      }
    ];
  },

  buildPlanCombo() {
    return Ext.create("Crm.modules.accountsPlan.view.TagsFilterCombo", {
      valueField: "id",
      displayField: "name",
      editable: !Ext.platformTags.phone,
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        "{name}",
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{name}</li>',
        "</tpl></ul>"
      ),
      name: "plan_id",
      parentEl: this.merchantField,
      parentField: "merchant_id",
      dataModel: "Crm.modules.accountsPlan.model.PlansWeightComboModel",
      fieldSet: "id,name,items,description",
      fieldLabel: D.t("Choose accounts plan"),
      customSort: true,
      tags: this.buildTags()
    });
  },
  buildTags() {
    let prepared_tags = null;
    if (this.config.tag) {
      prepared_tags = this.config.tag;
      if (typeof this.config.tag == "string") prepared_tags = [this.config.tag];
    }
    if (this.config.tags) {
      prepared_tags = this.config.tags;
      if (typeof this.config.tags == "string")
        prepared_tags = this.config.tags.split(",");
    }
    return prepared_tags;
  }
});
