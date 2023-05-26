Ext.define("Crm.modules.merchants.view.ViewMerchantsGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=merchantsExportTransfers]": {
        click: () => {
          this.exportTx({ report_name: "tradeHistoryCsv" });
        }
      },
      "[action=exportPlanTransfers]": {
        click: () => {
          this.exportTx({ report_name: "transfersByPlanReport" });
        }
      }
    });
    this.callParent();
  },

  exportTx(data = {}) {
    let merchant_id;
    if (
      this.view &&
      this.view.store &&
      this.view.store.data &&
      this.view.store.data.items.length
    ) {
      merchant_id = this.view.store.data.items[0].data.id;
    }

    Ext.create("Crm.modules.transfers.view.ExportTransfersForm", {
      scope: this.view,
      merchant_id: merchant_id || null,
      user_id: data.user_id || null,
      report_name: data.report_name
    });
  },

  addRecord: function() {
    var me = this;
    me.view.model.getNewObjectId(function(_id) {
      if (!!me.view.observeObject) {
        window.__CB_REC__ = me.view.observeObject;
        //window.__CB_REC__[me.view.model.idField] = _id
      }
      var oo = {};
      oo[me.view.model.idField] = _id;
      oo.newRec = true;
      me.gotoRecordHash(oo);
    });
  },

  gotoRecordHash: function(data) {
    if (!!this.view.observeObject) {
      window.__CB_REC__ = this.view.observeObject;
    }
    if (data.newRec) {
      if (this.view.detailsInDialogWindow) {
        hash =
          "Crm.modules.merchants.view.MerchantsForm" +
          "~" +
          data[this.view.model.idField];

        Ext.create("Crm.modules.merchants.view.MerchantsForm", {
          noHash: true,
          recordId: data[this.view.model.idField]
        });
      } else if (this.view.detailsInNewWindow) window.open("./#" + hash);
      else location.hash = hash;
    } else if (data && data[this.view.model.idField]) {
      var hash =
        this.generateDetailsCls() + "~" + data[this.view.model.idField];
      if (this.view.detailsInDialogWindow) {
        Ext.create(this.generateDetailsCls(), {
          noHash: true,
          recordId: data[this.view.model.idField]
        });
      } else if (this.view.detailsInNewWindow) window.open("./#" + hash);
      else location.hash = hash;
    }
  }
});
