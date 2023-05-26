Ext.define("Crm.modules.clientNotifications.view.NotificationSettingsPanel", {
  extend: "Ext.panel.Panel",

  title: D.t("Notification settings"),

  initComponent() {
    this.items = this.buildItems();
    this.tbar = this.buildTbar();
    this.model = Ext.create(
      "Crm.modules.clientNotifications.model.NotificationSettingsModel"
    );
    this.controller = Ext.create(
      "Crm.modules.clientNotifications.view.NotificationSettingsController"
    );
    this.callParent(arguments);
  },

  buildItems() {
    return {
      xtype: "panel",
      layout: "anchor",
      items: [
        {
          xtype: "textfield",
          hidden: true,
          name: "user_id"
        },
        {
          xtype: "fieldcontainer",
          layout: "fit",
          items: [this.buildNotificationSettingsGrid()]
        }
      ]
    };
  },
  buildNotificationSettingsGrid() {
    let me = this;
    return {
      xtype: "grid",
      name: "notification_settings_panel",
      height: Ext.Element.getViewportHeight() * 0.5,
      scrollbar: true,
      store: {
        fields: ["subject", "code", "channels"],
        data: []
      },
      columns: [
        {
          dataIndex: "subject",
          text: D.t("Subject"),
          flex: 1,
          editor: false,
          renderer(v) {
            if (v) return v.en;
          }
        },
        {
          dataIndex: "code",
          text: D.t("Letter code"),
          flex: 1,
          editor: false,
          hidden: true
        },
        {
          dataIndex: "channels",
          text: D.t("Channels"),
          flex: 1,
          editor: {
            xtype: "combo",
            multiSelect: true,
            editable: false,
            store: {
              fields: ["channel", "label"],
              data: [
                { channel: "email", label: D.t("Email") }
                // { channel: "telegram", label: D.t("Telegram") },
                // { channel: "sms", label: D.t("Sms") }
              ]
            },
            displayField: "label",
            valueField: "channel",
            queryMode: "local",
            filterPickList: true
          }
        }
      ],
      plugins: [
        Ext.create("Ext.grid.plugin.CellEditing", {
          clicksToEdit: 2,
          listeners: {
            edit: function(el, ctx) {
              me.fireEvent("edit", el, ctx);
            }
          }
        })
      ]
    };
  },
  buildTbar() {
    return [
      {
        tooltip: D.t("Refresh"),
        iconCls: "x-fa fa-sync",
        action: "refresh"
      }
    ];
  }
});
