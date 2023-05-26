Ext.define("Crm.modules.campaigns.model.CampaignModel", {
  extend: "Crm.classes.DataModel",

  collection: "campaigns",
  idField: "id",
  //   removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "external_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "merchant_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "caption",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: true,
      sort: -1
    }
  ],

  /* scope:server */
  getData(params, cb) {
    let merchant_id = null;
    if (params._filters || params.filters) {
      let filters = params.filters || params._filters;
      for (let f of filters) {
        if (f._property == "merchant_id" || f.property == "merchant_id")
          merchant_id = f._value || f.value;
      }
    }
    if (merchant_id) {
      this.find = {
        $and: [
          {
            merchant_id
          }
        ]
      };
    } else if (params._filters || params.filerts) return cb({ total: 0, list: [] });
    this.callParent(arguments);
  }
});
