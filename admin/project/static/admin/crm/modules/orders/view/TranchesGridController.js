Ext.define("Crm.modules.orders.view.TranchesGridController", {
  extend: "Core.grid.GridController",

  mixins: [
    "Crm.modules.orders.view.FieldsHelper"
    // "Crm.modules.orders.view.orderTypes.CardsWithWithdrawalFiatFunctions",
    // "Crm.modules.orders.view.orderTypes.CardsWithWithdrawalFunctions"
  ],

  setControls() {
    this.control({
      "[action=add_new_tranche]": {
        click: () => {
          this.openTrancheDetailsPanel();
        }
      },
      grid: {
        celldblclick: (cell, td, i, rec) => {
          this.openTrancheDetailsPanel(rec);
        }
      }
    });
    this.callParent();
  },

  deleteRecord_do: function(store, rec) {
    if (
      this.view.scope.down("[name=tranche_details_panel]").isVisible() &&
      this.view.scope.down("[name=tranche_id]").getValue() == rec.data.id
    )
      return Ext.toast("Close tranche before deleting");
    let WCNOrderModel = Ext.create("Crm.modules.orders.model.WCNOrderModel", {
      scope: this
    });
    let me = this;
    D.c("Removing", "Delete the record?", [], function() {
      me.view.model.remove([rec.data[me.view.model.idField]], async function() {
        store.remove(rec);
        await WCNOrderModel.refreshTranchesNumbering(rec.data.ref_id);
      });
    });
  },

  async openTrancheDetailsPanel(rec = {}) {
    const fields_data = this.getFieldsValues(this.view.scope, [
      "from_currency",
      "to_currency",
      "tranche_id",
      "order_type",
      "id"
    ]);
    if (rec && rec.id == fields_data.tranche_id) {
      this.view.scope.down("[name=order_totals_panel]").setVisible(false);
      this.view.scope.down("[name=tranche_details_panel]").setVisible(true);
      rec.amount_tranche_currency = fields_data.from_currency;
      rec.to_currency_amount_tranche_currency = fields_data.to_currency;
      this.view.scope
        .down("[name=tranche_details_panel]")
        .getForm()
        .setValues(rec);
      return;
    }
    const tranche_panel = this.view.scope.down("[name=tranche_panel]").items
      .items[0];

    let mask = new Ext.LoadMask({
      msg: D.t("Loading..."),
      target: this.view
    });
    mask.show();

    let new_record = false;
    if (!rec || !rec.hasOwnProperty("id")) {
      new_record = true;
      rec = tranche_panel.getEmptyTrancheData();
    }

    this.view.scope.down("[name=order_totals_panel]").setVisible(false);
    this.view.scope.down("[name=tranche_details_panel]").setVisible(true);
    if (!rec.id) rec.id = await this.model.generateUUID();
    rec.tranche_id = rec.id;
    if (rec.data && rec.data.data) rec = Object.assign(rec, rec.data.data);
    rec.amount_tranche_currency = fields_data.from_currency;
    rec.to_currency_amount_tranche_currency = fields_data.to_currency;
    this.view.scope
      .down("[name=tranche_details_panel]")
      .getForm()
      .setValues(rec);
    tranche_panel.setCurrenciesFieldsValues({
      from_currency: fields_data.from_currency,
      to_currency: fields_data.to_currency
    });
    tranche_panel.calculateTrancheData();
    mask.hide();
  },

  gotoRecordHash() {}
});
