Ext.define("Crm.modules.finance.view.type.Diagram", {
  extend: "Ext.panel.Panel",

  requires: [
    "Ext.chart.CartesianChart",
    "Ext.chart.series.Bar",
    "Ext.chart.axis.Numeric",
    "Ext.chart.axis.Category",
    "Ext.chart.interactions.PanZoom",
    "Ext.chart.interactions.ItemHighlight"
  ],

  layout: "fit",

  initComponent() {
    this.controller = Ext.create(
      "Crm.modules.finance.view.type.ChartController"
    );
    this.store = this.buildStore();
    const series = this.buildSeries();

    this.items = {
      xtype: "cartesian",
      reference: "chart",
      interactions: {
        type: "panzoom",
        zoomOnPanGesture: true
      },
      animation: {
        duration: 200
      },
      store: this.store,
      insetPadding: {
        top: 40,
        bottom: 20,
        left: 20,
        right: 20
      },

      axes: [
        {
          type: "numeric",
          position: "left",
          grid: true,
          renderer: (axis, label, layoutContext) => {
            return layoutContext.renderer(label);
          }
        },
        {
          type: "category",
          position: "bottom",
          grid: true,
          label: {
            rotate: {
              degrees: -45
            }
          }
        }
      ],
      series,
      listeners: {
        itemhighlight: "onItemHighlight"
      }
    };

    this.callParent(arguments);
  },

  buildStore() {
    let fields = ["date"];
    if (this.settings.separate_chart) {
      this.settings.accounts.forEach(acc => {
        fields.push(`${acc.dir}_${acc.account}`);
      });
    } else {
      fields.push("value");
    }

    return Ext.create("Ext.data.Store", {
      fields,
      data: []
    });
  },

  buildSeries() {
    if (this.settings.separate_chart) {
      let out = [];
      this.settings.accounts.forEach(acc => {
        out.push(this.buildSery(`${acc.dir}_${acc.account}`));
      });

      return out;
    } else {
      return [this.buildSery("value")];
    }
  },

  buildSery(yField) {
    return {
      type: "bar",
      xField: "date",
      yField,
      style: {
        lineWidth: 2
      },
      marker: {
        radius: 4,
        lineWidth: 2
      },
      label: {
        field: "value",
        display: "over"
      },
      /*highlight: {
        fillStyle: "#000",
        radius: 5,
        lineWidth: 2,
        strokeStyle: "#fff"
      },*/
      tooltip: this.buildTooltip(yField)
    };
  },

  buildTooltip(yField) {
    return {
      trackMouse: true,
      showDelay: 0,
      dismissDelay: 0,
      hideDelay: 0,
      renderer: (tooltip, record, item) => {
        let html = `Date: ${record.get("date")}`;
        if (yField != "value") {
          html += `<br>Account: ${yField.split("_")[1]}`;
        }
        html += `<br>Total: ${Ext.util.Format.number(
          record.get(yField),
          "0,000.00"
        )} ${this.settings.currency}`;
        tooltip.setHtml(html);
      }
    };
  }
});
