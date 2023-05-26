Ext.define("Crm.modules.transfers.model.ApprovedTransfersModel", {
  extend: "Crm.modules.transfers.model.NotApprovedTransfersModel",

  /* scope:server */
  buildCustomFilters(params) {
    let filter_obj = { property: "approver", operator: "isNot", value: null };
    if (!params._filters && !params.filters) params._filters = [filter_obj];
    else if (params._filters) params._filters.push(filter_obj);
    return params;
  }
});
