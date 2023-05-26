Ext.define("Crm.modules.transfers.view.MoveTransferForm", {
  extend: "Crm.modules.transfers.view.NewTransferForm",

  titleTpl: "Move transfers to other order",
  iconCls: "x-fa fa-exchange-alt",

  height: 370,
  width: 800,

  formLayout: "fit",
  formMargin: 0,

  controllerCls: "Crm.modules.transfers.view.MoveTransferController",

  buildAllItems: function() {
    var items = this.callParent();

    return {
      xtype: "panel",
      layout: "anchor",
      defaults: {
        xtype: "textfield",
        anchor: "100%"
      },
      items
    };
  },

  buildItems: function() {
    this.order = Ext.create("Ext.form.field.Text", {
      hidden: true,
      name: "ref_id"
    });

    this.organisation = Ext.create("Ext.form.field.Text", {
      hidden: true,
      name: "organisation"
    });

    return [
      this.order,
      this.organisation,
      this.buildTransfersCombo(),
      this.buildOrdersCombo()
    ];
  },

  buildTransfersCombo() {
    this.eventsNames = {
      "account-service:withdrawalCustomExchangeRate":
        "Withdrawal money outside",
      "account-service:deposit": "Deposit money into the system",
      "ccoin-service:completeTransfer":
        "Callback function for complete payments",
      "ccoin-service:deposit": "Callback function for deposit payments",
      "account-service:realmtransfer": "Inner transfer",
      // "account-service:bankCharge": "Bank charges",
      "account-service:doPipe": "Payment by plan"
    };
    this.transfers_combo = Ext.create("Desktop.core.widgets.TagField", {
      name: "transfers",
      valueField: "id",
      flex: 1,
      margin: 5,
      parentEl: this.order,
      parentField: "ref_id",
      displayField: "combo_event",
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        '{ctime:date("d.m.Y m:s")} {combo_event} {amount} {currency}',
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{ctime:date("d.m.Y m:s")} {combo_event} {amount} {currency}</li>',
        "</tpl></ul>"
      ),
      store: this.scope.view.down("[name=transfers_grid]").store,
      fieldLabel: D.t("Transfers")
    });
    return this.transfers_combo;
  },

  buildOrdersCombo() {
    return {
      xtype: "dependedcombo",
      name: "to_order",
      fieldLabel: D.t("To order"),
      valueField: "id",
      margin: 5,
      parentEl: this.organisation,
      parentField: "organisation",
      displayField: "order_num",
      dataModel: "Crm.modules.orders.model.OrdersModel",
      fieldSet: "id, order_num, date_from, date_to",
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        '{order_num} {date_from:date("d.m.Y")} - {date_to:date("d.m.Y")}',
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{order_num} {date_from:date("d.m.Y")} - {date_to:date("d.m.Y")}</li>',
        "</tpl></ul>"
      )
    };
  },

  buildSenButton: function() {
    return [
      {
        text: D.t("Move"),
        iconCls: "x-fa fa-exchange-alt",
        action: "move_txs"
      }
    ];
  }
});
