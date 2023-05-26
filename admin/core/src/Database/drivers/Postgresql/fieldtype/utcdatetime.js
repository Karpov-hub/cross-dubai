Ext.define("Database.drivers.Postgresql.fieldtype.utcdatetime", {
  extend: "Database.drivers.Postgresql.fieldtype.datetime",

  removeTimestamp(value) {
    let date = new Date(value);
    let userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - userTimezoneOffset);
  },

  getValueToSave: function(model, value, newRecord, oldRecord, name, callback) {
    let datetime_no_timezone = this.removeTimestamp(value);
    if (!!callback) callback(value ? datetime_no_timezone : null, true);
    else return value ? datetime_no_timezone : null;
  }
});
