Ext.define("Crm.modules.nilRatesHistory.view.TodayHistoryRateGrid", {
  extend: "Crm.modules.nilRatesHistory.view.AverageDailyHistoryGrid",

  model: "Crm.modules.nilRatesHistory.model.TodayHistoryRateModel",

  buildColumns() {
    let columns = this.callParent(arguments);
    columns[0].renderer = (v) => {
      return Ext.Date.format(new Date(v), "d.m.Y H:i:s");
    };
    return columns;
  }
});
