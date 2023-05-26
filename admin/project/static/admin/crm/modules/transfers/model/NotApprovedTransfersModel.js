Ext.define("Crm.modules.transfers.model.NotApprovedTransfersModel", {
  extend: "Crm.classes.ClientFilteredModel",

  filterParam: { entity: "merchant", field: "merchant_id" },

  mixins: ["Crm.modules.managers.model.ManagerFunctions"],

  collection: "not_sent_plan_transfers",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "plan_transfer_id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "merchant_id",
      type: "ObjectID",
      visible: true,
      editable: false,
      filterable: true,
      bindTo: {
        collection: "merchants",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1,
          id: 1
        }
      }
    },
    {
      name: "amount",
      type: "integer",
      visible: true,
      editable: false,
      filterable: true
    },
    {
      name: "fees",
      type: "integer",
      visible: true,
      editable: false,
      filterable: true
    },
    {
      name: "netto_amount",
      type: "integer",
      visible: true,
      editable: false,
      filterable: true
    },
    {
      name: "rate",
      type: "integer",
      visible: true,
      editable: false,
      filterable: true
    },
    {
      name: "result_amount",
      type: "integer",
      visible: true,
      editable: false,
      filterable: true
    },
    {
      name: "currency",
      type: "string",
      visible: true,
      editable: false,
      filterable: true
    },
    {
      name: "result_currency",
      type: "string",
      visible: true,
      editable: false,
      filterable: true
    },
    {
      name: "plan_id",
      type: "ObjectID",
      visible: true,
      editable: false,
      filterable: true,
      bindTo: {
        collection: "accounts_plans",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1,
          id: 1
        }
      }
    },
    {
      name: "ref_id",
      type: "ObjectID",
      visible: true,
      editable: false,
      filterable: true
    },
    {
      name: "tariff",
      type: "ObjectID",
      visible: true,
      editable: false,
      filterable: true,
      bindTo: {
        collection: "tariffplans",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: {
          name: 1,
          id: 1
        }
      }
    },
    {
      name: "variables",
      type: "object",
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "description",
      type: "string",
      visible: true,
      editable: false,
      filterable: true
    },
    {
      name: "status",
      type: "integer",
      visible: true,
      editable: false,
      filterable: true
    },
    {
      name: "approver",
      type: "ObjectID",
      visible: true,
      editable: false,
      filterable: true,
      bindTo: {
        collection: "admin_users",
        keyFieldType: "ObjectID",
        keyField: "_id",
        fields: {
          name: 1,
          login: 1,
          _id: 1
        }
      }
    },
    {
      name: "maker",
      type: "ObjectID",
      visible: true,
      editable: false,
      filterable: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      visible: true,
      editable: false,
      filterable: true
    },
    {
      name: "is_draft",
      type: "boolean",
      visible: true,
      editable: true,
      filterable: true
    },
    {
      name: "last_rejection_reason",
      type: "string",
      visible: true,
      editable: true,
      filterable: true
    },
    {
      name: "approve_request",
      type: "ObjectID",
      visible: true,
      editable: true,
      filterable: true
    }
  ],

  /* scope:server */
  getData(params, cb) {
    this.buildCustomFilters(params);
    this.callParent(arguments);
  },

  /* scope:server */
  buildCustomFilters(params) {
    let filter_obj = { property: "approver", operator: "is", value: null };
    if (
      (!params._filters && !params.filters) ||
      !Array.isArray(params._filters)
    )
      params._filters = [filter_obj];
    else if (params._filters) params._filters.push(filter_obj);

    const user = this.user.profile;
    if (user.other_configs && !user.other_configs.need_checker_widget)
      params._filters.push({
        property: "maker",
        value: this.user.id
      });
    if (user.other_configs && user.other_configs.need_checker_widget) {
      params._filters.push({
        property: "is_draft",
        value: false
      });
      params._filters.push({
        property: "approve_request",
        value: this.user.id
      });
    }
    return params;
  },

  async getCurrencyDecimalList() {
    let res = await this.callApi({
      service: "merchant-service",
      method: "getListCurrencyDecimal",
      data: {}
    });
    return res.result;
  },

  async afterGetData(data, cb) {
    const listCurrencyDecimal = await this.getCurrencyDecimalList();
    for (let item of data) {
      item.amount = Number(item.amount).toFixed(
        listCurrencyDecimal[item.currency]
      );
      item.result_amount = Number(item.result_amount).toFixed(
        listCurrencyDecimal[item.result_amount]
      );
      item.fees = Number(item.fees).toFixed(listCurrencyDecimal[item.currency]);
      item.netto_amount = Number(item.netto_amount).toFixed(
        listCurrencyDecimal[item.currency]
      );
      item.rate = Number(item.rate).toFixed(listCurrencyDecimal[item.currency]);
    }
    return cb(data);
  },

  /* scope:client */
  setApprover(data) {
    return new Promise((resolve) => {
      this.runOnServer("setApprover", { accepted_transfer_id: data.id }, () => {
        return resolve({ success: true });
      });
    });
  },

  /* scope:server */
  async $setApprover(data, cb) {
    await this.src.db
      .collection("not_sent_plan_transfers")
      .update(
        { id: data.accepted_transfer_id },
        { $set: { approver: this.user.id, status: 1 } }
      );
    this.changeModelData(
      "Crm.modules.transfers.model.NotApprovedTransfersModel",
      "ins",
      {}
    );
    return cb({ success: true });
  },

  /* scope:client */
  async sendPayment(data) {
    let realm_id = await this.getDefaultRealm();
    return await this.callApi(
      "account-service",
      "paymentByPlan",
      data,
      realm_id
    );
  },

  /* scope:client */
  async getNetworkFees(data) {
    const realm_id = await this.getDefaultRealm();
    return await this.callApi(
      "ccoin-service",
      "getLatestFeesByCurrency",
      data,
      realm_id
    );
  },

  /* scope:server */
  async $getNotApprovedTransfers(data, cb) {
    let na_transfers = await this.src.db
      .collection("not_sent_plan_transfers")
      .findAll({
        approver: { $is: null },
        removed: 0,
        is_draft: false,
        approve_request: this.user.id
      });

    let merchants_list = await this.src.db.collection("merchants").findAll(
      {
        id: { $in: na_transfers.map((el) => el.merchant_id) }
      },
      { id: 1, name: 1 }
    );
    for (let i = 0; i < na_transfers.length; i++) {
      let merchant = merchants_list.find((el) => {
        return el.id == na_transfers[i].merchant_id;
      });
      if (merchant) na_transfers[i].merchant_name = merchant.name;
    }
    na_transfers.sort((a, b) => {
      if (new Date(a.ctime) < new Date(b.ctime)) return 1;
      if (new Date(a.ctime) > new Date(b.ctime)) return -1;
      return 0;
    });
    return cb({
      list: na_transfers,
      count: na_transfers.length
    });
  },

  /* scope:client */
  updateTransferStatus(data, cb_response) {
    return new Promise((resolve) => {
      this.runOnServer(
        "updateTransferStatus",
        Object.assign(data, { cb_response }),
        resolve
      );
    });
  },

  /* scope:server */
  async $updateTransferStatus(data, cb) {
    if (
      !data.cb_response ||
      !data.additional_order_data ||
      !data.additional_order_data.field_name
    )
      return cb({ success: true });
    let order_data = await this.src.db.collection("non_ad_orders").findOne(
      {
        id: data.ref_id
      },
      {
        additional_data: 1
      }
    );
    if (!order_data) return cb({ success: true });

    if (data.cb_response == "deleted")
      order_data.additional_data[
        `${data.additional_order_data.field_name}_transfer_id`
      ] = null;
    else
      order_data.additional_data[
        `${data.additional_order_data.field_name}_transfer_id`
      ] = data.cb_response;

    await this.src.db
      .collection("non_ad_orders")
      .update(
        { id: data.ref_id },
        { $set: { additional_data: order_data.additional_data } }
      );

    return cb({ success: true });
  },

  /* scope:client */
  checkPermissionsOnApprove() {
    return new Promise((resolve) => {
      this.runOnServer("checkPermissionsOnApprove", {}, resolve);
    });
  },

  /* scope:server */
  async $checkPermissionsOnApprove(data, cb) {
    if (
      this.user &&
      this.user.profile &&
      this.user.profile.other_configs &&
      this.user.profile.other_configs.hasOwnProperty("need_checker_widget")
    )
      return cb(this.user.profile.other_configs.need_checker_widget);
    return cb(false);
  },

  /* scope:server */
  async $saveDraft(data, cb) {
    delete data.model;
    delete data.action;

    let existed_tf = await this.src.db
      .collection("not_sent_plan_transfers")
      .findOne({ id: data.id }, { id: 1 });

    if (existed_tf && existed_tf.id) {
      await this.src.db
        .collection("not_sent_plan_transfers")
        .update({ id: data.id }, { $set: data })
        .catch((e) => {
          console.log(e);
          return cb({ success: false });
        });
      return cb({ success: true, id: data.id });
    }

    await this.src.db
      .collection("not_sent_plan_transfers")
      .insert(data)
      .catch((e) => {
        console.log(e);
        return cb({ success: false });
      });
    return cb({ success: true, id: data.id });
  },

  /* scope:server */
  async $getCheckers(data, cb) {
    return cb(
      await this.src.db.collection("admin_users").findAll({
        "other_configs->>need_checker_widget": "true",
        removed: 0
      })
    );
  }
});
