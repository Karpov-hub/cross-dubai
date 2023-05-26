Ext.define("Crm.modules.orders.model.OrdersModel", {
  extend: "Crm.classes.ClientFilteredModel",

  mixins: [
    "Crm.modules.orders.model.UpdateDataFuncModel", // scope:server
    "Crm.modules.currency.model.CurrencyFunc"
  ],

  filterParam: { entity: "merchant", field: "organisation" },

  idField: "id",

  /* scope:server */
  getDataAndCheckSign() {
    this.collection = "vw_orders";
    this.fields.push(
      {
        name: "merchant_name",
        type: "string",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "organisation_name",
        type: "string",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "contract",
        type: "string",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "realmdepartment_name",
        type: "string",
        filterable: true,
        editable: true,
        visible: true
      }
    );
    this.callParent(arguments);
  },

  constructor() {
    this.collection = "orders";
    this.fields = [
      {
        name: "id",
        type: "ObjectID",
        visible: true
      },
      {
        name: "merchant",
        type: "ObjectID",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "organisation",
        type: "ObjectID",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "contract_id",
        type: "ObjectID",
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
        name: "currency",
        type: "string",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "realm_department",
        type: "ObjectID",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "res_currency",
        type: "string",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "details",
        type: "string",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "status",
        type: "int",
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
        name: "bank_details",
        type: "string",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "order_num",
        type: "string",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "date_from",
        type: "date",
        sort: -1,
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "date_to",
        type: "date",
        sort: -1,
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "external_wallet",
        type: "ObjectID",
        editable: true,
        visible: true
      },
      {
        name: "order_date",
        type: "date",
        sort: -1,
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "merchant_website",
        type: "string",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "merchant_owebsites",
        type: "string",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "withdrawal_btn",
        type: "boolean",
        visible: false,
        editable: false
      },
      {
        name: "deposit_btn",
        type: "boolean",
        visible: false,
        editable: false
      },
      {
        name: "exchange_btn",
        type: "boolean",
        visible: false,
        editable: false
      },
      {
        name: "bankcharges_btn",
        type: "boolean",
        visible: false,
        editable: false
      },
      {
        name: "inner_transfer_btn",
        type: "boolean",
        visible: false,
        editable: false
      },
      {
        name: "transfer_by_plan_btn",
        type: "boolean",
        visible: false,
        editable: false
      },
      {
        name: "amount2",
        type: "float",
        filterable: true,
        editable: true,
        visible: true
      },
      {
        name: "currency2",
        type: "string",
        filterable: true,
        editable: true,
        visible: true
      }
    ];
    this.strongRequest = true;
    this.callParent(arguments);
  },

  validations: [
    { type: "Presence", field: "merchant" },
    { type: "Presence", field: "organisation" },
    // { type: "Presence", field: "contract_id" },
    { type: "Presence", field: "amount" },
    { type: "Presence", field: "currency" },
    // { type: "Presence", field: "realm_department" },
    // { type: "Presence", field: "res_currency" },
    { type: "Presence", field: "status" },
    { type: "Presence", field: "order_num" }
  ],

  /* scope:client */
  async createOrder(data, cb) {
    data.amount = parseFloat((data.amount + "").replace(",", "."));
    this.runOnServer("getMerchantRealm", { id: data.merchant }, async (res) => {
      data._admin_id = localStorage.getItem("uid");
      await this.callApi(
        "merchant-service",
        "createOrder",
        data,
        res.realm,
        data.merchant
      );
      await this.refreshData({
        modelName: this.$className
      });
      return cb({ success: true });
    });
  },
  /* scope:client */
  async write(data, callback) {
    var validateResult = this.isValid(data);
    if (
      validateResult === true ||
      (!!validateResult.isValid && validateResult.isValid())
    ) {
      this.createOrder(data, callback);
    } else callback(null, validateResult.items);
  },

  /* scope:server */
  async afterGetData(data, callback) {
    let currencyList = await this.getCurrencyList();
    for (let item of data) {
      item.amount = await this.roundCurrency({
        currency: item.currency,
        balance: item.amount,
        currencyList
      });
    }
    return callback(data);
  },

  /* scope:client */
  async refreshData(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("refreshData", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $checkRecord(data, cb) {
    let res = await this.src.db
      .collection("orders")
      .findOne({ id: data.id }, { id: 1 });
    return cb(res);
  },

  /* scope:server */
  async $getMerchantRealm(data, cb) {
    let res = await this.src.db
      .collection("users")
      .findOne({ id: data.id }, { realm: 1 });
    return cb(res);
  },

  /* scope:server */
  async $getCheck(data, cb) {
    let res = await this.src.db
      .collection("admin_users")
      .findOne({ _id: data.id }, { order_status: 1 });
    return cb(res);
  },

  /* scope:client */
  async findPaymentDetails(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("findPaymentDetails", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $findPaymentDetails(data, cb) {
    let res = await this.src.db
      .collection(data.collection)
      .findOne({ id: data.orderData.merchant }, { id: 1, payment_details: 1 });
    return res ? cb(res) : cb(false);
  },

  /* scope:server */
  async $getMerchantRealm(data, cb) {
    let res = await this.src.db
      .collection("users")
      .findOne({ id: data.id }, { id: 1, realm: 1 });
    return cb(res);
  },

  /* scope:client */
  async getInvoice(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getInvoice", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getInvoice(data, cb) {
    let res = await this.src.db
      .collection("order_invoices")
      .findOne({ order_id: data.id }, { id: 1, code: 1 });
    return cb(res || false);
  },
  /* scope:client */
  async getOrderById(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getOrderById", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getOrderById(data, cb) {
    let res = await this.src.db
      .collection("vw_orders")
      .findOne({ id: data.id });
    return cb(res || false);
  },

  /* scope:client */
  async getUserGroup() {
    return new Promise((resolve, reject) => {
      this.runOnServer("getUserGroup", null, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getUserGroup(data, cb) {
    return cb(this.user.profile.group ? this.user.profile.group.name : "");
  },

  /* scope:client */
  async getRDIBANs(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getRDIBANs", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getRDIBANs(data, cb) {
    let res = await this.src.db
      .collection("ibans")
      .findAll(
        { owner: data.id, currency: data.currency },
        { id: 1, currency: 1, iban: 1 }
      );
    return cb(res || false);
  },

  /* scope:client */
  async getDefaultRealm(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getDefaultRealm", {}, resolve);
    });
  },

  /* scope:server */
  async $getDefaultRealm(params, cb) {
    let res = await this.src.db.collection("realms").findOne({
      admin_realm: true
    });
    cb(res ? res.id : {});
  },

  /* scope:client */
  async cancelInvoice(data, cb) {
    this.runOnServer("cancelInvoice", data, cb);
  },

  /* scope:server */
  async $cancelInvoice(data, cb) {
    await this.src.db.collection("files").update(
      { id: data.file_id },
      {
        $set: {
          cancelled: 1
        }
      }
    );
    cb({});
  },

  /* scope:client */
  async checkOngoingOrder(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("checkOngoingOrder", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $checkOngoingOrder(data, cb) {
    if (data.status != 1) cb(false);
    let res = await this.src.db.collection(this.collection).findOne(
      {
        organisation: data.organisation,
        realm_department: data.realm_department,
        contract_id: data.contract_id,
        status: 1
      },
      { id: 1 }
    );

    return res && res.id != data.id ? cb(res) : cb(false);
  },

  /* scope:client */
  async checkOrderNumber(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("checkOrderNumber", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $checkOrderNumber(data, cb) {
    let res = await this.src.db.collection(this.collection).findOne(
      {
        organisation: data.organisation,
        realm_department: data.realm_department,
        contract_id: data.contract_id,
        order_num: data.order_num,
        status: 1
      },
      { id: 1 }
    );
    return res && res.id != data.id ? cb(res) : cb(false);
  },

  /* scope:client */
  async checkContract(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("checkContract", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $checkContract(data, cb) {
    if (!data.contract_id) return cb(false);
    let res = await this.src.db.collection("contracts").findOne(
      {
        id: data.contract_id
      },
      { status: 1, id: 1, contract_subject: 1, memo: 1 }
    );
    return res && res.status != "2" ? cb(true) : cb(false);
  },

  /* scope:client */
  getRealmOrganizationByContract(contract_id) {
    return new Promise((resolve) => {
      this.runOnServer(
        "getRealmOrganizationByContract",
        { contract_id },
        (res) => {
          resolve(res);
        }
      );
    });
  },

  /* scope:server */
  async $getRealmOrganizationByContract(data, cb) {
    let realm_department = await this.src.db.query(
      `
    select rd.id
    from realmdepartments rd
    inner join orgs_contracts oc
    on(oc.owner_id = rd.id)
    where oc.contract_id = $1
    `,
      [data.contract_id]
    );
    return cb({
      realm_department_id: realm_department[0] ? realm_department[0].id : null
    });
  },

  /* scope:client */
  async checkTransfers(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("checkTransfers", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $checkTransfers(data, cb) {
    if (!data.order_id) return cb(false);

    const res = await this.src.db.collection("transfers").findOne(
      {
        ref_id: data.order_id
      },
      { id: 1 }
    );
    return cb(!!res);
  }
});
