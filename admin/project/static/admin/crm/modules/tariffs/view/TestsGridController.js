Ext.define("Crm.modules.tariffs.view.TestsGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=run_all_tests]": {
        click: async () => {
          await this.runAllTests();
        }
      }
    });
    this.view.on("run_test", async (grid, indx) => {
      await this.runTest(grid.getStore().getAt(indx).data.id);
    });
    this.callParent();
  },

  gotoRecordHash: function(data) {
    if (!!this.view.observeObject) {
      window.__CB_REC__ = this.view.observeObject;
    }
    if (data && data[this.view.model.idField]) {
      Ext.create(this.generateDetailsCls(), {
        noHash: true,
        scope: this.view,
        recordId: data[this.view.model.idField]
      });
    }
  },

  async runAllTests() {
    let data = this.view.store.getData();
    for (item of data.items) await this.runTest(item.id);
  },

  async runTest(test_id) {
    await this.model.runTest(test_id);
  }
});
