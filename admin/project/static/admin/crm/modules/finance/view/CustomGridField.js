Ext.define("Crm.modules.finance.view.CustomGridField", {
  extend: "Desktop.core.widgets.GridField",
  alias: "widget.customgridfield",
  buildTbar: function() {
    let items = this.callParent(arguments);
    items.add(1, {
      text: D.t("Add group"),
      iconCls: "fa fa-plus",
      activity: "add",
      handler:()=> {
          Ext.create('Crm.modules.finance.view.AddGroupForm',{
            noHash: true,
            scope:this
          })
      }
    });
    return items;
  }
});
