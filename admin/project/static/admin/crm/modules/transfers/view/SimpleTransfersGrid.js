Ext.define("Crm.modules.transfers.view.SimpleTransfersGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Transfers"),

  mixins: ["Crm.modules.systemNotifications.view.DatesFunctions"],

  filterable: true,
  filterbar: true,

  controllerCls: "Crm.modules.transfers.view.SimpleTransfersGridController",

  gridCfg: {
    viewConfig: {
      getRowClass: (record) => {
        let classString = Ext.platformTags.phone?"":"simpleTransfer";
        if (record.data.status == "PENDING") classString += " pending";
        return classString;
      }
    }
  },

  buildColumns: function() {
    let me = this;
    if (Ext.platformTags.phone)
      return [
        {
          dataIndex: "id",
          flex: 1,
          renderer: (v, m, r) => {
            return `<p>Status: ${r.data.status}</p>
                    <p>Started: ${r.data.started}</p>
                    ${r.data.finished?`<p>Finished: ${r.data.finished}</p>`:''}
                    <br>
                    <p>Sender: ${r.data.sender}</p>
                    <p>Address: ${r.data.sender_address}</p>
                    <br>
                    ${r.data.receiver?`<p>Receiver: ${r.data.receiver}</p>`:""}
                    <p>Address: ${r.data.receiver_address}</p>
                    <br>
                    <p>Amount: ${r.data.amount} ${r.data.currency}</p>
                    <p>Result amount: ${r.data.result_amount} ${r.data.result_currency}</p>
                    <p>Network fee: ${r.data.fee} ${r.data.fee_currency}</p>
                    <p>Hash: ${v?`<a target="_blank" href="${r.data.hash_url}" >${v}</a>`:"-"}</p>
                    `;
          }
        }
      ];
    return [
      {
        dataIndex: "started",
        text: D.t("Period"),
        width: 240,
        noCopy: true,
        renderer: (v, m, r) => {
          let output_str = "<ul>";
          if (v)
            output_str += `<li>Started: ${Ext.Date.format(
              me.addTimestamp(v),
              "d.m.Y H:i:s"
            )}</li>`;
          if (r.data.finished)
            output_str += `<li>Finished: ${Ext.Date.format(
              me.addTimestamp(r.data.finished),
              "d.m.Y H:i:s"
            )}</li>`;
          return (output_str += "</ul>");
        }
      },
      {
        dataIndex: "sender_address",
        text: D.t("Sender"),
        cellWrap: true,
        copyValue: ["sender_address", { field: "sender", text: "merchant" }],
        filter: true,
        flex: 1,
        renderer: (v, m, r) => {
          let short_addr = `${v.substring(0, 5)}...${v.substring(
            v.length - 5,
            v.length
          )}`;
          m.tdAttr = 'data-qtip="' + v + '"';
          if (r.data.sender) return `${r.data.sender} (${short_addr})`;
          return short_addr;
        }
      },
      {
        dataIndex: "receiver_address",
        text: D.t("Receiver"),
        cellWrap: true,
        copyValue: ["receiver_address", { field: "sender", text: "merchant" }],
        filter: true,
        flex: 1,
        renderer: (v, m, r) => {
          let short_addr = `${v.substring(0, 5)}...${v.substring(
            v.length - 5,
            v.length
          )}`;
          m.tdAttr = 'data-qtip="' + v + '"';
          if (r.data.receiver) return `${r.data.receiver} (${short_addr})`;
          return short_addr;
        }
      },
      {
        dataIndex: "amount",
        text: D.t("Amount"),
        noCopy: true,
        width: 200,
        renderer: (v, m, r) => {
          return `${v} ${r.data.currency}`;
        }
      },
      {
        dataIndex: "result_amount",
        text: D.t("Result amount"),
        noCopy: true,
        width: 200,
        renderer: (v, m, r) => {
          return v ? `${v} ${r.data.result_currency}` : "-";
        }
      },
      {
        text: D.t("Status"),
        width: 130,
        sortable: true,
        dataIndex: "status",
        noCopy: true,
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          editable: false,
          store: ["PENDING", "COMPLETED", "ERROR", "CANCELED"],
          operator: "eq"
        }
      },
      {
        dataIndex: "hash",
        text: D.t("Hash"),
        filter: true,
        copyValue: ["hash_url"],
        width: 200,
        renderer: (v, m, r) => {
          return v
            ? `<a target="_blank" href="${r.data.hash_url}" >${v}</a>`
            : "-";
        }
      },
      {
        dataIndex: "admin_description",
        text: D.t("Description"),
        filter: true,
        noCopy: true,
        width: 100,
        renderer(v, m) {
          if (v) m.tdAttr = 'data-qtip="' + v + '"';
          return v;
        }
      },
      {
        dataIndex: "fee",
        text: D.t("Fee"),
        noCopy: true,
        width: 200,
        renderer: (v, m, r) => {
          return v ? `${v} ${r.data.fee_currency}` : "-";
        }
      },
      {
        dataIndex: "plan_name",
        text: D.t("Plan name"),
        filter: true,
        noCopy: true,
        hidden: true,
        flex: 1
      }
    ];
  },

  buildButtonsColumns: function() {
    var me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 80,
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-eye",
            tooltip: D.t("Show error log"),
            isDisabled: function(grid, rowIdx, colIdx, item, record) {
              return record.data.status != "ERROR";
            },
            handler: function(grid, rowIdx, colIdx, item, e, record) {
              me.fireEvent("showErrorLog", record.data);
            }
          },
          {
            iconCls: "x-fa fa-ban",
            tooltip: D.t("Cancel"),
            isDisabled: function(grid, rowIdx, colIdx, item, record) {
              if (record.data.status != "PENDING") return true;
              return !me.permis.modify;
            },
            handler: function(grid, rowIdx, colIdx, item, e, record) {
              me.fireEvent("cancel", record.data);
            }
          },
          {
            iconCls: "x-fa fa-sync",
            tooltip: D.t("Resume"),
            isDisabled: function(grid, rowIdx, colIdx, item, record) {
              if (record.data.status != "PENDING") return true;
              return !me.permis.modify;
            },
            handler: function(grid, rowIdx, colIdx, item, e, record) {
              me.fireEvent("resume", record.data);
            }
          }
        ]
      }
    ];
  },

  buildTbar: function() {
    let tbar = this.callParent(arguments);
    return [tbar[2]];
  }
});
