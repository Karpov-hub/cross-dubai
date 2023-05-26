Ext.define("Crm.modules.docTypes.view.docTypesGridController", {
  extend: "Core.grid.GridController",
  setControls() {
    this.control();
    this.callParent(arguments);
    var me = this;
    this.view.on("add", function(grid, index) {
      me.addNewLine();
    });
    this.view.on("onUpdateClick", (el, data) => {
      this.prepareDataBeforeSave(data);
      this.view.store.reload();
    });
  },
  gotoRecordHash() {}, // переопределяем эту функцию, что бы при двойном клике не переходило к редактированию
  addNewLine: function() {
    this.view.store.add({
      name: null
    });
  },
  prepareDataBeforeSave: function(data) {
    console.log(data);
    var me = this;
    me.model.runOnServer(
      "saveNewDocType",
      {
        name: data.newValues.name
      },
      function(res) {
        if (res) {
          return true;
        }
      }
    );
  }
});
