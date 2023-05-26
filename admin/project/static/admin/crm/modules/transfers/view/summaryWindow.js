Ext.define("Crm.modules.transfers.view.summaryWindow", {
  extend: "Ext.window.Window",

  modal: true,
  autoShow: true,

  width: 550,
  height: 550,

  syncSize: function() {},

  title: D.t("Summary"),
  layout: "fit",

  initComponent() {
    this.buttons = this.buildButtons();
    this.items = {
      xtype: "form",
      layout: "fit",
      items: this.buildItems()
    };

    this.model = Ext.create("Crm.modules.transfers.model.TransfersModel");
    this.callParent(arguments);
  },

  buildItems: function() {
    let items = [];
    for (const d of this.summary_data) {
      items.push({
        xtype: "displayfield",
        name: d.key,
        fieldLabel: D.t(d.name),
        value: d.value,
        labelStyle: d.labelStyle,
        labelWidth: 170
      });
    }
    return [
      {
        xtype: "panel",
        padding: 10,
        action: "datapanel",
        cls: "details-panel printcontent",
        scrollable: true,
        items: items
      }
    ];
  },

  buildButtons() {
    return [
      "->",
      {
        text: "Confirm",
        id: "confirm_btn",
        handler: async () => {
          Ext.getCmp("confirm_btn").setDisabled(true);
          this.full_data.data._admin_id = localStorage.getItem("uid");
          this.full_data.data.order_id = this.full_data.data.ref_id;
          const res = await this.model.callApi(
            this.confirm_action.service,
            this.confirm_action.method,
            this.full_data.data,
            this.full_data.merchant ? this.full_data.merchant.realm.id : null,
            this.full_data.data.user_id
          );

          if (res && res.error) {
            Ext.getCmp("confirm_btn").setDisabled(false);
            return D.a("Error", res.error.message || res.error);
          }

          if (res && res.id) {
            this.scope.view.close();
            this.close();
          }
        }
      },
      "-",
      {
        text: D.t("Close"),
        handler: () => {
          this.close();
        }
      }
    ];
  }
});
