const vm = require("vm"); // scope:server
const axios = require("axios").default; // scope:server
const config = require("@lib/config"); // scope:server
const Queue = require("@lib/queue"); // scope:server
const sha = require("sha1"); // scope:server
const chai = require("chai"); // scope:server
Ext.define("Crm.modules.tariffs.model.TestsModel", {
  extend: "Crm.classes.DataModel",

  idField: "id",
  collection: "tests",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "realm_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "trigger",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "plan_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "user_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "service",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "method",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "description",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "data",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "result",
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
      visible: true
    },
    {
      name: "status",
      type: "integer",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  afterGetData(data, cb) {
    if (data)
      for (let test of data) {
        if (test.result) test.result = JSON.parse(test.result);
      }
    cb(data);
  },

  /* scope:client */
  async insertChecks(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("insertChecks", { id: data }, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $insertChecks(data, cb) {
    const uuid = require("uuid").v4;

    let check = await this.src.db
      .collection("checks")
      .findOne(
        { parameter: data.id.parameter, value: data.id.value },
        { id: 1 }
      );

    if (!check && data.id.parameter && data.id.value) {
      let insert_data = {
        id: uuid(),
        ctime: new Date(),
        mtime: new Date(),
        operator: "==",
        status: 0,
        test_id: data.id.test_id,
        parameter: data.id.parameter,
        value: data.id.value
      };
      let res = await this.src.db.collection("checks").insert(insert_data);

      this.changeModelData(
        "Crm.modules.tariffs.model.TestsChecksModel",
        "ins",
        {}
      );

      cb(res);
    }
  },

  /* scope:client */
  async runTest(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("runTest", { id: data }, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:client */
  async getExampleData(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getExampleData", { id: data }, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $getExampleData(data, cb) {
    let trigger_data = await this.src.db
      .collection("triggers")
      .findOne({ id: data.id }, { id: 1, data: 1 });
    cb(trigger_data);
  },

  /* scope:server */
  async $runTest(data, cb) {
    let testData = await this.getTestData(data);
    let apiData = await this.runServiceMethod(testData, null);
    let checksData = await this.runChecks(testData, apiData);
    let res = await this.writeTestResult(apiData, data, checksData);
    await this.updateModels();
    cb(res);
  },

  /* scope:server */
  async updateModels() {
    this.changeModelData("Crm.modules.tariffs.model.TestsModel", "ins", {});
    this.changeModelData(
      "Crm.modules.tariffs.model.TestsChecksModel",
      "ins",
      {}
    );
    return;
  },

  /* scope:server */
  async runChecks(testData, apiData) {
    let checkRes = [];
    let checkObj = apiData.data;

    for (check of testData.checks) {
      let chai = check.code;
      let sandbox = {
        chai,
        checkObj,
        result: null
      };
      await this.runCheckCode(sandbox, check);
      checkRes.push({
        check,
        result: sandbox.result
      });
    }
    return checkRes;
  },

  /* scope:server */
  runCheckCode(sandbox, check) {
    return new Promise((resolve, reject) => {
      sandbox.reject = reject;
      sandbox.resolve = resolve;
      let code = `reject({message:"No checks"})`;
      let condition = null;
      let result = null;

      if (check.operator == "regexp") {
        condition = `${check.value}.test(checkObj.${check.parameter})`;
        result = `{status:"ERROR", message: "Error while check ${check.value}.test(checkObj.${check.parameter})"}`;
      } else if (check.operator == "includes") {
        condition = `checkObj.${check.parameter}.includes('${check.value}')`;
        result = `{status:"ERROR", message: "Error while check checkObj.${check.parameter}.includes('${check.value}')"}`;
      } else {
        condition = `checkObj.${check.parameter} ${check.operator} '${check.value}'`;
        result = `{status:"ERROR", message: "Error while check ${check.parameter} ${check.operator} ${check.value}"}`;
      }
      code = `        
        if (${condition}) {
          result = {status:"OK"};
          resolve();
        }
        else {
          result = ${result};
          reject(${result});
        }
      `;
      const script = new vm.Script(code);
      const context = new vm.createContext(sandbox);

      script.runInContext(context);
    }).catch((e) => {
      sandbox.result = e;
    });
  },

  /* scope:server */
  async writeTestResult(apiData, data, checksData) {
    let obj = await this.writeChecksResult(checksData, apiData);
    await this.src.db
      .collection("tests")
      .update({ id: data.id }, { $set: obj });
    return obj.result;
  },

  /* scope:server */
  async writeChecksResult(checksData, apiData) {
    let returnObj = { result: apiData, status: 1 };
    if (apiData.error) {
      returnObj.status = 2;
      return returnObj;
    }
    for (data of checksData) {
      let o = {};
      if (data.result.status == "OK") {
        o.status = 1;
      } else o.status = 2;
      await this.src.db
        .collection("checks")
        .update({ id: data.check.id }, { $set: o });
      if (o.status == 2) {
        returnObj = { result: data.result, status: 2 };
        break;
      }
    }
    return returnObj;
  },

  /* scope:server */
  async onConsoleLog(data) {
    this.changeModelData("Crm.modules.tariffs.model.TestsModel", "log", data);
  },

  /* scope:server */
  async runServiceMethod(data, userPass) {
    data.data.test = true;
    const res = await Queue.newJob(data.service, {
      method: data.method,
      data: JSON.parse(data.data),
      realmId: data.realm_id,
      userId: data.user_id
    });
    return { data: res.result };
  },

  /* scope:server */
  async getTestData(data) {
    let testData = await this.src.db.collection("tests").findOne(
      { id: data.id },
      {
        id: 1,
        name: 1,
        realm_id: 1,
        user_id: 1,
        description: 1,
        data: 1,
        result: 1,
        status: 1,
        trigger: 1
      }
    );

    let checksData = await this.src.db
      .collection("checks")
      .findAll(
        { test_id: data.id },
        { id: 1, parameter: 1, operator: 1, value: 1 }
      );

    let apiData = await this.src.db
      .collection("triggers")
      .findOne({ id: testData.trigger }, { id: 1, service: 1, method: 1 });

    testData.service = apiData.service;
    testData.method = apiData.method;
    testData.checks = checksData;

    return testData;
  }
});
