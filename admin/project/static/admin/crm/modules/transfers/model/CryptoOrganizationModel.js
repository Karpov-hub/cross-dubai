Ext.define("Crm.modules.transfers.model.CryptoOrganizationModel", {
    extend: "Crm.classes.DataModel",
  
    collection: "vw_orgs_crypto",
    idField: "id",
    strongRequest: true,
    showTags: true,
    //removeAction: "remove",
  
    fields: [
      {
        name: "id",
        type: "ObjectID",
        visible: true
      },
      {
        name: "org_id",
        type: "ObjectID",
        visible: true,
        filterable: true,
        editable: true
      },
      {
        name: "user_id",
        type: "ObjectID",
        visible: true,
        filterable: true,
        editable: true
      },
      {
        name: "name",
        type: "string",
        visible: true,
        filterable: true,
        editable: true
      },
      {
        name: "num",
        type: "string",
        visible: true,
        filterable: true,
        editable: true
      },
      {
        name: "curr_name",
        type: "string",
        visible: true,
        filterable: true,
        editable: true
      }
    ]
  });
  