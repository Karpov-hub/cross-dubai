Ext.define("Admin.view.main.SupportMessagesGridController", {
  extend: "Ext.app.ViewController",
  alias: "controller.supportmessagesgridcontroller",

  sortMessages(arr) {
    return arr.sort((a, b) => {
      const time_a = new Date(a.ctime).getTime(),
        time_b = new Date(b.ctime).getTime();
      if (time_a > time_b) return 1;
      if (time_a < time_b) return -1;
      return 0;
    });
  },

  async getClientMessages(model, data) {
    const messages = await model.callApi(
      "support-service",
      "getMessages",
      {},
      null,
      data.client_id
    );
    let unread_messages = messages.filter((el) => el.is_new).map((el) => el.id);
    await model.callApi("support-service", "markAsRead", {
      message_id: unread_messages
    });
    return this.sortMessages(messages);
  },

  async sendMessage(view, model, client_id, message) {
    const support_profile = await model.callServerMethod("getAdminProfile");
    const res = await model.callApi(
      "support-service",
      "sendMessage",
      {
        message,
        sender: support_profile._id,
        get_messages: true
      },
      null,
      client_id
    );
    let messages_grid = view.down("[name=client_messages]");
    messages_grid.setStore(this.sortMessages(res));
    messages_grid.scrollBy(0, 9999999);
    return { success: true };
  }
});
