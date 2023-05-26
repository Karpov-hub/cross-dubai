Ext.define("Crm.modules.kyc.view.ProfileGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Profile KYC"),
  filterable: true,

  //controllerCls: "Crm.modules.kyc.view.ProfileGridController",

  fields: [
    "id",
    "ctime",
    "doc_type",
    "first_name",
    "middle_name",
    "last_name",
    "doc_num",
    "issue_date",
    "verified",
    "file"
  ],

  buildColumns: function() {
    return [
      {
        text: D.t("First name"),
        width: 120,
        flex: 1,
        sortable: true,
        dataIndex: "first_name",
        filter: true
      },
      {
        text: D.t("Middle name"),
        width: 120,
        flex: 1,
        sortable: true,
        dataIndex: "middle_name",
        filter: true
      },
      {
        text: D.t("Last name"),
        width: 120,
        flex: 1,
        sortable: true,
        dataIndex: "last_name",
        filter: true
      },
      {
        text: D.t("Document type"),
        width: 120,
        flex: 1,
        sortable: true,
        dataIndex: "doc_type",
        filter: true
      },
      {
        text: D.t("Document number"),
        width: 120,
        flex: 1,
        sortable: true,
        dataIndex: "doc_num",
        filter: true
      },
      {
        xtype: "datecolumn",
        format: "d.m.Y H:i",
        text: D.t("Issue date"),
        width: 130,
        flex: 1,
        sortable: true,
        dataIndex: "issue_date",
        filter: { xtype: "datefield", format: "d.m.Y" }
      },
      {
        text: D.t("Verification status"),
        width: 150,
        flex: 1,
        sortable: true,
        dataIndex: "verified",
        filter: true,
        renderer: (v, m, r) => {
          return D.t({ 1: "Pending", 2: "Resolved", 3: "Rejected" }[v]);
        }
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
            tpl: `<tpl for="file">
            <a href="${__CONFIG__.downloadFileLink}/{code}">{filename}</a> ({[parseInt(values.file_size/1024)]}K) <br/>
          </tpl>`
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
