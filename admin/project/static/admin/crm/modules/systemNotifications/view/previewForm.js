Ext.define("Crm.modules.systemNotifications.view.previewForm", {
  extend: "Ext.window.Window",

  title: D.t("Letter preview"),
  closable: true,
  closeAction: "hide",
  modal: true,
  padding: 10,
  minHeight: 100,
  minWidth: 150,
  html: `<p>No data for preview<p>`
});
