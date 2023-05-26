Ext.define("Admin.view.main.CheckerListController", {
  extend: "Ext.app.ViewController",
  alias: "controller.checkerlistcontroller",

  mixins: ["Admin.view.main.CheckerActions"],

  init() {
    this.control = this.setControls();
    this.callParent(arguments);
  },

  setControls() {
    this.subscribeToNotApprovedTransfers();
    document.addEventListener("click", (event) => {
      let notification_window = this.view.down("[name=transfers_window]");
      let notification_window_dom_el = notification_window.getEl();
      if (
        notification_window_dom_el &&
        !notification_window_dom_el.contains(event.target)
      ) {
        notification_window.setVisible(false);
      }
    });
  },

  async subscribeToNotApprovedTransfers() {
    if (!Glob.ws) {
      setTimeout(() => {
        this.subscribeToNotApprovedTransfers();
      }, 1000);
      return;
    }
    const NotApprovedTransfersModel = Ext.create(
      "Crm.modules.transfers.model.NotApprovedTransfersModel"
    );
    if (await this.setButtonVisible(NotApprovedTransfersModel))
      this.getTransfersData(NotApprovedTransfersModel);

    setInterval(async () => {
      if (await this.setButtonVisible(NotApprovedTransfersModel))
        this.getTransfersData(NotApprovedTransfersModel);
    }, 10000);
  },

  async setButtonVisible(model) {
    let permis = await model.checkPermissionsOnApprove();
    this.view.down("[action=na_transfers_counter]").setVisible(permis);
    return permis;
  },

  async getTransfersData(
    model = Ext.create("Crm.modules.transfers.model.NotApprovedTransfersModel")
  ) {
    const res = await model.callServerMethod('getNotApprovedTransfers');
    this.view.down("[action=na_transfers_counter]").setText(res.count);
    this.view.down("[name=transfers_list]").setStore({
      fields: ["merchant_name", "amount", "currency", "result_currency"],
      data: res.list
    });
    return res.list;
  }
});
