Ext.define("Crm.modules.nilRatesHistory.view.NilRatesHistoryForm", {
  extend: "Core.form.FormContainer",

  buildButtons() {},
  buildItems() {
    return [
      {
        xtype: "panel",
        layout: "hbox",
        defaults: { flex: 1 },
        items: [
          {
            xtype: "panel",
            layout: "anchor",
            title: D.t("NIL daily average rates"),
            items: [
              Ext.create(
                "Crm.modules.nilRatesHistory.view.AverageDailyHistoryGrid"
              )
            ]
          },
          {
            xtype: "panel",
            layout: "anchor",
            title: D.t("NIL today's rates"),
            items: [
              Ext.create(
                "Crm.modules.nilRatesHistory.view.TodayHistoryRateGrid"
              )
            ]
          }
        ]
      }
    ];
  }
});
