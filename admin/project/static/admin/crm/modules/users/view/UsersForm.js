Ext.define("Crm.modules.users.view.UsersForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "User: {login}",

  requires: ["Ext.ux.form.ItemSelector", "Ext.form.field.Tag"],

  controllerCls: "Crm.modules.users.controller.UsersController",

  buildForm: function() {
    return {
      xtype: "form",
      layout: this.formLayout,
      margin: this.formMargin,
      scrollable: {
        y: true
      },
      defaults: {
        xtype: "textfield",
        anchor: "100%",
        labelWidth: 130
      },
      items: this.buildAllItems()
    };
  },

  buildItems: function() {
    return [
      {
        name: "login",
        labelAlign: Ext.platformTags.phone ? "top" : "left",
        fieldLabel: D.t("Login *"),
        allowBlank: false
      },
      {
        name: "name",
        labelAlign: Ext.platformTags.phone ? "top" : "left",
        fieldLabel: D.t("User name *"),
        allowBlank: true
      },
      {
        name: "tel",
        labelAlign: Ext.platformTags.phone ? "top" : "left",
        fieldLabel: D.t("Phone *"),
        allowBlank: true
      },
      {
        name: "email",
        labelAlign: Ext.platformTags.phone ? "top" : "left",
        fieldLabel: D.t("Email *"),
        allowBlank: true
      },
      {
        name: "ip",
        labelAlign: Ext.platformTags.phone ? "top" : "left",
        fieldLabel: D.t("Valid IP *"),
        allowBlank: true
      },
      {
        name: "pass",
        labelAlign: Ext.platformTags.phone ? "top" : "left",
        inputType: "password",
        fieldLabel: D.t("Password *"),
        allowBlank: true
      },
      this.buildGroupCombo(),
      this.buildXGroups(),
      {
        xtype: "checkbox",
        name: "is_manager",
        fieldLabel: D.t("Manager"),
        labelWidth: Ext.platformTags.phone ? 200 : 130,
        inputValue: true,
        uncheckedValue: false
      },
      {
        xtype: "checkbox",
        name: "dblauth",
        labelWidth: Ext.platformTags.phone ? 200 : 130,
        fieldLabel: D.t("Two-factor authentication")
      },
      {
        xtype: "checkbox",
        name: "need_stickers",
        labelWidth: Ext.platformTags.phone ? 200 : 130,
        fieldLabel: D.t("Need stickers")
      },
      {
        xtype: "checkbox",
        name: "need_checker_widget",
        fieldLabel: D.t("Need checker widget"),
        labelWidth: Ext.platformTags.phone ? 200 : 130,
        inputValue: true,
        uncheckedValue: false
      },
      {
        xtype: "panel",
        layout: Ext.platformTags.phone ? "anchor" : "hbox",
        title: D.t("Statuses managering settings"),
        cls: "grayTitlePanel",
        defaults: {
          xtype: "checkbox",
          inputValue: true,
          margin: Ext.platformTags.phone ? 0 : "0 20 0 0",
          labelWidth: Ext.platformTags.phone ? 200 : 150,
          uncheckedValue: false
        },
        items: [
          {
            name: "can_change_wallet_status",
            fieldLabel: D.t("Can change wallet status")
          },
          {
            name: "can_change_client_status",
            fieldLabel: D.t("Can deactivate clients")
          },
          {
            name: "order_status",
            fieldLabel: D.t("Can change order status")
          }
        ]
      },
      {
        xtype: "panel",
        layout: Ext.platformTags.phone ? "anchor" : "hbox",
        title: D.t("Telegram settings"),
        cls: "grayTitlePanel",
        defaults: {
          xtype: "checkbox",
          inputValue: true,
          margin: Ext.platformTags.phone ? 0 : "0 20 0 0",
          labelWidth: Ext.platformTags.phone ? 200 : 120,
          uncheckedValue: false
        },
        items: [
          {
            name: "tg_create",
            fieldLabel: D.t("Can create channel")
          },
          {
            name: "tg_edit",
            fieldLabel: D.t("Can edit channel name")
          },
          {
            name: "tg_delete",
            fieldLabel: D.t("Can delete channel")
          }
        ]
      }
    ];
  },

  buildGroupCombo: function() {
    var me = this;
    return {
      xtype: "combo",
      labelAlign: Ext.platformTags.phone ? "top" : "left",
      name: "groupid",
      fieldLabel: D.t("Main group *"),
      valueField: "_id",
      displayField: "name",
      queryMode: "local",

      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.users.model.GroupsModel"),
        fieldSet: ["_id", "name"],
        scope: me
      }),
      allowBlank: true
    };
  },

  buildXGroups: function() {
    return {
      xtype: "combo",
      multiSelect: true,
      editable:false,
      labelAlign: Ext.platformTags.phone ? "top" : "left",
      fieldLabel: D.t("Extended groups *"),
      store: Ext.create("Core.data.Store", {
        dataModel: "Crm.modules.users.model.GroupsModel",
        fieldSet: "_id,name"
      }),
      displayField: "name",
      valueField: "_id",
      queryMode: "local",
      name: "xgroups",
      filterPickList: true,
      allowBlank: true
    };
  }

  // buildButtons: function() {
  //   var btns = [
  //     {
  //       text: D.t("Save and close"),
  //       iconCls: "x-fa fa-check-square",
  //       scale: "medium",
  //       action: "save",
  //       disabled: true
  //     },
  //     {
  //       text: D.t("Save"),
  //       iconCls: "x-fa fa-check",
  //       action: "apply",
  //       disabled: true
  //     },
  //     "-",
  //     { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
  //   ];
  //   if (this.allowCopy)
  //     btns.splice(1, 0, {
  //       tooltip: D.t("Make a copy"),
  //       iconCls: "x-fa fa-copy",
  //       action: "copy"
  //     });
  //   return btns;
  // }
});
