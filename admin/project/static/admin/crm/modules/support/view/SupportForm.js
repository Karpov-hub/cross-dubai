Ext.define("Crm.modules.support.view.SupportForm", {
  extend: "Core.form.FormWindow",

  model: "Crm.modules.support.model.SupportFormModel",

  titleTpl: "Ticket: {number_of_ticket} - {title}",
  iconCls: "x-fa fa-list",
  controllerCls: "Crm.modules.support.view.SupportFormController",

  formLayout: "border",

  formMargin: 0,

  buildItems: function() {
    return [
      {
        xtype: "panel",
        region: "west",
        width: "30%",
        split: true,
        layout: "border",
        items: [
          {
            xtype: "fieldcontainer",
            region: "north",
            layout: "anchor",
            defaults: {
              anchor: "100%",
              xtype: "textfield",
              margin: 5,
            },
            items: this.buildFormFields(),
          },
          {
            name: "message",
            xtype: "textarea",
            region: "center",
            readOnly: true,
            margin: 5,
            fieldLabel: D.t("Message"),
          },
        ],
      },
      {
        xtype: "panel",
        region: "center",
        layout: "fit",
        margin: "5 5 5 0",
        items: Ext.create("Crm.modules.support.view.CommentGrid", {
          scope: this,
          observe: [{ property: "ticket_id", param: "id" }],
        }),
      },
    ];
  },

  buildFormFields() {
    return [
      {
        name: "id",
        hidden: true,
      },
      {
        name: "status",
        readOnly: true,
        fieldLabel: D.t("Status"),
      },
      {
        name: "ctime",
        readOnly: true,
        fieldLabel: D.t("Date"),
      },
      {
        name: "title",
        readOnly: true,
        fieldLabel: D.t("Title"),
      },
      {
        name: "realm_id",
        hidden: true,
      },
      {
        name: "user_id",
        hidden: true,
      },
    ];
  },

  buildButtons: function() {
    return [
      "->",
      {
        text: D.t("Resolve ticket"),
        iconCls: "x-fa fa-check-square",
        action: "resolve_ticket",
      },
      "-",
      {
        text: D.t("Close ticket"),
        iconCls: "x-fa fa-check-square",
        action: "close_ticket",
      },
      "-",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" },
    ];
  },
});
