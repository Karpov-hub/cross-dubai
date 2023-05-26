Ext.define("Crm.modules.clientRoles.view.ClientRolesGrid", {
  extend: "Core.grid.GridContainer",

  title: D.t("Client roles"),
  iconCls: "x-fa fa-users-cog",

  detailsInDialogWindow: true,

  filterable: true,
  filterbar: true,

  buildColumns: function() {
    return [
      {
        text: D.t("Role name"),
        sortable: true,
        dataIndex: "name",
        filter: true,
        flex: 1
      },
      {
        text: D.t("Creation date"),
        width: 150,
        sortable: true,
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "ctime",
        renderer(v){
            return Ext.Date.format(new Date(v),"d.m.Y H:i:s")
        }
      },
      {
        text: D.t("Is default"),
        width: 80,
        dataIndex: "is_default"
      }
    ];
  }
});
