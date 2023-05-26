const uuidV4 = require("uuid/v4"); // scope:server
Ext.define("Crm.modules.orders.model.AnalitycsModel", {
  extend: "Crm.modules.orders.model.OrdersModel",

  /* scope:client */
  async prepareData(formData) {
    return new Promise((resolve, reject) => {
      this.runOnServer("prepareData", formData, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $prepareData(formData, cb) {
    let orderData = await this.getOrderData(formData);
    let transferData = await this.getTransferData(orderData);

    return cb(transferData);
  },
  /* scope:server */
  async getTransferData(orderData) {
    let result = [];
    let preResObj = {};
    for (oData of orderData) {
      let transfersData = await this.src.db
        .collection("transfers")
        .findAll({ ref_id: oData.id });
      for (trData of transfersData) {
        preResObj = {};
        let transactionsData = await this.src.db
          .collection("transactions")
          .findAll(
            { transfer_id: trData.id },
            { description_src: 1, amount: 1, currency_src: 1, txtype: 1 }
          );
        for (txData of transactionsData) {
          preResObj[txData.txtype] =
            txData.amount +
            " " +
            txData.currency_src +
            ", (" +
            txData.description_src +
            ")";
        }
        preResObj.id = uuidV4();
        preResObj.order_id = oData.id;
        preResObj.orgname = oData.orgname;
        preResObj.ctime = oData.ctime;
        result.push(preResObj);
      }
    }
    return result;
  },

  /* scope:server */
  async getOrderData(formData) {
    let sql = `
    select o.id, m.name as orgname, m.ctime
    from orders o 
    inner join merchants m 
    on (o.organisation = m.id and m.removed!=1)
    where o.merchant = $1 and o.removed!=1 
    `;
    let whereArr = [formData.merchant];
    if (formData.from_date && !formData.to_date) {
      sql += " and o.ctime >= $2";
      whereArr.push(new Date(formData.from_date));
    }
    if (!formData.from_date && formData.to_date) {
      sql += " and o.ctime <= $2";
      whereArr.push(new Date(formData.to_date));
    }
    if (formData.from_date && formData.to_date) {
      sql += " and o.ctime between $2 and $3";
      whereArr.push(new Date(formData.from_date), new Date(formData.to_date));
    }
    return await this.src.db.query(sql, whereArr);
  }
});
