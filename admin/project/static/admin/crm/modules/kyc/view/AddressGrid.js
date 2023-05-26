Ext.define("Crm.modules.kyc.view.AddressGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Address KYC"),
  filterable: true,

  // controllerCls: "Crm.modules.kyc.view.AddressGridController",

  fields: [
    "id",
    "ctime",
    "country",
    "state",
    "city",
    "zip_code",
    "address_type",
    "doc_type",
    "issue_date",
    "verified",
    "file"
  ],

  buildColumns: function() {
    return [
      {
        text: D.t("Country"),
        width: 120,
        sortable: true,
        dataIndex: "country",
        filter: true
      },
      {
        text: D.t("State"),
        flex: 1,
        sortable: true,
        dataIndex: "state",
        filter: true
      },
      {
        text: D.t("City"),
        width: 250,
        flex: 1,
        sortable: true,
        dataIndex: "city",
        filter: true
      },
      {
        text: D.t("ZIP Code"),
        width: 120,
        flex: 1,
        sortable: true,
        dataIndex: "zip_code",
        filter: true
      },
      {
        text: D.t("Address type"),
        width: 250,
        flex: 1,
        sortable: true,
        dataIndex: "address_type",
        filter: true
      },
      {
        text: D.t("Document type"),
        width: 200,
        flex: 1,
        sortable: true,
        dataIndex: "doc_type",
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
