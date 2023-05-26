Ext.define("Crm.modules.transfers.model.OrderNotApprovedTransfersModel", {
  extend: "Crm.modules.transfers.model.NotApprovedTransfersModel",

  getData(params, cb) {
    //для формы отдельная обработка
    if (
      params.filters &&
      params.filters[0] &&
      params.filters[0].property == "id"
    )
      return this.callParent(arguments);
    //для фильтров на гриде
    let ref_id = null;
    if (params._filters || params.filters) {
      let filters = params.filters || params._filters;
      for (let f of filters) {
        if (f._property == "ref_id" || f.property == "ref_id")
          ref_id = f._value || f.value;
      }
    }
    if (ref_id) {
      this.find = {
        $and: [
          {
            ref_id
          }
        ]
      };
    } else return cb({ total: 0, list: [] });

    this.callParent(arguments);
  }
});
