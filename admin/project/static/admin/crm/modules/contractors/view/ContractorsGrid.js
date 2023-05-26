Ext.define("Crm.modules.contractors.view.ContractorsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Contractors"),
  iconCls: "x-fa fa-users",

  filterable: true,
  filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Company Name"),
        flex: 1,
        sortable: true,
        dataIndex: "name",
        filter: true
      },
      {
        text: D.t("Reg. №"),
        flex: 1,
        sortable: true,
        dataIndex: "reg_num",
        filter: true
      },
      {
        text: D.t("Agreement №"),
        flex: 1,
        sortable: true,
        dataIndex: "agreement_num",
        filter: true
      },
      {
        text: D.t("Agreement Date"),
        flex: 1,
        sortable: true,
        dataIndex: "agreement_date",
        format: "d.m.Y",
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        renderer: (v) => {
          return Ext.Date.format(new Date(v), "d.m.Y");
        }
      },
      {
        text: D.t("Phone"),
        flex: 1,
        sortable: true,
        dataIndex: "phone",
        filter: true
      },
      {
        text: D.t("E-mail"),
        flex: 1,
        sortable: true,
        dataIndex: "email",
        filter: true
      }
    ];
  }
});
