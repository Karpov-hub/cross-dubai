Ext.define("Crm.modules.depositImports.view.depositImportsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Deposit import"),

  formMargin: 5,

  width: 650,
  height: 200,
  syncSize: function() {},

  controllerCls: "Crm.modules.depositImports.view.depositImportsFormController",

  buildItems() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "currency",
        hidden: true
      },
      {
        name: "amount",
        hidden: true
      },
      {
        name: "deposit_to",
        hidden: true
      },
      {
        name: "deposit_date",
        hidden: true
      },
      {
        name: "bank",
        hidden: true
      },
      {
        name: "status",
        hidden: true
      },
      this.buildMerchantCombo(),
      this.buildOrdersCombo()
    ];
  },

  buildMerchantCombo() {
    return {
      fieldLabel: D.t("Merchant"),
      xtype: "combo",
      valueField: "id",
      displayField: "name",
      name: "merchant_combo",
      queryMode: "local",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.merchants.model.MerchantsModel"),
        fieldSet: "id,name",
        scope: this,
        sorters: [{ property: "name", direction: "asc" }]
      })
    };
  },

  buildOrdersCombo() {
    return {
      name: "order_id",
      xtype: "combo",
      flex: 1,
      fieldLabel: D.t("Order"),
      valueField: "id",
      displayField: "order_num",
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        "{order_num} | {currency} -> {res_currency}",
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{order_num} | {currency} -> {res_currency}</li>',
        "</tpl></ul>"
      ),
      queryMode: "local",
      store: {
        fields: ["id", "order_num", "currency", "res_currency"],
        data: []
      }
    };
  },

  buildButtons() {
    return [
      {
        iconCls: "x-fa fa-check",
        text: D.t("Mark as resolved"),
        action: "mark_resolved"
      },
      "-",
      {
        iconCls: "x-fa fa-university",
        text: D.t("Remember bank name"),
        action: "remember_bn"
      },
      "->",
      {
        iconCls: "x-fa fa-check",
        text: D.t("Complete deposit"),
        action: "provide_deposit"
      },
      "-",
      {
        text: D.t("Close"),
        handler: () => {
          this.close();
        }
      }
    ];
  }
});
