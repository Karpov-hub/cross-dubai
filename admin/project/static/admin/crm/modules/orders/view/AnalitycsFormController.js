Ext.define("Crm.modules.orders.view.AnalitycsFormController", {
  extend: "Core.form.FormController",

  gotoRecordHash() {},

  setControls: function() {
    this.control({
      "[action=get_analitycs]": {
        click: async () => {
          await this.getAnalytics(this.view.down("form").getValues());
        }
      }
    });
    this.callParent(arguments);
  },
  async getAnalytics(formData) {
    formData.merchant = this.view.scope.currentData.id;
    let data = await this.model.prepareData(formData);
    
    let additionCols = [
      {
        gridCol: { text: "Fee", dataIndex: "fee", flex: 1 },
        storeField: "fee"
      },
      {
        gridCol: { text: "Referal", dataIndex: "referal", flex: 1 },
        storeField: "referal"
      },
      {
        gridCol: { text: "Insurance", dataIndex: "insurance", flex: 1 },
        storeField: "insurance"
      },
      {
        gridCol: { text: "Fine", dataIndex: "fine", flex: 1 },
        storeField: "fine"
      },
      {
        gridCol: { text: "Refund", dataIndex: "refund", flex: 1 },
        storeField: "refund"
      },
      {
        gridCol: { text: "Other", dataIndex: "other", flex: 1 },
        storeField: "other"
      }
    ];

    let storeFeilds = ["id", "order_id", "orgname", "ctime", "transfer"];
    let cols = [
      { text: "Id", dataIndex: "id", flex: 1, hidden: true },
      { text: "Order id", dataIndex: "order_id", flex: 1, hidden: true },
      { text: "Organization", dataIndex: "orgname", flex: 1 },
      {
        xtype: "datecolumn",
        format: "d.m.Y H:i:s",
        text: "Order date",
        dataIndex: "ctime",
        flex: 1
      },
      { text: "Transfer", dataIndex: "transfer", flex: 1 }
    ];
    for (addCol of additionCols)
      for (d of data)
        if (d[addCol.gridCol.dataIndex]) {
          cols.push(addCol.gridCol);
          storeFeilds.push(addCol.storeField);
          break;
        }

    let analyticsStore = Ext.create("Ext.data.Store", {
      fields: storeFeilds,
      data,
    });
    this.view.analyticsGrid.setConfig("store", analyticsStore);
    this.view.analyticsGrid.setConfig("columns", cols);
    return true;
  }
});
