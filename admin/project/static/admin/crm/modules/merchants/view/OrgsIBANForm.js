Ext.define("Crm.modules.merchants.view.OrgsIBANForm",{
    extend:'Crm.modules.banks.view.IBANForm',
    controllerCls:'Crm.modules.merchants.view.OrgsFormController',

    onActivate: function() {},

    onClose: function() {},
    
    buildButtons: function() {
        return [
          "->",
          {
            text: D.t("Save and close"),
            iconCls: "x-fa fa-check-square",
            action: "save"
          },
          "-",
          { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
        ];
      }
})