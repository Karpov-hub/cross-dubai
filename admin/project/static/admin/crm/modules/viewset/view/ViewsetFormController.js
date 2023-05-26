Ext.define("Crm.modules.viewset.view.ViewsetFormController", {
  extend: "Core.form.FormController",

  init: function(view) {
    this.model = Ext.create("Crm.modules.viewset.model.ViewsetModel");
    //this.setControls();
    this.callParent(arguments);
  },

  setControls: function() {
    this.control({
      "[action=test]": {
        click: el => {
          this.sendQuery();
        }
      }
    });

    this.callParent(arguments);
  },

  sendQuery: function() {
    this.lastQuery = this.view.down("[name=sql]").getValue();

    this.model.sendQuery(
      {
        q: this.lastQuery
      },
      res => {
        if (res.error) {
          alert(JSON.stringify(res.error, null, 4));
          this.view.resultStore.loadData([]);
          this.lastQuery = "";
          this.lastQueryDb = "";
        } else {
          if (res.data && res.data.length) {
            this.buildColumns(res.data);
          }
        }
      }
    );
  },

  buildColumns: function(data) {
    var grid = this.view.down("[action=resultgrid]"),
      columns = [],
      fields = [];

    Object.keys(data[0]).forEach(i => {
      let col = { text: i, dataIndex: i, flex: 1 };

      columns.push(col);
      fields.push(i);
    });
    grid.setConfig("columns", columns);
    this.view.resultStore.setConfig("fields", fields);
    this.view.resultStore.loadData(data);
  }
});
