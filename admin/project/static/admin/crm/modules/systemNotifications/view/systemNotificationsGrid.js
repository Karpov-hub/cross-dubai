Ext.define("Crm.modules.systemNotifications.view.systemNotificationsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Notifications"),
  filterable: true,
  detailsInDialogWindow: true,

  mixins: ["Crm.modules.systemNotifications.view.DatesFunctions"],

  controllerCls:
    "Crm.modules.systemNotifications.view.systemNotificationsGridController",

  buildColumns: function() {
    let me = this;
    return [
      {
        dataIndex: "title",
        text: D.t("Title"),
        flex: 1
      },
      {
        dataIndex: "letter_template",
        text: D.t("Template"),
        hidden: true,
        flex: 1
      },
      {
        dataIndex: "date_from",
        text: D.t("From date"),
        width: 150,
        renderer: (v) => {
          if (v) return Ext.Date.format(me.addTimestamp(v), "d.m.Y H:i:s");
        }
      },
      {
        dataIndex: "date_to",
        text: D.t("To date"),
        width: 150,
        renderer: (v) => {
          if (v) return Ext.Date.format(me.addTimestamp(v), "d.m.Y H:i:s");
        }
      },
      {
        text: D.t("Active"),
        width: 300,
        sortable: true,
        dataIndex: "active",
        renderer: (v) => {
          return v ? "Yes" : "No";
        },
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          editable: false,
          store: [
            [true, "Yes"],
            [false, "No"]
          ],
          operator: "eq"
        }
      }
    ];
  }
});
