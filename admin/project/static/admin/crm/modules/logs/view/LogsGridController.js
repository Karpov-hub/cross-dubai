Ext.define("Crm.modules.logs.view.LogsGridController", {
  extend: "Core.grid.GridController",

  init: async function(view) {
    const res = await view.model.callApi("gate-server", "logsStatus", {});
    view
      .down("[action=disableLogs]")
      .setText(res.logsStatus ? "Disable logs" : "Enable logs");

    this.callParent(arguments);
  },

  setControls() {
    this.control({
      "[action=disableLogs]": {
        click: async (el, v) => {
          const res = await this.view.model.callApi(
            "gate-server",
            "enableLogs",
            {}
          );
          this.view
            .down("[action=disableLogs]")
            .setText(res.logsStatus ? "Disable logs" : "Enable logs");
        }
      }
    });
    this.callParent(arguments);
  }
});
