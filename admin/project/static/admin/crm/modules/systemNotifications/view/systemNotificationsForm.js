Ext.define("Crm.modules.systemNotifications.view.systemNotificationsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Notification: {title}",
  iconCls: "x-fa fa-bell",

  controllerCls:
    "Crm.modules.systemNotifications.view.systemNotificationsFormController",

  formMargin: 5,

  requires: ["Ext.window.Toast", "Ext.ux.DateTimeField"],

  width: 550,
  height: 500,

  modal: true,

  syncSize: function() {},
  onActivate() {},
  onClose() {},

  buildItems: function() {
    return [
      {
        name: "id",
        hidden: true
      },
      {
        xtype: "textfield",
        fieldLabel: D.t("Title"),
        maxLength: 100,
        labelWidth: 110,
        name: "title"
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          labelWidth: 110
        },
        items: [
          {
            xtype: "combo",
            displayField: "letter_name",
            valueField: "code",
            name: "letter_template",
            flex: 1,
            displayTpl: Ext.create(
              "Ext.XTemplate",
              '<tpl for=".">',
              "{subject}",
              "</tpl>"
            ),
            tpl: Ext.create(
              "Ext.XTemplate",
              '<ul class="x-list-plain"><tpl for=".">',
              '<li role="option" class="x-boundlist-item">{subject}</li>',
              "</tpl></ul>"
            ),
            fieldLabel: D.t("Choose template"),
            store: Ext.create("Core.data.ComboStore", {
              dataModel: Ext.create(
                "Crm.modules.letterTemplates.model.letterTemplatesModel"
              ),
              fieldSet: [
                "id",
                "letter_name",
                "code",
                "subject",
                "type",
                "data",
                "html",
                "lang"
              ],
              scope: this
            })
          },
          {
            xtype: "menubar",
            margin: 0,
            height: 24,
            padding: 0,
            items: [
              {
                iconCls: "x-fa fa-plus",
                tooltip: D.t("Create new template"),
                text: D.t("Create"),
                menu: [
                  {
                    text: D.t("RU Version"),
                    action: "open_letter_templates_form",
                    value: "ru"
                  },
                  {
                    text: D.t("EN Version"),
                    action: "open_letter_templates_form",
                    value: "en"
                  }
                ]
              },
              {
                iconCls: "x-fa fa-edit",
                tooltip: D.t("Edit selected template"),
                name: "edit_letter_template_menu",
                text: D.t("Edit"),
                hidden: true,
                menu: [
                  {
                    text: D.t("RU Version"),
                    action: "edit_letter_template",
                    value: "ru"
                  },
                  {
                    text: D.t("EN Version"),
                    action: "edit_letter_template",
                    value: "en"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        defaults: {
          xtype: "xdatefield"
        },
        items: [
          {
            xtype: "label",
            cls: "x-form-item-label-default",
            text: D.t("Dates of activity:"),
            width: 115
          },
          {
            xtype: "datetimefield",
            name: "date_from",
            minutesIncrement: 5,
            emptyText: D.t("From date"),
            format: "d.m.Y H:i:s",
            submitFormat: "Y-m-d H:i:s",
            flex: 1
          },
          {
            xtype: "datetimefield",
            name: "date_to",
            minutesIncrement: 5,
            emptyText: D.t("To date"),
            format: "d.m.Y H:i:s",
            submitFormat: "Y-m-d H:i:s",
            flex: 1
          }
        ]
      },
      {
        name: "data",
        xtype: "textfield",
        hidden: true
      },
      {
        xtype: "checkbox",
        name: "active",
        labelWidth: 110,
        fieldLabel: D.t("Active")
      },
      {
        xtype: "checkbox",
        name: "mail_sent",
        labelWidth: 110,
        hidden: true,
        fieldLabel: D.t("DEBUG")
      },
      {
        xtype: "panel",
        layout: "anchor",
        name: "data_fields_panel",
        title: D.t("Message fields"),
        height: Math.floor(Ext.Element.getViewportHeight() * 0.3),
        header: {
          items: [
            {
              xtype: "combo",
              displayField: "key",
              valueField: "value",
              fieldLabel: D.t("Language"),
              name: "lang",
              store: {
                data: [
                  {
                    key: "English",
                    value: "en"
                  },
                  {
                    key: "Russian",
                    value: "ru"
                  }
                ]
              }
            }
          ]
        },
        scrollable: {
          y: true
        },
        defaults: {
          padding: "5 0 0 0",
          anchor: "100%",
          labelWidth: 110
        },
        items: []
      }
    ];
  },
  buildButtons: function() {
    return [
      {
        tooltip: D.t("Open preview widget"),
        iconCls: "x-fa fa-eye",
        action: "show_preview_window"
      },
      {
        text: D.t("Send notification"),
        iconCls: "x-fa fa-envelope",
        action: "send_mail_notification",
        hidden: true
      },
      {
        xtype: "label",
        text: D.t("Notification was sent to the users"),
        name: "delivering_status",
        hidden: true
      },
      "->",
      {
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square",
        action: "warn_and_save"
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
  }
});
