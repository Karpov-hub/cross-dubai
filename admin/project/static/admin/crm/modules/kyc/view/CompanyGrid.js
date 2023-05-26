Ext.define("Crm.modules.kyc.view.CompanyGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Company KYC"),
  filterable: true,

  //controllerCls: "Crm.modules.kyc.view.CompanyGridController",

  fields: [
    "id",
    "ctime",
    "name",
    "registrar_name",
    "tax_number",
    "business_type",
    "registration_number",
    "registration_date",
    "years_in_business",
    "numbers_of_employees",
    "incorporation_form",
    "date_of_last_financial_activity_report",
    "use_trade_licence",
    "directors",
    "shareholders",
    "beneficial_owner",
    "phone",
    "verified",
    "file"
  ],

  buildColumns: function() {
    return [
      {
        text: D.t("Name"),
        width: 120,
        sortable: true,
        dataIndex: "name",
        filter: true
      },
      {
        text: D.t("Registrar name"),
        width: 120,
        flex: 1,
        sortable: true,
        dataIndex: "registrar_name",
        filter: true
      },
      {
        text: D.t("Tax number"),
        width: 120,
        flex: 1,
        sortable: true,
        dataIndex: "tax_number",
        filter: true
      },
      {
        text: D.t("Registration number"),
        width: 120,
        flex: 1,
        sortable: true,
        dataIndex: "registration_number",
        filter: true
      },
      {
        xtype: "datecolumn",
        format: "d.m.Y H:i",
        text: D.t("Registration date"),
        width: 130,
        flex: 1,
        sortable: true,
        dataIndex: "registration_date",
        filter: { xtype: "datefield", format: "d.m.Y" }
      },
      {
        text: D.t("Incorporation form"),
        width: 120,
        flex: 1,
        sortable: true,
        dataIndex: "incorporation_form",
        filter: true
      },
      {
        text: D.t("Beneficial owner"),
        width: 120,
        flex: 1,
        sortable: true,
        dataIndex: "beneficial_owner",
        filter: true
      },
      {
        text: D.t("Phone"),
        width: 120,
        flex: 1,
        sortable: true,
        dataIndex: "phone",
        filter: true
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
            tpl: `<span>
            Files: 
          <tpl for="file">
            <a href="${__CONFIG__.downloadFileLink}/{code}">{filename}</a> ({[parseInt(values.file_size/1024)]}K) <br/>
          </tpl>
          <span>Years in business: </a> <strong>{years_in_business}</strong> <br/>
          <span>Numbers of employees: </a> <strong>{numbers_of_employees}</strong> <br/>
          <span>Date of last financial activity report: </a> <strong>{date_of_last_financial_activity_report}</strong> <br/>
          <span>Directors: </a> <strong>{directors}</strong> <br/>
          <span>Use trade license: </a> <strong>{use_trade_licence}</strong> <br/>
          <span>Shareholders: </a> <strong>{shareholders}</strong> <br/>
          </span>`
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
