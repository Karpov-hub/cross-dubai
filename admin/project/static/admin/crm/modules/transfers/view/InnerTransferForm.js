Ext.define("Crm.modules.transfers.view.InnerTransferForm", {
  extend: "Crm.modules.transfers.view.NewTransferForm",

  titleTpl: "Inner trasnfer",
  iconCls: "x-fa fa-exchange-alt",

  height: 370,
  width: 800,

  formLayout: "fit",
  formMargin: 0,

  controllerCls: "Crm.modules.transfers.view.InnerTransferFormController",

  buildAllItems: function () {
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

  buildItems: function () {
    this.buildOrgCombo();
    this.org.setHidden(true);
    return [
      this.userField,
      this.org,
      this.realmDepartmentField,
      {
        xtype: "fieldcontainer",
        margin: 5,
        layout: "hbox",
        items: [this.buildAccountCombo("acc_src", "From")]
      },
      {
        xtype: "fieldcontainer",
        margin: 5,
        layout: "hbox",
        items: [this.buildAccountCombo("acc_dst", "To")]
      },
      {
        name: "amount",
        xtype: "numberfield",
        decimalPrecision: 8,
        margin: 5,
        flex: 1,
        fieldLabel: D.t("Amount"),
        allowBlank: false
      },
      {
        name: "exchange_rate",
        xtype: "numberfield",
        decimalPrecision: 8,
        margin: 5,
        fieldLabel: D.t("Exchange rate"),
        flex: 1
      },
      {
        name: "description",
        margin: 5,
        flex: 1,
        fieldLabel: D.t("Description"),
        xtype: "textarea",
        height: 50
      },
      {
        name: "ref_id",
        hidden: true
      }
    ];
  },

  buildAccountCombo(field_name, prefix) {
    let store = Ext.create("Core.data.ComboStore", {
      dataModel: Ext.create("Crm.modules.accounts.model.ClientAccsModel"),
      fieldSet: ["acc_name", "acc_no", "currency", "balance", 'status'],
      scope: this
    })
    store.setSorters([
      {
        sorterFn: function (a, b) {
          a = a.data.acc_name;
          b = b.data.acc_name;
          if (a === b) {
            return 0;
          }
          return a > b ? 0 : -1;
        }
      }
    ])

    return {
      xtype: "combo",
      valueField: "acc_no",
      displayField: "acc_no",
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        '{[values.acc_name ? values.acc_name+" - " : ""]}{acc_no} {currency} - {balance}',
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{[values.acc_name ? values.acc_name+" - " : ""]}{acc_no} {currency} - {balance}</li>',
        "</tpl></ul>"
      ),
      name: field_name,
      queryMode: "local",
      flex: 1,
      store,
      fieldLabel: D.t(`${prefix} account`),
      allowBlank: false
    }
  },

  buildSenButton: function () {
    return [
      {
        text: D.t("Do transfer"),
        iconCls: "x-fa fa-check-square",
        action: "do_realmtransfer"
      }
    ];
  }
});
