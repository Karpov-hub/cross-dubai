Ext.define(
  "Crm.modules.nilRatesHistory.view.AverageDailyHistoryGridController",
  {
    extend: "Core.grid.GridController",

    setControls() {
      this.callParent(arguments);
      this.control({
        "[name=currency_pair_filter]": {
          select: function(el) {
            this.setCurrencyFilter(el.lastValue);
          }
        }
      });
      this.applyCurrencyFilter();
      this.view.store.setSorters({
        property: "ctime",
        direction: "DESC"
      });
    },

    async applyCurrencyFilter() {
      let currency_pair_combo = this.view.down("[name=currency_pair_filter]");
      currency_pair_combo.setStore({
        fields: ["name"],
        data: await this.model.getCurrencyPairs()
      });
      currency_pair_combo.select(currency_pair_combo.getStore().getAt(0));
      this.setCurrencyFilter(currency_pair_combo.getStore().getAt(0).data.name);
      return currency_pair_combo;
    },

    setCurrencyFilter(value) {
      this.view.store.clearFilter(true);
      this.view.store.filter("currencies_pair", value);
    },

    gotoRecordHash() {
      return;
    }
  }
);
