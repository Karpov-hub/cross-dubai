Ext.define("Crm.modules.orders.view.CustomGridsAdvertisingForm", {
  extend: "Core.form.FormWindow",

  controllerCls: "Crm.modules.orders.view.CustomGridsAdvertisingFormController",

  onActivate() {},
  onClose() {},
  titleTpl: D.t("Custom Advertising Report: {date_from} - {date_to}"),

  buildItems() {
    return {
      xtype: "panel",
      layout: "hbox",
      defaults: {
        flex: 1,
        xtype: "gridpanel",
        layout: "fit",
        height: Ext.Element.getViewportHeight() * 0.79,
        scrollbar: true
      },
      items: [
        {
          title: D.t("General stats"),
          selModel: {
            selType: "checkboxmodel"
          },
          name: "general_stats_grid",
          store: {
            fields: ["date", "usd"],
            data: []
          },
          tools: [
            {
              xtype: "displayfield",
              value: D.t("Total spent: ")
            },
            {
              xtype: "displayfield",
              name: "general_stats_selected_total",
              value: 0.0
            }
          ],
          columns: [
            {
              xtype: "datecolumn",
              dataIndex: "date",
              text: D.t("Date"),
              flex: 1
            },
            {
              dataIndex: "usd",
              text: D.t("Spent"),
              flex: 1
            }
          ]
        },
        {
          title: D.t("Transactions"),
          name: "transactions_grid",
          selModel: {
            selType: "checkboxmodel"
          },
          plugins: [
            Ext.create("Ext.grid.plugin.RowEditing", {
              clicksToEdit: 2,
              listeners: {
                beforeedit: function(editor, el) {
                  return !!el.record.data.manual;
                }
              }
            })
          ],
          store: {
            fields: [
              "ctime",
              "amount",
              "currency",
              "result_amount",
              "result_currency"
            ],
            data: []
          },
          tools: [
            {
              xtype: "button",
              iconCls: "x-fa fa-plus",
              text: D.t("Add transaction"),
              action: "add_empty_transaction"
            },
            {
              xtype: "displayfield",
              value: D.t("Total amount: ")
            },
            {
              xtype: "displayfield",
              name: "transactions_selected_total",
              value: 0.0
            }
          ],
          columns: [
            {
              flex: 1,
              dataIndex: "ctime",
              xtype: "datecolumn",
              format: "d.m.Y",
              text: D.t("Creation time"),
              editor: {
                xtype: "xdatefield",
                format: D.t("d/m/Y"),
                allowBlank: false
              }
            },
            {
              flex: 1,
              dataIndex: "amount",
              text: D.t("Amount"),
              editor: {
                xtype: "numberfield",
                allowBlank: false
              }
            },
            {
              flex: 1,
              dataIndex: "currency",
              text: D.t("Currency"),
              editor: {
                xtype: "combo",
                displayField: "abbr",
                allowBlank: false,
                valueField: "abbr",
                store: Ext.create("Core.data.ComboStore", {
                  dataModel: Ext.create(
                    "Crm.modules.currency.model.ActiveCurrencyModel"
                  ),
                  fieldSet: ["abbr"],
                  scope: this
                })
              }
            },
            {
              flex: 1,
              dataIndex: "result_amount",
              text: D.t("Amount paid to client"),
              editor: {
                xtype: "numberfield",
                allowBlank: false
              }
            },
            {
              flex: 1,
              dataIndex: "result_currency",
              text: D.t("Currency"),
              editor: {
                xtype: "combo",
                displayField: "abbr",
                valueField: "abbr",
                store: Ext.create("Core.data.ComboStore", {
                  dataModel: Ext.create(
                    "Crm.modules.currency.model.ActiveCurrencyModel"
                  ),
                  fieldSet: ["abbr"],
                  scope: this
                })
              }
            },
            {
              flex: 1,
              dataIndex: "monitoring_address",
              text: D.t("Monitoring address")
            }
          ]
        }
      ]
    };
  },

  buildButtons() {
    let items = this.callParent(arguments);
    return [
      items[1],
      {
        text: D.t("Generate PDF report"),
        action: "generate_report_pdf",
        iconCls: "x-fa fa-print",
        scale: "medium"
      },
      {
        text: D.t("Generate DOCX report"),
        action: "generate_report_docx",
        iconCls: "x-fa fa-print",
        scale: "medium"
      },
      {
        text: D.t("Generate XLSX report"),
        action: "generate_report_xlsx",
        iconCls: "x-fa fa-print",
        scale: "medium"
      },
      items[4],
      items[5]
    ];
  }
});
