Ext.define("Admin.view.main.CheckerListPanel", {
  extend: "Ext.panel.Panel",
  xtype: "checker_list_panel",

  viewModel: Ext.create("Admin.view.main.CheckerListModel"),

  requires: [
    "Admin.view.main.CheckerListController",
    "Ext.list.Tree",
    "Admin.view.main.CheckerGridController"
  ],
  controller: "checkerlistcontroller",

  layout: "anchor",
  margin: "0 5 0 5",
  bodyPadding: 0,

  initComponent() {
    this.items = this.buildItems();
    this.callParent(arguments);
  },
  desktopButton(model) {
    return {
      tooltip: D.t("Show not approved transfers"),
      xtype: "button",
      iconCls: "x-fa fa-exchange-alt",
      action: "na_transfers_counter",
      handler: async (el) => {
        await this.controller.getTransfersData(model);
        el.ownerCt.down("[name=transfers_window]").showBy(el, "b", [-300, 0]);
      }
    };
  },
  mobileButton(model) {
    return {
      xtype: "button",
      iconCls: "x-fa fa-exchange-alt",
      action: "na_transfers_counter",
      padding: 2,
      margin: 0,
      bind: {
        text: "{notifications_count}"
      },
      handler: async (el) => {
        const tf_data = await this.controller.getTransfersData(model);
        let transfersWindow = this.buildTransfersWindow();
        transfersWindow.hidden = false;
        transfersWindow.controller = "checkergridcontroller";
        let tf_window = Ext.create("Ext.window.Window", transfersWindow);
        tf_window.show();
        tf_window.down("[name=transfers_list]").setStore(tf_data);
      }
    };
  },
  buildItems() {
    const model = Ext.create(
      "Crm.modules.transfers.model.NotApprovedTransfersModel"
    );
    return [
      Ext.platformTags.phone
        ? this.mobileButton(model)
        : this.desktopButton(model),
      this.buildTransfersWindow()
    ];
  },

  buildTransfersWindow() {
    return {
      xtype: "panel",
      title: D.t("Waiting for approval"),
      layout: "fit",
      name: "transfers_window",
      hidden: true,
      floating: true,
      modal: true,
      resizable:false,
      closable: false,
      draggable: !Ext.platformTags.phone,
      closable: true,
      closeAction: "hide",
      scrollable: true,
      width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 400,
      height: Ext.platformTags.phone ? Ext.Element.getViewportHeight() : 300,
      items: [
        {
          xtype: "grid",
          width: 400,
          name: "transfers_list",
          store: {},
          columns: [
            {
              dataIndex: "transfer_data",
              flex: 1,
              renderer(v, m, r) {
                return `${r.data.merchant_name} ${parseFloat(r.data.amount)} ${
                  r.data.currency
                } -> ${r.data.result_currency}`;
              }
            },
            {
              xtype: "actioncolumn",
              width: 30,
              items: [
                {
                  iconCls: "x-fa fa-dollar-sign",
                  tooltip: D.t("Open approving form"),
                  handler: "onActionColumnClick"
                }
              ]
            }
          ],
          listeners: {
            itemdblclick: "onDoubleClick"
          }
        }
      ]
    };
  }
});
