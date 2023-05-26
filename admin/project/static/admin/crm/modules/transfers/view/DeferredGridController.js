Ext.define("Crm.modules.transfers.view.DeferredGridController", {
  extend: "Core.grid.GridController",

  async setControls() {
    this.control({
      "[action=provide_deferred]": {
        click: () => {
          this.provide();
        }
      }
    });
    this.view.down("grid").on("selectionchange", async (a, b, c) => {
      let res = await this.checkSelected(a);
      if (res.same) this.calculateAmount(b);
    });
    this.TransfersModel = Ext.create(
      "Crm.modules.transfers.model.TransfersModel"
    );
    this.view.down("[action=provide_deferred]").setDisabled(true);
    this.listCurrencyDecimal = await this.model.callApi(
      "merchant-service",
      "getListCurrencyDecimal",
      {}
    );
    this.callParent();
  },
  gotoRecordHash() {},
  async provide() {
    this.view.down("[action=provide_deferred]").setDisabled(true);
    let data = {
      amount: this.amount,
      currency: this.currency
    };

    let res = await this.TransfersModel.checkLimit(data);
    if (res.result) {
      const sel = this.view
        .down("grid")
        .getSelectionModel()
        .getSelected()
        .items.map((i) => i.id);

      if (sel && sel.length) {
        const result = await this.view.model.callApi(
          "ccoin-service",
          "provideDeferred",
          { txIds: sel },
          null,
          null
        );
        D.a("Result", "Provided transfers: %s", [result.provided], () => {
          this.reloadData();
        });
      }
      this.view.down("[action=provide_deferred]").setDisabled(false);
    } else {
      this.view.down("[action=provide_deferred]").setDisabled(false);
      return D.a(
        "Message",
        `The amount is less than limit %s$. The payment cannot be executed immediately.`,
        [res.tx_limit]
      );
    }
  },

  async checkSelected(record) {
    const selected = this.view
      .down("grid")
      .getSelectionModel()
      .getSelected().items;

    if (selected && selected.length)
      this.view.down("[action=provide_deferred]").setDisabled(false);
    else this.view.down("[action=provide_deferred]").setDisabled(true);

    let firstSelectedCurrency = selected.length
      ? selected[0].data.data.to_currency
      : "";
    let lastSelectedCurrency = record.lastSelected.data.data.to_currency;

    if (firstSelectedCurrency != lastSelectedCurrency) {
      this.view
        .down("grid")
        .getSelectionModel()
        .deselect(record.lastSelected);
      return { same: false };
    }
    return { same: true };
  },

  async calculateAmount(selected) {
    this.amount = 0;
    this.currency;

    if (selected)
      selected.forEach((item) => {
        this.amount += parseFloat(item.data.data.finAmount);
        this.currency = item.data.data.to_currency;
      });

    this.view
      .down("[name=deferred_amount]")
      .setText(
        `${
          this.amount != 0
            ? this.amount.toFixed(this.listCurrencyDecimal[this.currency])
            : ""
        } ${this.currency || ""}`
      );
  }
});
