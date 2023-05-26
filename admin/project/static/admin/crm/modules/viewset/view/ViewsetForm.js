Ext.define("Crm.modules.viewset.view.ViewsetForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("View: {name}"),
  iconCls: "x-fa fa-eye",

  formLayout: "border",

  formMargin: 0,
  controllerCls: "Crm.modules.viewset.view.ViewsetFormController",

  buildItems() {
    return [this.buildFormFields(), this.buildResultGrid()];
  },

  buildFormFields() {
    return {
      xtype: "panel",
      region: "west",
      width: "50%",
      padding: 5,
      split: true,
      layout: "border",
      items: [
        {
          xtype: "fieldcontainer",
          layout: "anchor",
          region: "north",
          height: 30,
          defaults: {
            xtype: "textfield",
            anchor: "100%"
          },
          items: [
            {
              name: "id",
              hidden: true
            },
            {
              name: "name",
              fieldLabel: D.t("View Name")
            }
          ]
        },
        {
          xtype: "textarea",
          region: "center",
          name: "sql",
          emptyText: D.t("SQL")
        }
      ]
    };
  },

  buildResultGrid: function() {
    this.resultStore = Ext.create("Ext.data.Store", {
      fields: ["name"],
      data: []
    });

    return {
      title: D.t("Results"),
      xtype: "grid",
      action: "resultgrid",
      region: "center",
      viewConfig: {
        enableTextSelection: true
      },
      tbar: [
        {
          text: D.t("Test SQL"),
          action: "test"
        }
      ],
      store: this.resultStore,
      split: true,
      columns: [{ text: "Result", dataIndex: "name", flex: 1 }]
    };
  }
});
