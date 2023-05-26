import chai from "chai";

let should = chai.should();
const expect = chai.expect;

import Service from "../src/Service.js";
import FeeCalculator from "../src/lib/feeCalculator";
let service;
import db from "@lib/db";
import pretest from "@lib/pretest";
import moment from "moment";

let ENV, triggerId, tariffId, planId, realmId, userId;

const getDateString = (date) => {
  return moment(date).format("YYYY-MM-DD");
};

describe("Tarifs service", async () => {
  before(async () => {
    // this code runs before all tests

    ENV = await pretest.before();

    realmId = ENV.realmId;
    userId = ENV.user1.id;

    await db.account.update(
      { balance: 1000 },
      { where: { acc_no: "1000001" } }
    );

    let res;
    res = await db.trigger.create({
      service: "tariff-service",
      method: "testTrigger",
      ctime: new Date(),
      mtime: new Date()
    });

    triggerId = res.get("id");

    await db.viewset.create({
      name: "realms",
      sql: "SELECT id, name FROM realms"
    });

    await db.viewset.create({
      name: "daily",
      sql: `SELECT '${userId}' as user_id, 'USD' as currency, 3 as amount`
    });

    res = await db.tariff.create({
      trigger: triggerId,
      name: "test",
      description: "test",
      data: {
        __conf: {
          Realm: {
            keyfield: "root:data:owner",
            collection: "realms",
            field: "id",
            conditions: null
          },
          Amount: {
            keyfield: "root:data:user",
            collection: "daily",
            field: "user_id",
            conditions: null
          }
        }
      },
      variables: {
        _arr: [
          { key: "FEE_ACCOUNT", value: ENV.FEE_ACCOUNT },
          { key: "FEE_PERCENTS", value: 5 },
          { key: "FEE_ABS1", value: 15 }
        ]
      },
      actions: {
        _arr: [
          {
            type: "transfer",
            name: "Списать фикс",
            options: {
              txtype: "fee",
              parent_id: "root:result:id",
              acc_src: "root:data:acc_no",
              acc_dst: "$FEE_ACCOUNT",
              fee: "$FEE_ABS1",
              feetype: "ABS",
              description_src: "description_src",
              description_dst: "description_dst",
              hold: true,
              hidden: false,
              amount_field: ""
            }
          },
          {
            type: "transfer",
            name: "Списать фикс за дату",
            options: {
              txtype: "fee",
              parent_id: "root:result:id",
              acc_src: "root:data:acc_no",
              acc_dst: "$FEE_ACCOUNT",
              fee: "2.5",
              feetype: "ABS",
              description_src: "description_src",
              description_dst: "description_dst",
              hold: true,
              hidden: false,
              amount_field: ""
            }
          },
          {
            type: "transfer",
            name: "Списать фикс за кастом",
            options: {
              txtype: "fee",
              parent_id: "root:result:id",
              acc_src: "root:data:acc_no",
              acc_dst: "$FEE_ACCOUNT",
              fee: "3.5",
              feetype: "ABS",
              description_src: "description_src",
              description_dst: "description_dst",
              hold: true,
              hidden: false,
              amount_field: ""
            }
          },
          {
            type: "transfer",
            name: "Списать проценты",
            options: {
              txtype: "fee",
              parent_id: "root:result:id",
              acc_src: "root:data:acc_no",
              acc_dst: "$FEE_ACCOUNT",
              fee: "$FEE_PERCENTS",
              feetype: "PERCENTS",
              description_src: "description_src",
              description_dst: "description_dst",
              hold: true,
              hidden: true,
              amount_field: "root:data:amount"
            }
          },
          {
            type: "tag",
            name: "Добавить тэг",
            options: {
              entity: "root:data:ref_id",
              tag: "test"
            }
          },
          {
            type: "error",
            name: "Ошибка: Превышен лимит",
            options: {
              code: "AMOUNTLIMIT"
            }
          },
          {
            type: "message",
            name: "Сообщение: Крупный перевод",
            options: {
              to: "root:Realm:email",
              subject: "Клиент пытается провести крупный перевод",
              text: ""
            }
          }
        ]
      },
      rules: {
        _arr: [
          {
            render_function: "getSumAmout",
            value_field: ["root:Amount", "'USD'"],
            ne: true,
            operator: "=",
            value: "3",
            action: [],
            stop: true
          },
          {
            render_function: null,
            value_field: "root:data:currency",
            ne: true,
            operator: "=",
            value: "'USD'",
            action: [],
            stop: true
          },
          {
            render_function: "",
            value_field: ["new Date()"],
            ne: true,
            operator: "<",
            value: "'" + getDateString(Date.now() + 86400000) + "'",
            action: ["Списать фикс за дату"],
            stop: false
          },
          {
            custom_function:
              "if(apiData.data.testCustom == 1) {db.tag.create({tag:'test'});result = true;}",
            render_function: "",
            value_field: "",
            ne: true,
            operator: "=",
            value: "",
            action: ["Списать фикс за кастом"],
            stop: false
          },
          {
            render_function: null,
            value_field: "root:data:amount",
            ne: false,
            operator: "<=",
            value: "100",
            action: ["Списать фикс"],
            stop: true
          },
          {
            render_function: null,
            value_field: "root:data:amount",
            ne: false,
            operator: "<=",
            value: "200",
            action: ["Списать проценты"],
            stop: true
          },
          {
            render_function: null,
            value_field: "root:data:amount",
            ne: false,
            operator: "<=",
            value: "500",
            action: ["Списать проценты", "Списать фикс", "Добавить тэг"],
            stop: true
          },
          {
            render_function: null,
            value_field: "root:data:amount",
            ne: false,
            operator: ">",
            value: "500",
            action: ["Сообщение: Крупный перевод", "Ошибка: Превышен лимит"], //"Крупный перевод",
            stop: true
          }
        ]
      }
    });
    tariffId = res.get("id");
    await db.tariffplan.update(
      {
        tariffs: {
          _arr: [tariffId, ENV.tariff2, ENV.tariff1, ENV.tariff3]
        }
      },
      { where: { id: ENV.planId } }
    );

    service = new Service({ name: "tariff-service" });
    await service.run();
  });

  after(async () => {
    //return;
  });

  describe("Calculator methods", () => {
    it("getValueFromString", () => {
      let res = FeeCalculator.getValueFromString("100+$TEST  + $TEST", {
        TEST: 10
      });
      expect(res).to.equal(120);
    });
  });

  describe("Call tarifficator on service's method", () => {
    it("Should return methods by service name", async () => {
      const res = await service.runServiceMethod({
        method: "readTriggers",
        data: { service: "tariff-service" }
      });
      res.should.have.deep.property("data", ["testTrigger"]);
    });

    it("Check tariff < 100USD (15fix)", async () => {
      const testObj = {};
      const res = await service.runServiceMethod(
        {
          method: "testTrigger",
          data: {
            owner: realmId,
            user: userId,
            ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
            acc_no: ENV.user1.accounts[0].acc_no,
            amount: 50,
            currency: "USD",
            country: "UK",
            testCustom: 1
          },
          realmId,
          userId
        },
        testObj
      );

      //console.log("testObj.transfers:", testObj);

      testObj.should.have.deep.property("transfers");

      expect(testObj.transfers).to.have.deep.members([
        {
          parent_id: 123,
          txtype: "fee",
          hold: true,
          hidden: false,
          acc_src: "1000001",
          acc_dst: "20000000001",
          description_src: "description_src",
          description_dst: "description_dst",
          amount: 2.5,
          tariff: "test",
          tariff_id: tariffId,
          tariff_plan: "testplan",
          tariff_plan_id: ENV.planId
        },
        {
          parent_id: 123,
          txtype: "fee",
          hold: true,
          hidden: false,
          acc_src: "1000001",
          acc_dst: "20000000001",
          description_src: "description_src",
          description_dst: "description_dst",
          amount: 3.5,
          tariff: "test",
          tariff_id: tariffId,
          tariff_plan: "testplan",
          tariff_plan_id: ENV.planId
        },
        {
          txtype: "fee",
          parent_id: 123,
          hold: true,
          hidden: false,
          acc_src: ENV.user1.accounts[0].acc_no,
          acc_dst: ENV.FEE_ACCOUNT,
          amount: 15,
          tariff: "test",
          description_src: "description_src",
          description_dst: "description_dst",
          tariff_id: tariffId,
          tariff_plan: "testplan",
          tariff_plan_id: ENV.planId
        }
      ]);
    });

    it("Check tariff > 100USD and <200 (15%)", async () => {
      const testObj = {};
      const res = await service.runServiceMethod(
        {
          method: "testTrigger",
          data: {
            owner: realmId,
            user: userId,
            ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
            acc_no: ENV.user1.accounts[0].acc_no,
            amount: 110,
            currency: "USD",
            country: "UK"
          },
          realmId,
          userId
        },
        testObj
      );
      testObj.should.have.deep.property("transfers");

      expect(testObj.transfers).to.have.deep.members([
        {
          parent_id: 123,
          txtype: "fee",
          hold: true,
          hidden: false,
          acc_src: "1000001",
          acc_dst: "20000000001",
          description_src: "description_src",
          description_dst: "description_dst",
          amount: 2.5,
          tariff: "test",
          tariff_id: tariffId,
          tariff_plan: "testplan",
          tariff_plan_id: ENV.planId
        },
        {
          txtype: "fee",
          parent_id: 123,
          hidden: true,
          hold: true,
          acc_src: ENV.user1.accounts[0].acc_no,
          acc_dst: ENV.FEE_ACCOUNT,
          amount: 16.5,
          tariff: "test",
          description_src: "description_src",
          description_dst: "description_dst",
          tariff_id: tariffId,
          tariff_plan: "testplan",
          tariff_plan_id: ENV.planId
        }
      ]);
    });

    it("Check tariff > 200USD (two actions 15% + 15 and adding tag)", async () => {
      const testObj = {};
      const res = await service.runServiceMethod(
        {
          method: "testTrigger",
          data: {
            owner: realmId,
            user: userId,
            ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
            acc_no: ENV.user1.accounts[0].acc_no,
            amount: 210,
            currency: "USD",
            country: "UK"
          },
          realmId,
          userId
        },
        testObj
      );

      testObj.should.have.deep.property("tags");
      testObj.should.have.deep.property("transfers");

      expect(testObj.tags).to.have.deep.members([
        {
          entity: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
          tag: "test"
        }
      ]);

      const tag = await db.tag.findOne({
        where: { entity: "a928565d-989c-482a-a0b5-e7f2ec79a6f6" },
        aattributes: ["tag"]
      });
      expect(tag.tag).to.equal("test");

      expect(testObj.transfers).to.have.deep.members([
        {
          parent_id: 123,
          txtype: "fee",
          hold: true,
          hidden: false,
          acc_src: "1000001",
          acc_dst: "20000000001",
          description_src: "description_src",
          description_dst: "description_dst",
          amount: 2.5,
          tariff: "test",
          tariff_id: tariffId,
          tariff_plan: "testplan",
          tariff_plan_id: ENV.planId
        },
        {
          txtype: "fee",
          parent_id: 123,
          hidden: false,
          hold: true,
          acc_src: ENV.user1.accounts[0].acc_no,
          acc_dst: ENV.FEE_ACCOUNT,
          amount: 15,
          tariff: "test",
          description_src: "description_src",
          description_dst: "description_dst",
          tariff_id: tariffId,
          tariff_plan: "testplan",
          tariff_plan_id: ENV.planId
        },
        {
          txtype: "fee",
          parent_id: 123,
          hidden: true,
          hold: true,
          acc_src: ENV.user1.accounts[0].acc_no,
          acc_dst: ENV.FEE_ACCOUNT,
          amount: 31.5,
          tariff: "test",
          description_src: "description_src",
          description_dst: "description_dst",
          tariff_id: tariffId,
          tariff_plan: "testplan",
          tariff_plan_id: ENV.planId
        }
      ]);
    });

    it("Limit overflowed error (>500)", async () => {
      const testObj = {};
      let ee;
      try {
        await service.runServiceMethod(
          {
            method: "testTrigger",
            data: {
              owner: realmId,
              user: userId,
              ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
              acc_no: ENV.user1.accounts[0].acc_no,
              amount: 510,
              currency: "USD",
              country: "UK"
            },
            realmId,
            userId
          },
          testObj
        );
      } catch (e) {
        ee = e;
      }
      expect(ee).to.equal("AMOUNTLIMIT");
    });

    it("Should ignore other currency", async () => {
      const testObj = {};
      const res = await service.runServiceMethod(
        {
          method: "testTrigger",
          data: {
            owner: realmId,
            user: userId,
            ref_id: "a928565d-989c-482a-a0b5-e7f2ec79a6f6",
            acc_no: ENV.user1.accounts[0].acc_no,
            amount: 110,
            currency: "EUR",
            country: "UK"
          },
          realmId,
          userId
        },
        testObj
      );
      expect(testObj).to.not.have.property("transfers");
    });
  });
});
