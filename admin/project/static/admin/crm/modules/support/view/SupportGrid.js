Ext.define("Crm.modules.support.view.SupportGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Support"),
  iconCls: "x-fa fa-question",

  // controllerCls: "Crm.modules.support.view.SupportGridController",

  filterable: true,
  filterbar: true,

  fields: [
    "id",
    "ctime",
    "number_of_ticket",
    "title",
    "category",
    "type",
    "status",
    "message",
    "new",
    "user_id"
  ],

  buildColumns: function() {
    const renderer = (v, m, r) => {
      if (r.data.new == 0) {
        m.tdCls = "x-grid-cell-new";
      }
      return v;
    };
    return [
      {
        xtype: "datecolumn",
        format: "d.m.Y H:i",
        text: D.t("Date"),
        width: 130,
        sortable: true,
        dataIndex: "ctime",
        filter: { xtype: "datefield", format: "d.m.Y" },
        renderer
      },
      {
        text: D.t("Client"),
        width: 150,
        sortable: true,
        dataIndex: "user_id",
        filter: true,
        renderer: function(v, m, r) {
          if (r.data.new == 0) {
            m.tdCls = "x-grid-cell-new";
          }
          if (!v) return "";
          return (
            '<a href="#Crm.modules.accountHolders.view.UsersForm~' +
            v.id +
            '">' +
            v.legalname +
            "</a>"
          );
        }
      },
      {
        text: D.t("Number of ticket"),
        width: 120,
        sortable: true,
        dataIndex: "number_of_ticket",
        filter: true,
        renderer
      },
      {
        text: D.t("Title"),
        flex: 1,
        sortable: true,
        dataIndex: "title",
        filter: true,
        renderer
      },
      {
        text: D.t("Category"),
        width: 120,
        sortable: true,
        dataIndex: "category",
        filter: true,
        renderer
      },
      {
        text: D.t("Type"),
        width: 150,
        sortable: true,
        dataIndex: "type",
        filter: true,
        renderer: (v, m, r) => {
          if (r.data.new == 0) {
            m.tdCls = "x-grid-cell-new";
          }
          return D.t({ 0: "incoming", 1: "outcoming" }[v]);
        }
      },
      {
        text: D.t("Status"),
        width: 70,
        sortable: true,
        dataIndex: "status",
        filter: true,
        renderer: (v, m, r) => {
          if (r.data.new == 0) {
            m.tdCls = "x-grid-cell-new";
          }
          return D.t({ 0: "open", 1: "resolved", 2: "closed" }[v]);
        }
      },
      {
        dataIndex: "new",
        hidden: true
      }
    ];
  },

  buildPlugins() {
    let plugins = this.callParent();
    plugins.push({
      ptype: "rowwidget",
      onWidgetAttach: function(plugin, view, record) {
        view.down("panel").setData(record.data);
      },
      widget: {
        xtype: "container",
        layout: {
          type: "vbox",
          pack: "start",
          align: "stretch"
        },
        items: [
          {
            xtype: "panel",
            cls: "transfer-details",
            //padding: 10,
            tpl: new Ext.XTemplate("{message}")
          }
        ]
      }
    });
    return plugins;
  },
  buildTbar() {
    let items = this.callParent();
    items.splice(0, 1);
    return items;
  }
});
