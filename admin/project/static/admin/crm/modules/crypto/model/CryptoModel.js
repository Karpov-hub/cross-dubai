Ext.define("Crm.modules.crypto.model.CryptoModel", {
  extend: "Crm.classes.DataModel",

  collection: "currency",
  idField: "id",
  //removeAction: "remove",
  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "int",
      visible: true
    }
  ]
});
