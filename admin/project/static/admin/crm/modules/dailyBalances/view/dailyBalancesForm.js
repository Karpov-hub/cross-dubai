Ext.define("Crm.modules.dailyBalances.view.dailyBalancesForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Daily balances report"),
  iconCls: "x-fa fa-list",
  requires: ["Desktop.core.widgets.GridField"],
  formLayout: "fit",

  formMargin: 0,

  controllerCls: "Crm.modules.dailyBalances.view.dailyBalancesFormController",

  buildItems() {
    return {
      xtype: "fieldcontainer",
      layout: "fit",
      items: [this.buildGeneral()]
    };
  },

  buildGeneral() {
    return {
      xtype: "panel",
      layout: "border",
      items: [
        {
          name: "id",
          hidden: true
        },
        {
          xtype: "panel",
          region: "north",
          height: 310,
          split: true,
          layout: "border",
          items: [
            {
              xtype: "panel",
              layout: "anchor",
              split: true,
              region: "west",
              width: "50%",
              height: 325,
              scrollable: true,
              action: "sk_panel",
              title: D.t("SK Balance"),
              html:
                '<iframe width="100%" height="100%" frameborder="0" style="border: null"></iframe>',
              defaults: {
                anchor: "100%",
                xtype: "textfield",
                margin: 5,
                labelWidth: 110
              },
              items: []
            },
            {
              xtype: "panel",
              layout: "fit",
              width: "50%",
              region: "center",
              action: "nil_panel",
              html:
                '<iframe width="100%" height="100%" frameborder="0" style="border: null"></iframe>',
              title: D.t("NIL Balance"),
              items: []
            }
          ]
        },
        {
          xtype: "panel",
          region: "center",
          split: true,
          layout: "border",
          items: [
            {
              xtype: "panel",
              layout: "anchor",
              split: true,
              region: "west",
              width: "50%",
              // height: 325,
              scrollable: true,
              action: "deposits_panel",
              title: D.t("Deposits on hold"),
              items: []
            },
            {
              xtype: "panel",
              layout: "fit",
              width: "50%",
              region: "center",
              action: "payout_panel",
              title: D.t("Ready to payout"),
              items: []
            }
          ]
        }
      ]
    };
  },

  buildButtons: function() {
    var btns = [
      "->",
      { text: D.t("Close"), iconCls: "x-fa fa-ban", action: "formclose" }
    ];
    return btns;
  }
});
