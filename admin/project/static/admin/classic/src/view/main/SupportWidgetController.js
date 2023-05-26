Ext.define("Admin.view.main.SupportWidgetController", {
  extend: "Ext.app.ViewController",
  alias: "controller.supportwidgetcontroller",

  init() {
    this.callParent(arguments);
    this.subscribeToMessages();
  },

  subscribeToMessages() {
    if (!Glob.ws) {
      setTimeout(() => {
        this.subscribeToMessages();
      }, 1000);
      return;
    }
    const model = Ext.create("Crm.modules.support.model.SupportModel");
    this.getMessages(model);
    setInterval(() => {
      this.getMessages(model);
    }, 1000);
  },

  async getMessages(model) {
    const res = await model.callApi(
      "support-service",
      "getAdminDialogsList",
      {}
    );
    this.view.down("[action=unread_messages]").setText(res.count);
    
    const dialog_list_grid = this.view.down("[name=dialogs_list]");
    dialog_list_grid.setStore({
      fields: ["client_id", "client_name", "last_message", "is_new", "ctime"],
      data: res.dialogs
    });
    dialog_list_grid.scrollBy(0, dialog_list_grid.scrollable.position.y);

    return res;
  }
});
