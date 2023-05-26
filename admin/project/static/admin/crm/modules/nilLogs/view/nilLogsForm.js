Ext.define("Crm.modules.nilLogs.view.nilLogsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("NIL Log") + ": {ctime}",
  iconCls: "x-fa fa-list",

  controllerCls: "Crm.modules.nilLogs.view.nilLogsFormController",
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
            name: "response",
            xtype: "textarea",
            readOnly: true,
            flex: 1,
            height: 500,
            margin: "0 0 0 5",
            fieldLabel: D.t("Response")
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
