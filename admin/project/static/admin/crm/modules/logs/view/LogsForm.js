/*!
 * @Date : 03-23-2016
 * @Author : Datta Bhise
 * @Copyright Enovate IT Outsourcing Pvt Ltd.
 */
Ext.define("Crm.modules.logs.view.LogsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Logs") + ": {ctime}",
  iconCls: "x-fa fa-newspaper-o",

  controllerCls: "Crm.modules.logs.view.LogsFormController",
  onActivate: function() {},
  onClose: function() {},

  buildItems: function() {
    return [
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        items: [
          {
            name: "request",
            xtype: "textarea",
            readOnly: true,
            height: 500,
            flex: 1,
            margin: "0 5 0 0",
            fieldLabel: D.t("Request")
          },
          {
            name: "responce",
            xtype: "textarea",
            readOnly: true,
            flex: 1,
            height: 500,
            margin: "0 0 0 5",
            fieldLabel: D.t("Responce")
          }
        ]
      }
    ];
  },

  buildButtons: function() {
    var btns = [
      "->",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
    return btns;
  }
});
