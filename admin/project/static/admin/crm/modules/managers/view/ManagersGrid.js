Ext.define("Crm.modules.managers.view.ManagersGrid", {
  extend: "Core.grid.EditableGrid",

  title: D.t("Managers"),
  iconCls: "x-fa fa-user-tie",

  controllerCls: "Crm.modules.managers.view.ManagersGridController",

  buildCellEditing: function() {
    var me = this;
    this.pluginCellEditing = Ext.create("Ext.grid.plugin.CellEditing", {
      clicksToEdit: 2,
      listeners: {
        beforeedit: function(editor, e) {
          //me.editedRecord = e.record;
          if (me.permis.modify) me.fireEvent("beforeedit", editor, e);
        },
        edit: function(editor, e) {
          if (me.permis.modify) me.fireEvent("edit", editor, e);
        },
        calceledit: function(editor, e) {
          console.log("eee");
        }
      }
    });
    return this.pluginCellEditing;
  },

  buildColumns: function() {
    return [
      {
        dataIndex: "id",
        hidden: true
      },
      {
        text: D.t("Manager"),
        flex: 1,
        sortable: true,
        dataIndex: "admin_id",
        filter: true,
        editor: false,
        renderer: (v, m, r) => {
          return r.data.name ? r.data.name : r.data.login ? r.data.login : "-";
        }
      },
      {
        text: D.t("Users"),
        flex: 1,
        sortable: true,
        dataIndex: "clients",
        filter: true,
        editor: {
          xtype: "combo",
          multiSelect: true,
          displayField: "legalname",
          editable: false,
          valueField: "id",
          store: Ext.create("Core.data.ComboStore", {
            dataModel: Ext.create(
              "Crm.modules.accountHolders.model.UsersModel"
            ),
            fieldSet: "id,legalname",
            scope: this
          })
        },
        renderer: function(v, m, r) {
          if (!v) return [];
          if (!r.data.clients_data) return [];
          return r.data.clients_data.map((el) => el.legalname).join(", ");
        }
      }
    ];
  },

  buildTbar() {
    let tbar_buttons = this.callParent(arguments);
    return [tbar_buttons[2]];
  },

  buildButtonsColumns: function() {
    return [];
  }
});
