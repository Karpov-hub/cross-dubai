Ext.define("Crm.modules.reports.view.ReportsQueueGrid", {
  extend: "Core.grid.GridContainer",

  controllerCls: "Crm.modules.reports.view.ReportsQueueGridController",
  filterbar: true,

  title: D.t("Reports queue"),
  iconCls: "x-fa fa-list",

  fields: ["id", "ctime", "report_description", "status", "file"],

  gridCfg: {
    viewConfig: {
      getRowClass: (record) => {
        if (record.data.status == 0) return "report-pending";
        if (record.data.status == 1) return "report-process";
        if (record.data.status == 3) return "report-error";
      }
    }
  },

  buildColumns: function() {
    return [
      {
        dataIndex: "id",
        hidden: true
      },
      {
        text: D.t("Create Date"),
        width: 150,
        sortable: true,
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "ctime",
        xtype: "datecolumn",
        renderer: (v) => {
          return Ext.Date.format(new Date(v), "d.m.Y H:i:s");
        }
      },
      {
        text: D.t("Report Description"),
        flex: 1,
        filter: true,
        dataIndex: "report_description"
      },
      {
        text: D.t("Status"),
        width: 200,
        sortable: true,
        filter: true,
        dataIndex: "status",
        filter: {
          xtype: "combo",
          valueField: "key",
          displayField: "val",
          store: {
            fields: ["key", "val"],
            data: [
              { key: 0, val: D.t("Pending") },
              { key: 1, val: D.t("In process") },
              { key: 2, val: D.t("Done") },
              { key: 3, val: D.t("Error") }
            ]
          }
        },
        renderer: (v, m, r) => {
          return D.t(
            { 0: "Pending", 1: "In process", 2: "Done", 3: "Error" }[v]
          );
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
            tpl: new Ext.XTemplate(
              "<div><div>",
              "<tpl if='error'><p><b>Error:</b><pre>{error}</pre></p></tpl>",
              `<tpl for="file"><p><a href="${__CONFIG__.downloadFileLink}/{code}">{name}</a></p><br/></tpl>`
            )
          }
        ]
      }
    });
    return plugins;
  },

  buildTbar: function() {
    this.items = [];

    this.items.push(
      {
        text: D.t("Generate wallet statement report"),
        action: "get-report"
      },
      "-",
      {
        text: D.t("Generate wallet fee report"),
        action: "get-wallet-fee-report"
      },
      "-",
      {
        tooltip: this.buttonReloadText,
        iconCls: "x-fa fa-sync",
        action: "refresh"
      }
    );

    return this.items;
  },

  buildButtonsColumns: function() {
    let me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 60,
        items: [
          {
            iconCls: "x-fa fa-sync",
            stopSelection: true,
            tooltip: D.t("Try again"),
            isDisabled: function(grid, rowIdx, colIdx, item, record) {
              return record.data.status != 3;
            },
            handler: (grid, rowIdx, colIdx, item, e, record) => {
              me.fireEvent("repeatRequestReport", grid, rowIdx, record);
            }
          },
          {
            iconCls: "x-fa fa-trash-alt",
            name: "remove",
            tooltip: D.t("Remove report"),
            isDisabled: function(grid, rowIndex) {
              return !me.permis.del;
            },
            handler: function(grid, rowIndex) {
              me.fireEvent("delete", grid, rowIndex);
            }
          }
        ]
      }
    ];
  }
});
