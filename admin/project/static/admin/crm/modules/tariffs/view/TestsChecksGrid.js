Ext.define("Crm.modules.tariffs.view.TestsChecksGrid", {
  extend: "Core.grid.EditableGrid",

  buildColumns() {
    let renderer = (v, m, r) => {
      m.tdCls = `test-status-${r.data.status}`;
      return v;
    };
    return [
      {
        dataIndex: "id",
        hidden: true
      },
      {
        dataIndex: "test_id",
        hidden: true
      },
      {
        dataIndex: "parameter",
        text: D.t("Parameter in response"),
        flex: 1,
        editor: true,
        renderer
      },
      {
        dataIndex: "status",
        hidden: true,
        renderer
      },
      {
        text: D.t("Operator"),
        width: 100,
        sortable: false,
        dataIndex: "operator",
        menuDisabled: true,
        editor: {
          xtype: "combo",
          valueField: "op",
          displayField: "op",
          value: "=",
          store: {
            fields: ["op"],
            data: [
              { op: "==" },
              { op: ">" },
              { op: ">=" },
              { op: "<" },
              { op: "<=" },
              { op: "includes" },
              { op: "regexp" }
            ]
          }
        },
        renderer
      },
      {
        dataIndex: "value",
        text: D.t("Value"),
        flex: 1,
        editor: true,
        renderer
      }
    ];
  }

  //   buildTbar() {},
  //   buildBbar() {}
});
