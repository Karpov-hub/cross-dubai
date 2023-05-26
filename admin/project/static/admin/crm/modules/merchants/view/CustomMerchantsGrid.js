Ext.define("Crm.modules.merchants.view.CustomMerchantsGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Custom names for deposits"),

  controllerCls: "Crm.modules.merchants.view.CustomMerchantsGridController",

  fields: ["id", "custom_name", "merchant_id"],

  buildColumns: function() {
    return [
      {
        text: D.t("Name"),
        flex: 2,
        sortable: true,
        dataIndex: "custom_name",
        filter: true
      }
    ];
  },

  buildTbar() {
    let items = this.callParent();
    items.splice(0, 2);
    return items;
  },

  buildButtonsColumns: function() {
    var me = this;
    return [
      {
        xtype: "actioncolumn",
        width: 30,
        menuDisabled: true,
        items: [
          {
            iconCls: "x-fa fa-trash-alt",
            tooltip: this.buttonDeleteTooltip,
            isDisabled: function() {
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
