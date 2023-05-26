Ext.define("Crm.modules.merchantCategories.view.merchantCategoriesForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Caregory: {name}"),

  formMargin: 5,

  width: 550,
  height: 230,

  syncSize: function() {},

  //controllerCls: "Crm.modules.accounts.view.AccountsFormController",

  buildItems() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "name",
        fieldLabel: D.t("Category name")
      }
    ];
  },

  buildButtons: function() {
    return [
      {
        tooltip: D.t("Remove this record"),
        iconCls: "x-fa fa-trash-alt",
        action: "remove"
      },
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
});
