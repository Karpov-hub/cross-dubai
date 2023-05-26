Ext.define("Crm.modules.finance.view.type.ChartController", {
  extend: "Ext.app.ViewController",

  init(view) {
    this.view = view;
    this.model = Ext.create("Crm.modules.finance.model.ChartModel");
    this.loadData();
    this.view.on("refresh", () => {
      this.loadData();
    });
    this.callParent(arguments);
  },

  async loadData() {
    const data = await this.model.getData(this.view.settings);

    data.total = Ext.util.Format.number(data.total, "0,000.00");

    this.view.store.loadData(data.list || []);
    this.view.down("[reference=chart]").setSprites([
      {
        type: "text",
        text: `${data.total} ${data.currency}`,
        fontSize: 22,
        width: 100,
        height: 30,
        x: 20,
        y: 20
      }
    ]);
  },

  onItemHighlight(chart, newHighlightItem, oldHighlightItem) {
    this.setSeriesLineWidth(newHighlightItem, 4);
    this.setSeriesLineWidth(oldHighlightItem, 2);
  },

  setSeriesLineWidth(item, lineWidth) {
    if (item) {
      item.series.setStyle({
        lineWidth: lineWidth
      });
    }
  },

  onPreview() {
    const chart = this.lookup("chart");
    chart.preview();
  }
});
