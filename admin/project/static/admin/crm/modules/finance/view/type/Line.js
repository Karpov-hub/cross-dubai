Ext.define("Crm.modules.finance.view.type.Line", {
  extend: "Crm.modules.finance.view.type.Diagram",

  requires: ["Ext.chart.series.Line"],

  buildSery(yField) {
    return {
      type: "line",
      xField: "date",
      yField,
      style: {
        lineWidth: 2
      },
      marker: {
        radius: 4,
        lineWidth: 2
      },
      /*label: {
        field: "value",
        display: "over"
      },*/
      highlight: {
        fillStyle: "#000",
        radius: 5,
        lineWidth: 2,
        strokeStyle: "#fff"
      },
      tooltip: this.buildTooltip(yField)
    };
  }
});
