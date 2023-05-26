Ext.define("Crm.modules.userDocs.view.userDocsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Document"),

  formMargin: 0,

  width: 550,
  height: 220,
  controllerCls: "Crm.modules.userDocs.view.userDocsFormController",

  syncSize: function() {},
  buildItems() {
    var me = this;

    return {
      xtype: "panel",
      layout: "anchor",
      defaults: {
        anchor: "100%",
        xtype: "textfield",
        labelWidth: 100,
        margin: 5
      },
      items: [
        {
          name: "id",
          hidden: true
        },
        {
          name: "user_id",
          hidden: true,
          allowBlank: false
        },
        {
          xtype: "combo",
          allowBlank: false,
          displayField: "name",
          valueField: "name",
          name: "type",
          fieldLabel: D.t("Type"),
          store: Ext.create("Core.data.ComboStore", {
            dataModel: Ext.create("Crm.modules.docTypes.model.docTypesModel"),
            fieldSet: ["name"],
            scope: this
          })
        },
        {
          fieldLabel: D.t("Status"),
          xtype: "combo",
          name: "status",
          allowBlank: false,
          valueField: "value",
          displayField: "label",
          store: {
            fields: ["value", "label"],
            data: [
              { value: 1, label: D.t("Required") },
              { value: 2, label: D.t("Loaded") },
              { value: 3, label: D.t("Pending") },
              { value: 4, label: D.t("Approved") }
            ]
          }
        },
        { name: "doc_code", hidden: true },
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          items: [
            {
              xtype: "displayfield",
              name: "name",
              fieldLabel: D.t("File")
            },
            {
              xtype: "button",
              id: "download_file_button",
              text: D.t("Download"),
              hidden: true,
              margin: { left: 10 },
              action: "downloadFile"
            }
          ]
        },
        Ext.create("Crm.modules.docs.view.FilesList", {
          name: "files",
          split: true
        })
      ]
    };
  },
  buildButtons: function() {
    var btns = [
      "->",
      {
        text: D.t("Save"),
        iconCls: "x-fa fa-check",
        action: "apply",
        disabled: true
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];

    return btns;
  }
});
