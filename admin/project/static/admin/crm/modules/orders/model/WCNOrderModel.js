const uuid = require("uuid/v4"); //scope:server
Ext.define("Crm.modules.orders.model.WCNOrderModel", {
  extend: "Crm.classes.ClientFilteredModel",

  filterParam: { entity: "merchant", field: "organisation" },

  collection: "non_ad_orders",
  idField: "id",
  removeAction: "remove",
  strongRequest: true,

  mixins: ["Crm.modules.currency.model.CurrencyFunc"],

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "organisation",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true,
      bindTo: {
        collection: "merchants",
        keyFieldType: "ObjectID",
        keyField: "id",
        fields: [
          {
            name: "name",
            type: "string",
            visible: true
          },
          {
            name: "id",
            type: "ObjectID",
            visible: true
          }
        ]
      }
    },
    {
      name: "order_type",
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
      name: "no",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "additional_data",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      sort: -1,
      filterable: true,
      editable: false,
      visible: true
    },
    {
      name: "has_transfers",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "short_id",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  checkIfOrderHaveTransfers(data) {
    return new Promise((resolve) => {
      this.runOnServer("checkIfOrderHaveTransfers", data, (res) => {
        return resolve(res.existed);
      });
    });
  },

  /* scope:server */
  async $checkIfOrderHaveTransfers(data, cb) {
    let approved_transfers = await this.src.db
      .collection("transfers")
      .findAll({ ref_id: data.id, removed: { $ne: 1 } }, { id: 1 });
    if (approved_transfers && approved_transfers.length)
      return cb({ existed: true });
    let not_approved_transfers = await this.src.db
      .collection("not_sent_plan_transfers")
      .findAll({ ref_id: data.id, removed: { $ne: 1 } }, { id: 1 });
    if (not_approved_transfers && not_approved_transfers.length)
      return cb({ existed: true });
    return cb({ existed: false });
  },

  /* scope:client */
  checkExistedTranches(data) {
    return new Promise((resolve) => {
      this.runOnServer("checkExistedTranches", data, resolve);
    });
  },

  /* scope:server */
  async $checkExistedTranches(data, cb) {
    let tranche = await this.src.db
      .collection("tranches")
      .findOne({ ref_id: data.order_id }, { id: 1 });
    if (tranche && tranche.id) return cb(true);
    return cb(false);
  },

  /* scope:server */
  async $getRealmDepartment(data, cb) {
    let realm = await this.getDefaultRealm();
    let realm_department = await this.src.db
      .collection("realmdepartments")
      .findOne({ realm: realm, status: "Active" }, { id: 1 })
      .catch((e) => {
        console.log(e);
        return cb({ success: false });
      });
    if (!realm_department)
      realm_department = await this.createDefaultRealmDepartment(realm);
    return cb(realm_department);
  },

  /* scope:server */
  async createDefaultRealmDepartment(realm) {
    await this.src.db.collection("realmdepartments").insert({
      id: uuid(),
      realm,
      name: "Default",
      status: "Active",
      description: "Do not delete! Need for WCN orders",
      removed: 0,
      ctime: new Date()
    });
    return await this.src.db
      .collection("realmdepartments")
      .findOne({ realm: realm, status: "Active" }, { id: 1 })
      .catch((e) => {
        console.log(e);
        return cb({ success: false });
      });
  },

  /* scope:client */
  upsertTranche(data) {
    return new Promise((resolve) => {
      this.runOnServer("upsertTranche", data, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async buildTrancheObject(data) {
    return {
      id: data.data.tranche_id,
      ref_id: data.ref_id,
      data: data.data,
      ctime: new Date(),
      removed: 0
    };
  },
  /* scope:server */
  async $upsertTranche(data, cb) {
    let existed_tranche = await this.src.db
      .collection("tranches")
      .findOne({ id: data.data.tranche_id }, { id: 1 });
    if (existed_tranche && existed_tranche.id) {
      await this.src.db
        .collection("tranches")
        .update(
          { id: existed_tranche.id },
          { $set: await this.buildTrancheObject(data) }
        );
    } else
      await this.src.db
        .collection("tranches")
        .insert(await this.buildTrancheObject(data));
    await this.updateTranchesOrdering(data.ref_id);

    return cb({ success: true });
  },

  /* scope:client */
  refreshTranchesNumbering(ref_id) {
    return new Promise((resolve) => {
      this.runOnServer("refreshTranchesNumbering", { ref_id }, resolve);
    });
  },

  /* scope:server */
  async $refreshTranchesNumbering(data, cb) {
    return cb(await this.updateTranchesOrdering(data.ref_id));
  },

  /* scope:server */
  async updateTranchesOrdering(ref_id) {
    let tranches = await this.src.db
      .collection("tranches")
      .findAll({ ref_id }, { id: 1, no: 1 });
    tranches.sort((a, b) => {
      if (!a.no || !b.no) return 1;
      if (a.no > b.no) return 1;
      if (a.no < b.no) return -1;
      return 0;
    });

    let records_for_update = [];
    for (let idx = 0; idx < tranches.length; idx++)
      if (idx + 1 != tranches[idx].no)
        records_for_update.push({ id: tranches[idx].id, no: idx + 1 });
    for (let record of records_for_update) {
      await this.src.db
        .collection("tranches")
        .update({ id: record.id }, { $set: { no: record.no } });
    }
    this.changeModelData("Crm.modules.orders.model.TranchesModel", "ins", {});

    return { success: true };
  },

  /* scope:client */
  getMerchantTariffVariables(org_id, vars) {
    return new Promise((resolve) => {
      this.runOnServer(
        "getMerchantTariffVariables",
        { org_id, vars },
        (res) => {
          return resolve(res);
        }
      );
    });
  },

  /* scope:server */
  async $getMerchantTariffVariables(data, cb) {
    let variables = {};
    let merchant_data = await this.src.db
      .collection("merchants")
      .findOne({ id: data.org_id }, { variables: 1, tariff: 1, user_id: 1 });
    if (!merchant_data || !merchant_data.variables) return cb({});
    if (merchant_data.variables && merchant_data.variables.length) {
      this.setVariables(variables, merchant_data.variables, data.vars);
    }
    if (this.checkIfVariablesAreFilled(variables)) return cb(variables);
    let user_data = await this.src.db
      .collection("users")
      .findOne({ id: merchant_data.user_id }, { variables: 1, tariff: 1 });
    if (user_data && user_data.variables && user_data.variables.length) {
      this.setVariables(variables, user_data.variables, data.vars);
    }
    if (this.checkIfVariablesAreFilled(variables)) return cb(variables);
    let tariff_id = merchant_data.tariff || user_data.tariff;
    let tariff_data = await this.src.db.collection("tariffplans").findOne(
      { id: tariff_id },
      {
        variables: 1
      }
    );
    if (tariff_data && tariff_data.variables && tariff_data.variables.length) {
      this.setVariables(variables, tariff_data.variables, data.vars);
    }
    if (this.checkIfVariablesAreFilled(variables)) return cb(variables);
    return cb(variables);
  },

  /* scope:server */
  checkIfVariablesAreFilled(variables) {
    if (!Object.keys(variables).length) return false;
    for (let key of Object.keys(variables)) if (!variables[key]) return false;
    return true;
  },

  /* scope:server */
  setVariables(variables, arr, searchable_variables) {
    for (let variable of searchable_variables) {
      if (!variables[variable]) {
        let found_var = arr.find((el) => {
          return el.key == variable;
        });
        variables[variable] = found_var ? found_var.value : null;
      }
    }
    return variables;
  },

  /* scope:client */
  getOrderNo() {
    return new Promise((resolve) => {
      this.runOnServer("getOrderNo", {}, resolve);
    });
  },

  /* scope:server */
  async $getOrderNo(data, cb) {
    let date = new Date();
    const setNormalDate = (num) => {
      return num + 1 > 9 ? num + 1 : `0${num + 1}`;
    };
    let order_no = await this.src.db.collection("non_ad_orders").findAll({
      no: {
        $like: `%.${setNormalDate(date.getMonth())}.${date.getFullYear()}%`
      }
    });
    return cb(
      `${setNormalDate(date.getDate())}.${setNormalDate(
        date.getMonth()
      )}.${date.getFullYear()} - ${order_no.length + 1}`
    );
  },

  /* scope:client */
  checkIfMerchantExist(data) {
    return new Promise((resolve) => {
      this.runOnServer("checkIfMerchantExist", data, (res) => {
        return resolve(res.existed);
      });
    });
  },

  /* scope:server */
  async $checkIfMerchantExist(data, cb) {
    let merch_data = await this.src.db
      .collection("merchants")
      .findOne({ id: data.organisation }, { id: 1 })
      .catch((err) => {
        console.log(err);
        return cb({ existed: false });
      });
    if (!merch_data) return cb({ existed: false });
    return cb({ existed: true });
  },

  /* scope:client */
  generateReport(data) {
    return new Promise((resolve) => {
      this.runOnServer("generateReport", data, resolve);
    });
  },

  /* scope:server */
  async $generateReport(data, cb) {
    let generation_report_result = await this.callApi({
      service: "report-service",
      method: "generateReport",
      data: {
        report_name: data.order_type,
        order_id: data.id,
        format: "html",
        get_file_instantly: true
      }
    }).catch((e) => {
      console.log(e);
    });
    generation_report_result = generation_report_result.result;
    if (!generation_report_result || !generation_report_result.success)
      return cb(false);
    return cb(
      Buffer.from(generation_report_result.file_data, "base64").toString("utf8")
    );
  },

  /* scope:client */
  checkIfNonAdOrderExists(data) {
    return new Promise((resolve) => {
      this.runOnServer("checkIfNonAdOrderExists", data, resolve);
    });
  },

  /* scope:server */
  async $checkIfNonAdOrderExists(data, cb) {
    let non_ad_order = await this.src.db
      .collection("non_ad_orders")
      .findOne({ id: data.id }, { id: 1 });
    return cb(!!non_ad_order);
  },

  /* scope:server */
  insertDataToDb: async function(data, cb) {
    data.ctime = new Date();
    data.mtime = new Date();

    const ce_order_seq = await this.src.db.query(
      `SELECT nextval('ce_orders_short_id_seq')`
    );

    data.short_id = "C" + String(ce_order_seq[0].nextval).padStart(8, "0");

    this.dbCollection.insert(data, cb);
  },

  /* scope:server */
  updateDataInDb: function(_id, data, cb) {
    var oo = {};
    oo[this.idField] = _id;
    data.mtime = new Date();
    this.dbCollection.update(oo, { $set: data }, cb);
  },

  /* scope:client */
  updateExistedTranchesCurrencies(
    order_id,
    currency,
    tranche_currencies_fields
  ) {
    return new Promise((resolve) => {
      this.runOnServer(
        "updateExistedTranchesCurrencies",
        { order_id, currency, tranche_currencies_fields },
        resolve
      );
    });
  },

  /* scope:server */
  async $updateExistedTranchesCurrencies(data, cb) {
    if (
      !data.order_id ||
      !data.currency ||
      !data.tranche_currencies_fields ||
      !data.tranche_currencies_fields.length
    )
      return cb();
    let updated_tranche_object = {};
    for (let field of data.tranche_currencies_fields)
      updated_tranche_object[field] = data.currency;

    let original_tranches_data = await this.src.db
      .collection("tranches")
      .findAll({ ref_id: data.order_id }, { id: 1, data: 1 });
    if (!original_tranches_data || !original_tranches_data.length) return cb();
    for (let tranche of original_tranches_data) {
      await this.src.db.collection("tranches").update(
        { id: tranche.id },
        {
          $set: { data: Object.assign(tranche.data, updated_tranche_object) }
        }
      );
    }
    this.changeModelData("Crm.modules.orders.model.TranchesModel", "ins", {});
    return cb();
  },

  /* scope:client */
  getCommonOrdeCurrencies() {
    return new Promise((resolve) => {
      this.runOnServer("getCommonOrdeCurrencies", {}, resolve);
    });
  },

  /* scope:server */
  async $getCommonOrdeCurrencies(data, cb) {
    let src_currencies_volumes = [],
      dst_currencies_volumes = [];
    let orders_data = await this.src.db.collection("non_ad_orders").findAll();

    src_currencies_volumes = await this.calculateCurrenciesRating(
      "from_currency",
      orders_data
    );
    dst_currencies_volumes = await this.calculateCurrenciesRating(
      "to_currency",
      orders_data
    );
    return cb({
      from_currency: this.getCommonlyUsedCurrency(src_currencies_volumes),
      to_currency: this.getCommonlyUsedCurrency(dst_currencies_volumes)
    });
  },

  /* scope:client */
  getOrderTranchesData(id) {
    return new Promise((resolve) => {
      this.runOnServer("getOrderTranchesData", { ref_id: id }, resolve);
    });
  },

  /* scope:server */
  async $getOrderTranchesData(data, cb) {
    let tranches = await this.src.db.collection("tranches").findAll(
      { ref_id: data.ref_id },
      {
        id: 1,
        data: 1
      }
    );
    tranches = tranches.map((el) => Object.assign(el, el.data));
    return cb(tranches);
  },

  /* scope:client */
  getSettings(keys) {
    return new Promise((resolve) => {
      this.runOnServer("getSettings", { keys }, resolve);
    });
  },

  /* scope:server */
  async $getSettings(data, cb) {
    let settings = await this.src.db
      .collection("settings")
      .findAll({ key: { $in: data.keys } }, { key: 1, value: 1 });
    if (!settings) return cb([]);
    settings = settings.reduce(
      (acc, val) => Object.assign(acc, { [val.key]: val.value }),
      {}
    );
    return cb(settings);
  },

  /* scope:server */
  async $getCurrenciesList(data, cb) {
    let currencies = await this.src.db.collection("currency").findAll();
    return cb(currencies);
  }
});
