Ext.define("Crm.modules.files.view.FilesForm", {
  extend: "Core.form.FormWindow",

  requires: ["Ext.ux.form.FileUploadField"],
  titleTpl: null,
  controllerCls: "Crm.modules.files.view.FilesFormController",
  formMargin: 5,

  width: 550,
  height: 200,

  syncSize: function() {},

  onActivate: function() {},

  onClose: function() {},

  buildItems() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "owner_id",
        hidden: true
      },
      Ext.create("Ext.form.field.File", {
        name: "file",
        fieldLabel: D.t("Choose a file for import"),
        flex: 3
      }),
      {
        name: "name",
        fieldLabel: D.t("Enter Custom file name"),
        flex: 3
      }
    ];
  }
});
