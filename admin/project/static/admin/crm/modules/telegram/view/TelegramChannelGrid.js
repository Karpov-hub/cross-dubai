Ext.define("Crm.modules.telegram.view.TelegramChannelGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Telegram channels"),
  detailsInDialogWindow: true,

  filterable: true,
  filterbar: true,

  controllerCls: "Crm.modules.telegram.view.TelegramChannelGridController",

  buildColumns: function() {
    return [
      {
        dataIndex: "id",
        hidden: true
      },
      {
        xtype: "datecolumn",
        text: D.t("Creation date"),
        flex: 1,
        sortable: true,
        filter: true,
        format: "d.m.Y H:i:s",
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "ctime"
      },
      {
        text: D.t("Channel ID"),
        dataIndex: "channel_id",
        flex: 1,
        sortable: true,
        filter: true
      },
      {
        text: D.t("Ref ID"),
        dataIndex: "ref_id",
        flex: 1,
        sortable: true,
        filter: true
      },
      {
        text: D.t("Join link"),
        dataIndex: "join_link",
        flex: 1,
        sortable: true,
        filter: true
      },
      {
        text: D.t("Telegram app ID"),
        dataIndex: "telegram_app",
        flex: 1,
        sortable: true,
        filter: true
      }
    ];
  },

  buildTbar() {
    const items = this.callParent();
    items.splice(0, 2);
    return items;
  },

  buildButtonsColumns() {
    const items = this.callParent(arguments);
    items[0].width = 34;
    items[0].items.shift();
    return items;
  }
});
