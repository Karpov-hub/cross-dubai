Ext.define(
  "Crm.modules.accountsContracts.view.AccountsContractsGridController",
  {
    extend: "Core.grid.GridController",

    gotoRecordHash: function(data) {
      if (!!this.view.observeObject) {
        window.__CB_REC__ = this.view.observeObject;
      }
      if (data && data[this.view.model.idField]) {
        Ext.create(this.generateDetailsCls(), {
          noHash: true,
          scope: this.view,
          recordId: data[this.view.model.idField],
        });
      }
    },
  }
);
