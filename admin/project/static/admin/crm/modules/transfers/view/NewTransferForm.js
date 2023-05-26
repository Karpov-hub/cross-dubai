Ext.define("Crm.modules.transfers.view.NewTransferForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Inside transfer",
  iconCls: "x-fa fa-money-bill-alt",

  formLayout: "anchor",

  formMargin: 0,

  width: 600,
  height: 340,

  onActivate: function() {},
  onClose: function() {},
  syncSize: function() {},

  stickerable: false,

  requires: ["Ext.form.field.Number"],

  controllerCls: "Crm.modules.transfers.view.NewTransferController",
  model: Ext.create("Crm.modules.transfers.model.TransfersModel"),

  buildForm: function() {
    return {
      xtype: "form",
      layout: this.formLayout,
      margin: this.formMargin,
      defaults: {
        xtype: "textfield",
        anchor: "100%",
        labelWidth: 100
      },
      items: this.buildAllItems()
    };
  },

  buildItems: function() {
    return [
      Ext.create("Crm.modules.realm.view.RealmCombo", {
        name: "realm",
        anchor: "100%",
        margin: 5
      }),
      {
        name: "acc_src",
        margin: 5,
        fieldLabel: D.t("Source account")
      },
      {
        name: "acc_dst",
        margin: 5,
        fieldLabel: D.t("Destination account")
      },
      {
        name: "amount",
        regex: /^[0-9\.]{1,}$/,
        margin: 5,
        value: 0,
        anchor: false,
        width: 250,
        editable: true,
        fieldLabel: D.t("Amount"),
        minValue: 0
      },
      {
        name: "description",
        margin: 5,
        fieldLabel: D.t("Description"),
        xtype: "textarea",
        height: 50
      },
      {
        name: "order_id",
        hidden: true
      }
    ];
  },

  buildOrgCombo() {
    this.userField = Ext.create("Ext.form.field.Text", {
      name: "user_id",
      hidden: true
    });
    this.merchantField = Ext.create("Ext.form.field.Text", {
      name: "merchant_id",
      hidden: true
    });
    this.realmDepartmentField = Ext.create("Ext.form.field.Text", {
      name: "realm_department",
      hidden: true
    });
    this.org = Ext.create("Core.form.DependedCombo", {
      margin: 5,
      valueField: "id",
      displayField: "name",
      name: "merchant",
      queryMode: "local",
      parentEl: this.userField,
      parentField: "user_id",
      dataModel: "Crm.modules.merchants.model.MerchantsModel",
      fieldSet: "id,user_id,name",
      fieldLabel: D.t("Merchant"),
      readOnly: true
    });
  },

  buildButtons: function() {
    let [btn1, btn2] = this.buildSenButton();
    var btns = [
      btn1,
      "-",
      btn2,
      "->",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];

    return btns;
  },

  buildSenButton() {
    return [
      {
        text: D.t("Send transfer"),
        iconCls: "x-fa fa-check-square",
        //scale: "medium",
        action: "transfer"
      }
    ];
  }
});
