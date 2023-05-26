Ext.define("Crm.modules.telegram.view.TelegramChannelGridController", {
  extend: "Core.grid.GridController",

  gotoRecordHash() {},

  deleteRecord_do(store, rec) {
    D.c("Removing", "Delete the channel?", [], async () => {
      await this.deleteChannel(rec.data);
      store.remove(rec);
    });
  },

  async deleteChannel(data) {
    const result = await this.model.callApi(
      "telegram-service",
      "deleteChannel",
      {
        id: data.id
      }
    );

    if (result.error) {
      return D.a(D.t("Error"), result.error);
    }
  }
});
