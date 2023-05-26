Ext.define("Crm.modules.managers.view.ManagersGridController", {
  extend: "Core.grid.EditableGridController",

  setControls: function() {
    const me = this;
    this.view.on("save", () => {
      me.model.reloadGridData();
    });
    this.callParent(arguments);
  }
});
