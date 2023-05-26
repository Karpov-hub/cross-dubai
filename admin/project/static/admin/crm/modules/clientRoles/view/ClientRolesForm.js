Ext.define("Crm.modules.clientRoles.view.ClientRolesForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Client role: {name}"),

  width: 450,
  height: 520,

  formMargin: 5,

  controllerCls: "Crm.modules.clientRoles.view.ClientRolesFormController",
  onActivate: () => {},
  onClose: () => {},
  syncSize: () => {},

  buildItems() {
    return [
      {
        xtype: "panel",
        layout: "anchor",
        height: 440,
        scrollable: true,
        defaults: {
          xtype: "textfield",
          anchor: "100%",
          labelWidth: 100
        },
        items: [
          {
            name: "id",
            hidden: true
          },
          {
            name: "name",
            fieldLabel: D.t("Name")
          },
          {
            xtype: "checkbox",
            name: "is_default",
            fieldLabel: D.t("Is default role")
          },
          {
            xtype: "checkboxgroup",
            name: "available_permissions",
            fieldLabel: D.t("Permissions"),
            columns: 1,
            vertical: true,
            items: []
          },
          {
            xtype: "checkboxgroup",
            name: "available_other_permissions",
            fieldLabel: D.t("Other Permissions"),
            columns: 1,
            vertical: true,
            items: []
          }
        ]
      }
    ];
  },

  buildButtons: function() {
    let buttons = this.callParent(arguments);
    buttons[3].action = "save";
    return [buttons[1], buttons[3], buttons[4], buttons[5]];
  }
});
