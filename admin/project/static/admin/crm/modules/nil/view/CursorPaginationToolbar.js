Ext.define("Crm.modules.nil.view.CursorPaginationToolbar", {
  extend: "Ext.toolbar.Toolbar",

  config: {
    link_previous: null,
    link_next: null,
    scope: null
  },
  items: [
    {
      iconCls: "fa fa-chevron-left",
      action: "go_cursor_left",
      async handler() {
        await this.ownerCt.scope.controller.loadGridStore(
          this.ownerCt.link_previous
        );
      }
    },
    {
      iconCls: "fa fa-chevron-right",
      action: "go_cursor_right",
      async handler() {
        await this.ownerCt.scope.controller.loadGridStore(
          this.ownerCt.link_next
        );
      }
    }
  ]
});
