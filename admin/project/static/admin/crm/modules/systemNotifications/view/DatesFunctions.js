Ext.define("Crm.modules.systemNotifications.view.DatesFunctions", {
  addTimestamp(value) {
    let date = new Date(value);
    let userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset);
  }
});
