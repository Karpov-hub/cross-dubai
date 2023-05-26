/**
 * @author Max Tushev
 * @class Database.drivers.Oracle.fieldtype.string
 * @extend Database.fieldtype.Field
 * String field.
 */
Ext.define("Database.drivers.Postgresql.fieldtype.text", {
  extend: "Database.drivers.Mysql.fieldtype.string",

  getValueToSave: function(
    model,
    value,
    newRecord,
    oldRecord,
    name,
    callback,
    field
  ) {
    if (value === undefined) value = null;
    if (Ext.isArray(value)) {
      value.each(v => {
        if (v.$) return v.$;
        else return v;
      }, true);
      value = value.join("\n");
    }
    callback(value);
  },

  createField: function(field, collection, db, callback) {
    callback(
      "ALTER TABLE " +
        collection +
        " ADD " +
        this.getDbFieldName(field) +
        " TEXT"
    );
  }
});
