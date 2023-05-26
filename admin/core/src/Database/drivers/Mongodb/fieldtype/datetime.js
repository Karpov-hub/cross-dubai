Ext.define('Database.drivers.Mongodb.fieldtype.datetime', {
    extend: 'Database.fieldtype.date'
    
    ,getValueToSave: function(model, value, newRecord, oldRecord, name, callback) {      
        if(!!callback) callback(value? new Date(value):null, true)
        else return value? new Date(value):null;
    }
})