Ext.define("Crm.modules.contracts.view.ContractsGrid", {
  extend: "Core.grid.GridContainer",

  detailsInDialogWindow: true,
  title: null,

  buildColumns() {
    let renderer = (v, m, r) => {
      if (r.data.status == 2) m.tdCls = "contract-status-2";
      if (r.data.status == 1) m.tdCls = "contract-status-1";
      if (new Date(r.data.expiration_date) <= new Date())
        m.tdCls = "contract-status-2";
      return v;
    };
    return [
      {
        text: D.t("Signatory"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "director_name",
        renderer
      },
      {
        text: D.t("Contract's Subject"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "contract_subject",
        renderer
      },
      {
        text: D.t("Status"),
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "status",
        renderer: (v, m, r) => {
          renderer(v, m, r);
          return D.t(["Pending", "Approved", "Terminated"][v]);
        }
      },
      {
        text: D.t("Contract Date"),
        xtype: "datecolumn",
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "contract_date",
        renderer: (v, m, r) => {
          renderer(v, m, r);
          return Ext.Date.format(new Date(v), "Y-m-d");
        }
      },
      {
        text: D.t("Expiration Date"),
        xtype: "datecolumn",
        flex: 1,
        sortable: true,
        filter: true,
        dataIndex: "expiration_date",
        renderer: (v, m, r) => {
          renderer(v, m, r);
          return Ext.Date.format(new Date(v), "Y-m-d");
        }
      }
    ];
  }
});
