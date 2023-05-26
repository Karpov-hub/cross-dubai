Ext.define("Crm.modules.tariffs.view.actions.Transfer", {
  extend: "Ext.form.FieldContainer",

  layout: "anchor",

  defaults: {
    anchor: "100%",
    labelWidth: 150
  },

  initComponent() {
    this.items = [
      {
        fieldLabel: D.t("Tx type"),
        aname: "txtype",
        xtype: "combo",
        displayField: "type",
        valueField: "type",
        store: {
          fields: ["type"],
          data: [
            { type: "transfer" },
            { type: "fee" },
            { type: "referal" },
            { type: "insurance" },
            { type: "fine" },
            { type: "refund" },
            { type: "other" }
          ]
        }
      },
      {
        fieldLabel: D.t("Key field"),
        aname: "parent_id",
        xtype: "treecombo",
        store: this.scope.id_store
      },
      {
        xtype: "fieldcontainer",
        layout: "anchor",
        defaults: {
          xtype: "treecombo",
          store: this.scope.acc_store,
          labelWidth: 150,
          displayField: "_id",
          valueField: "_id",
          anchor: "100%"
        },
        items: [
          {
            fieldLabel: D.t("Source account no"),
            //margin: "0 5 0 0",
            aname: "acc_src"
          },
          {
            fieldLabel: D.t("Dist. account no"),
            //margin: "0 0 0 5",
            aname: "acc_dst"
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        items: [
          {
            fieldLabel: D.t("Amount"),
            aname: "fee",
            flex: 1,
            labelWidth: 150,
            margin: "0 5 0 0",
            xtype: "textfield"
          },
          {
            emptyText: D.t("Currency"),

            aname: "currency",
            xtype: "combo",
            valueField: "key",
            margin: "0 5 0 0",
            width: 150,
            displayField: "text",
            store: {
              fields: ["key", "text"],
              data: [
                { key: "src", text: "Currency or src account" },
                { key: "dst", text: "Currency or dist account" }
              ]
            }
          },
          {
            emptyText: D.t("Amount type"),
            width: 120,
            aname: "feetype",
            xtype: "combo",
            valueField: "type",
            margin: "0 5 0 0",
            displayField: "type",
            listeners: {
              change: (el, v) => {
                el.up("fieldcontainer")
                  .down("[aname=currency]")
                  .setDisabled(v == "PERCENTS");
              }
            },
            store: {
              fields: ["type"],
              data: [{ type: "ABS" }, { type: "PERCENTS" }]
            }
          },
          {
            emptyText: D.t("Amount field"),
            width: 170,
            aname: "amount_field",
            xtype: "treecombo",
            displayField: "_id",
            valueField: "_id",

            store: this.scope.amount_store
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        height: 30,
        items: [
          {
            fieldLabel: D.t("Hold transaction"),
            aname: "hold",
            xtype: "checkbox",
            labelWidth: 150,
            height: 30,
            margin: "0 30 0 0"
          },
          {
            fieldLabel: D.t("Hidden"),
            height: 30,
            aname: "hidden",
            xtype: "checkbox"
          }
        ]
      },
      {
        fieldLabel: D.t("Description for sender"),
        aname: "description_src",
        xtype: "textfield"
      },
      {
        fieldLabel: D.t("Description for recipient"),
        aname: "description_dst",
        xtype: "textfield"
      }
    ];
    this.callParent(arguments);
  }
});
