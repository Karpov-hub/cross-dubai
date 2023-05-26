Ext.define("Crm.modules.accounts.view.UserAccountsGridController", {
  extend: "Core.grid.GridController",

  gotoRecordHash: function(data) {
    if (!!this.view.observeObject) {
      window.__CB_REC__ = this.view.observeObject;
    }
    var hash;
    if (data && data[this.view.model.idField]) {
      if (Object.keys(data).length == 1) {
        if (this.view.detailsInDialogWindow) {
          hash =
            "Crm.modules.accounts.view.UserAccountsForm" +
            "~" +
            data[this.view.model.idField];

          Ext.create("Crm.modules.accounts.view.UserAccountsForm", {
            noHash: true,
            recordId: data[this.view.model.idField]
          });
        } else if (this.view.detailsInNewWindow) window.open("./#" + hash);
        else location.hash = hash;
      } else {
        if (this.view.detailsInDialogWindow) {
          hash =
            "Crm.modules.accounts.view.AccountsForm" +
            "~" +
            data[this.view.model.idField];

          Ext.create("Crm.modules.accounts.view.AccountsForm", {
            noHash: true,
            recordId: data[this.view.model.idField]
          });
        } else if (this.view.detailsInNewWindow) window.open("./#" + hash);
        else location.hash = hash;
      }
    }
  },

  deleteRecord_do(store, rec) {
    D.c("Removing", "Delete the record?", [], async () => {
      await this.model.removeAccount({ data: rec.data });
      store.remove(rec);
    });
  }
});
