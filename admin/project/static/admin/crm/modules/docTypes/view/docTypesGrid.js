Ext.define("Crm.modules.docTypes.view.docTypesGrid", {
  extend: "Core.grid.GridContainer",
  title: D.t("Document type"),

  filterable: true,
  fields: ["id", "name"],
  controllerCls: "Crm.modules.docTypes.view.docTypesGridController",

  buildColumns: function() {
    return [
      {
        text: D.t("Name"),
        flex: 1,
        sortable: true,
        dataIndex: "name",
        editor: { xtype: "textfield", allowBlank: false }
      }
    ];
  },
  buildPlugins() {
    var me = this;
    let plugins = this.callParent();
    plugins.push({
      ptype: "rowediting",
      clicksToEdit: 2,
      autoCancel: false,
      listeners: {
        beforeedit: function(editor, e) {
          me.editedRecord = e.record;
          me.fireEvent("beforeedit", editor, e);
        },
        edit: function(editor, e) {
          me.fireEvent("onUpdateClick", editor, e);
        }
      }
    });
    return plugins;
  },
  buildTbar: function() {
    this.callParent(arguments);
    var me = this;
    var items = [
      {
        text: this.buttonAddText,
        tooltip: this.buttonAddTooltip,
        iconCls: "x-fa fa-plus",
        scale: "medium",
        handler: function(grid, rowIndex) {
          me.fireEvent("add", grid, rowIndex);
        }
      }
    ];
    items.push("-", {
      tooltip: this.buttonReloadText,
      iconCls: "x-fa fa-sync",
      action: "refresh"
    });

    if (this.filterable) items.push("->", this.buildSearchField());
    return items;
  }
});
