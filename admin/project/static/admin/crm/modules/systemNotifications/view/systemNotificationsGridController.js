Ext.define(
  "Crm.modules.systemNotifications.view.systemNotificationsGridController",
  {
    extend: "Core.grid.GridController",

    deleteRecord_do: function(store, rec) {
      var me = this;
      D.c("Removing", "Delete the record?", [], function() {
        me.view.model.remove([rec.data[me.view.model.idField]], async () => {
          store.remove(rec);
          await me.model.callApi("auth-service", "removeSystemNotifications", {
            parent_id: rec.data[me.view.model.idField]
          });
        });
      });
    }
  }
);
