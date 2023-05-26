import db from "@lib/db";
import pretest from "@lib/pretest";
import chai from "chai";
import queue from "@lib/queue";

let should = chai.should();

chai.use(require("chai-uuid"));

const expect = chai.expect;

import Service from "../src/Service.js";

const service = new Service({ name: "report-service" });

let ENV;
async function createOrder(data, realmId, userId) {
  let order = {
    id: data.id || uuid(),
    merchant: data.merchant ? data.merchant : userId,
    organisation: data.organisation,
    amount: data.amount,
    currency: data.currency,
    res_currency: data.res_currency,
    realm_department: data.realm_department,
    status: data.status,
    details: data.details,
    contract_id: data.contract_id,
    bank_details: data.bank_details,
    removed: 0
  };

  const res = await db.order.upsert(order);
  return { success: true };
}

async function getBalanceByAccNo(acc_no) {
  const account = await db.account.findOne({
    where: { acc_no },
    attributes: ["balance"]
  });
  if (account) return account.get("balance");
  return null;
}

describe("Report service", async () => {
  before(async () => {
    ENV = await pretest.before();

    try {
      await service.run();
    } catch (e) {
      console.log("e:", e);
    }
  });

  after(async () => {});

  describe("Generage Jasper Reports", () => {
    it("Generate Reconciliation Jasper Report", async () => {
      let merchant_id = "8375a68f-c6d6-47e8-b710-0c6a958ac556";
      let contract_id = "8375a68f-c6d6-47e8-b710-0c6a958ac555";
      const res = await service.runServiceMethod({
        realmId: ENV.realmId,
        userId: ENV.user1.id,
        method: "generateReport",
        data: {
          report_name: "reconciliation_act",
          format: "docx",
          date_from: "01/08/2021",
          date_to: "30/08/2021",
          merchant_id: merchant_id,
          contract_id: contract_id
        }
      });
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("code");
    });

    it("Generate Reconciliation Jasper Report (Invoice)", async () => {
      let merchant_id = "8375a68f-c6d6-47e8-b710-0c6a958ac556";
      // let orderId = "8375a68f-c6d6-47e8-b710-0c6a958ac556";
      let contract_id = "8375a68f-c6d6-47e8-b710-0c6a958ac555";
      const res = await service.runServiceMethod({
        realmId: ENV.realmId,
        userId: ENV.user1.id,
        method: "generateReport",
        data: {
          report_name: "reconciliation_act_invoice",
          format: "docx",
          date_from: "01/08/2021",
          date_to: "30/08/2021",
          merchant_id: merchant_id,
          contract_id: contract_id
        }
      });
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("code");
    });

    it("Generate Withdrawal Statement", async () => {
      const res = await service.runServiceMethod({
        realmId: ENV.realmId,
        userId: ENV.user1.id,
        method: "generateReport",
        data: {
          report_name: "it_technologie_withdrawal_statement",
          format: "pdf",
          transfer_id: "8375a68f-c6d6-47e8-b710-0c6a958ac555"
        }
      });
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("code");
    });

    it("Generate Deposit Imports Report", async () => {
      const res = await service.runServiceMethod({
        realmId: ENV.realmId,
        userId: ENV.user1.id,
        method: "generateReport",
        data: {
          report_name: "depositImportsReport",
          format: "pdf"
        }
      });
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("code");
    });

    it("Create and download Archive via FileProvider (empty)", async () => {
      const res = await service.runServiceMethod({
        realmId: ENV.realmId,
        userId: ENV.user1.id,
        method: "downloadArchive",
        data: {
          meta_files: [],
          filename: "test"
        }
      });
      res.should.have.deep.property("success", true);
    });

    it("Generate Transfers Trade History Report", async () => {
      const res = await service.runServiceMethod({
        realmId: ENV.realmId,
        userId: ENV.user1.id,
        method: "generateReport",
        data: {
          report_name: "tradeHistoryCsv",
          format: "csv",
          date_from: "2021-10-01",
          date_to: "2021-10-31"
        }
      });
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("code");
    });

    it("Generate Advertising Report", async () => {
      const res = await service.runServiceMethod({
        realmId: ENV.realmId,
        userId: ENV.user1.id,
        method: "generateReport",
        data: {
          report_name: "AdvertisingReport",
          format: "pdf",
          websites: "Not specified",
          campaignID: "616ff0e4ab923d4cd37e15f1",
          date_from: "2021-12-01",
          date_to: "2021-12-11",
          order_id: "c164ad0d-090e-4eb5-b93a-4a0a37c35f4b",
          merchant_id: "8375a68f-c6d6-47e8-b710-0c6a958ac555"
        }
      });
      res.should.have.deep.property("success", true);
      res.should.have.deep.property("code");
    });
  });
});
