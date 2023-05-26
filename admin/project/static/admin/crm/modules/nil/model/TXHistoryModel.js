Ext.define("Crm.modules.nil.model.TXHistoryModel", {
  extend: "Crm.classes.DataModel",

  collection: "doc_types",
  idField: "id",
  fields: [],

  /* scope:client */
  async readNilData(filters, limit, link) {
    return new Promise((resolve, reject) => {
      this.runOnServer(
        "getNilData",
        { _filters: filters, limit, move: link },
        (res) => {
          resolve(res);
        }
      );
    });
  },

  /* scope:server */
  async getData(params, cb) {
    await this.$getNilData({ ...params, limit: 50, move: null }, cb);
  },

  /* scope:server */
  async $getNilData(params, cb) {
    let reqData = {
      service: "falcon-service",
      method: "getTxHistory",
      data: params
    };

    if (params._filters) {
      for (filter of params._filters) {
        reqData.data[filter._property] = filter._value;
        if (filter._property == "created")
          reqData.data.operator = filter._operator;
      }
    }
    const response = await this.callApi(reqData);
    if (response.result.err_code) return cb({ code: 1100 });

    return cb({
      total: response.result.body.length,
      list: response.result.body,
      links: response.result.links
    });
  }
});
