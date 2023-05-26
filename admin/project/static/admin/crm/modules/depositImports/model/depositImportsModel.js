Ext.define("Crm.modules.depositImports.model.depositImportsModel", {
  extend: "Crm.classes.DataModel",

  collection: "tmp_deposit_imports",
  idField: "id",
  // removeAction: "remove",

  mixins: [
    "Crm.modules.orders.model.UpdateDataFuncModel", // scope:server
    "Crm.modules.currency.model.CurrencyFunc"
  ],

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "reason",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "amount",
      type: "float",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "deposit_to",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "order_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "organisation_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "order_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "currency",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "bank",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "status",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "file_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "deposit_date",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "type",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "outtx_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:server */
  async afterGetData(data, cb) {
    if (!data || !data.length) return cb(data);
    let currencyList = await this.getCurrencyList();
    for (const d of data) {
      d.amount = await this.roundCurrency({
        currency: d.currenc,
        balance: d.amount,
        currencyList
      });
    }

    cb(data);
  },

  /* scope:client */
  async refreshData(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("refreshData", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:client */
  async getOrders(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getOrders", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getOrders(data, cb) {
    let res = null;
    if (
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
        data.organisation
      )
    )
      res = await this.src.db
        .collection("orders")
        .findAll({ organisation: data.organisation, status: 1 });

    return cb(res);
  },

  /* scope:server */
  async getOrder(data) {
    let res = await this.src.db
      .collection("orders")
      .findOne({ id: data.order_id });

    return res;
  },

  /* scope:server */
  async getOrderByMerchant(data) {
    let custom_org_name = await this.src.db
      .collection("cstm_merchants_for_deposits")
      .findOne({
        custom_name: data.merchant_name
      });

    if (custom_org_name) {
      let res = await this.src.db
        .collection("orders")
        .findOne({ organisation: custom_org_name.merchant_id, status: 1 });

      return res;
    }
    return custom_org_name;
  },

  /* scope:client */
  async sendDeposit(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("sendDeposit", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $sendDeposit(form, cb) {
    if (form.rescan) return cb(await this.depositByMerchantName(form));
    return cb(await this.depositByOrderId(form));
  },

  /* scope:server */
  async depositByMerchantName(form) {
    let out = {
      provided: 0,
      skipped: 0,
      deposit_errors: 0,
      noOrderRows: [],
      depositErrorRows: [],
      existsRows: []
    };
    for (const rec of form.data) {
      if (rec.status == 1) {
        out.skipped++;
        out.existsRows.push(rec);
        continue;
      }
      let order = await this.getOrderByMerchant(rec);
      const organisation = await this.getMerchantData(order.organisation);

      if (!order) {
        out.skipped++;
        out.noOrderRows.push(rec);
        continue;
      }
      const realm = await this.getRealmByUser(order.merchant);
      if (!realm) return;

      const acc_no = await this.getAccountByMerchantCurrency(
        order.organisation,
        rec.currency
      );

      if (!acc_no) return;

      const data = {
        service: "account-service",
        method: "deposit",
        data: {
          ref_id: order.id,
          acc_no,
          amount: parseFloat(rec.amount),
          currency: rec.currency,
          user_id: order.merchant,
          merchant_id: order.organisation,
          deposit_date: rec.deposit_date
            ? new Date(new Date(rec.deposit_date).setHours(12))
            : null,
          bank: rec.bank,
          organisation_name: organisation ? organisation.name : null
        },
        realm: realm,
        user: order.merchant
      };
      const res = await this.callApi(data);

      if (res && res.result && res.result.id) {
        out.provided++;
        await this.src.db.collection("tmp_deposit_imports").update(
          { id: rec.id },
          {
            $set: {
              status: 1,
              // order_id: order.id,
              // organisation_id: order.organisation,
              order_name: `${order.order_num} | ${order.currency} -> ${order.res_currency}`
            }
          }
        );
      } else {
        out.deposit_errors++;
        out.depositErrorRows.push(rec);
      }
    }
    return out;
  },

  /* scope:server */
  async depositByOrderId(form) {
    let order = await this.getOrder(form.data);

    const realm = await this.getRealmByUser(order.merchant);
    const organisation = await this.getMerchantData(order.organisation);

    if (!realm) return;

    const acc_no = await this.getAccountByMerchantCurrency(
      order.organisation,
      form.data.currency
    );

    if (!acc_no) return;

    const data = {
      service: "account-service",
      method: "deposit",
      data: {
        ref_id: order.id,
        acc_no,
        amount: parseFloat(form.data.amount),
        currency: form.data.currency,
        user_id: order.merchant,
        merchant_id: order.organisation,
        merchant: order.organisation,
        deposit_date: form.data.deposit_date
          ? new Date(new Date(form.data.deposit_date).setHours(12))
          : null,
        bank: form.data.bank,
        organisation_name: organisation ? organisation.name : null
      },
      realm: realm,
      user: order.merchant
    };

    const res = await this.callApi(data);

    if (res && res.result && res.result.id) {
      await this.src.db.collection("tmp_deposit_imports").update(
        { id: form.data.id },
        {
          $set: {
            status: 1,
            // order_id: order.id,
            // organisation_id: order.organisation,
            order_name: `${order.order_num} | ${order.currency} -> ${order.res_currency}`
          }
        }
      );
    }
    return res && res.result && res.result.id;
  },

  /* scope:server */
  async checkDepositInOrder(amount, order_id) {
    const transfers = await this.src.db
      .collection("transfers")
      .findAll({ ref_id: order_id, event_name: "account-service:deposit" });

    for (let transfer of transfers) {
      if (parseFloat(transfer.data.amount) == parseFloat(amount)) return true;
    }

    return false;
  },

  /* scope:server */
  async getRealmByUser(user_id) {
    const res = await this.src.db
      .collection("users")
      .findOne({ id: user_id }, { realm: 1 });
    return res ? res.realm : null;
  },

  /* scope:server */
  async getMerchantData(id) {
    const res = await this.src.db.collection("merchants").findOne({ id: id });
    return res ? res : null;
  },

  /* scope:server */
  async getAccountByMerchantCurrency(merchant_id, currency) {
    const res = await this.src.db.query(
      "select a.acc_no from accounts a, merchant_accounts m where m.id_merchant=$1 and a.id=m.id_account and a.currency=$2",
      [merchant_id, currency]
    );
    return res && res[0] ? res[0].acc_no : null;
  },

  /* scope:client */
  async getDataForExport(data, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getDataForExport", { filters: data }, resolve);
    });
  },

  /* scope:server */
  async $getDataForExport(data, cb) {
    let filters = data.filters;
    const res = await this.src.db
      .collection("tmp_deposit_imports")
      .findAll(filters, {});

    cb(res);
  },

  /* scope:client */
  async markAsResolved(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("markAsResolved", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $markAsResolved(form, cb) {
    let res = await this.src.db.collection("tmp_deposit_imports").update(
      { id: form.data.id },
      {
        $set: {
          status: 1
        }
      }
    );

    return cb(res);
  },

  /* scope:client */
  async rememberBankName(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("rememberBankName", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $rememberBankName(form, cb) {
    const uuid = require("uuid/v4");
    let out;
    if (form.data.merchant_combo) {
      let res = await this.src.db.collection("merchants").findOne({
        id: form.data.merchant_combo
      });

      out = await this.src.db.collection("cstm_merchants_for_deposits").insert({
        id: uuid(),
        merchant_id: form.data.merchant_combo,
        merchant_name: res.name,
        custom_name: form.data.deposit_to
      });
    }
    return cb(out);
  },

  /* scope:client */
  async removeSelected(data, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("removeSelected", data, resolve);
    });
  },

  /* scope:server */
  async $removeSelected(data, cb) {
    for (const id of data.ids) {
      await this.src.db.collection("tmp_deposit_imports").remove({ id: id });
    }

    cb({ success: true });
  }
});
