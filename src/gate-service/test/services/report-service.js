import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import db from "@lib/db";
import pretest from "@lib/pretest";
import doc from "@lib/chai-documentator";
import config from "@lib/config";

chai.use(require("chai-like"));
chai.use(require("chai-things"));
chai.use(require("chai-uuid"));

let should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

async function getBalanceByAccNo(acc_no) {
  const account = await db.account.findOne({
    where: { acc_no },
    attributes: ["balance"]
  });
  if (account) return account.get("balance");
  return null;
}

async function sendRequest(data, toDoc) {
  if (toDoc !== false) toDoc = true;

  if (toDoc)
    return await doc(
      chai
        .request(server)
        .post("/")
        .set("Origin", "http://" + realmHost)
        .set("content-type", "application/json")
        .set("authorization", "bearer" + realmToken)
        .send(data)
    );

  return await chai
    .request(server)
    .post("/")
    .set("Origin", "http://" + realmHost)
    .set("content-type", "application/json")
    .set("authorization", "bearer" + realmToken)
    .send(data);
}

describe("Account services", async () => {
  before(async () => {
    await pretest.wait(500);

    const realm = await db.realm.findOne({
      where: { token: realmToken },
      attributes: ["id"]
    });

    await db.business_type.truncate({});
    await db.merchant_account.truncate({});
    await db.account_crypto.truncate({});
    await db.cryptotx.truncate({});
    await db.payments_queue.truncate({});

    await db.business_type.create({
      id: "779c7126-27a0-11ea-978f-2e728ce88125",
      type: "Type",
      realm: realm.id
    });
  });

  after(async () => {});

  describe("Generating Jasper Reports", async () => {
    it("Generate Reconciliation Jasper Report", async () => {
      let merchant_id = "8375a68f-c6d6-47e8-b710-0c6a958ac556";

      let contract_id = "8375a68f-c6d6-47e8-b710-0c6a958ac555";
      const res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "report-service",
          method: "generateReport",
          token: userToken
        },
        data: {
          report_name: "reconciliation_act",
          format: "docx",
          date_from: "2021-08-01",
          date_to: "2021-08-30",
          merchant_id: merchant_id,
          contract_id: contract_id
        }
      });
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data.success).to.be.equal(true);
      expect(res.body.data.code).to.be.an.uuid();
    });
    it("Generate Reconciliation Jasper Report (Invoice)", async () => {
      let merchant_id = "8375a68f-c6d6-47e8-b710-0c6a958ac556";

      let contract_id = "8375a68f-c6d6-47e8-b710-0c6a958ac555";
      const res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "report-service",
          method: "generateReport",
          token: userToken
        },
        data: {
          report_name: "reconciliation_act_invoice",
          format: "docx",
          date_from: "2021-08-01",
          date_to: "2021-08-30",
          merchant_id: merchant_id,
          contract_id: contract_id
        }
      });
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data.success).to.be.equal(true);
      expect(res.body.data.code).to.be.an.uuid();
    });

    it("Generate Deposit Imports Report", async () => {
      const res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "report-service",
          method: "generateReport",
          token: userToken
        },
        data: {
          report_name: "depositImportsReport",
          format: "pdf"
        }
      });
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data.success).to.be.equal(true);
      expect(res.body.data.code).to.be.an.uuid();
    });
    it("Create and download Archive via FileProvider (empty)", async () => {
      const res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "report-service",
          method: "downloadArchive",
          token: userToken
        },
        data: {
          meta_files: [],
          filename: "test"
        }
      });
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data.success).to.be.equal(true);
    });
    it("Download Withdrawal Statements (empty)", async () => {
      const res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "downloadWithdrawalStatements",
          token: userToken
        },
        data: {
          date_from: "2021-10-07",
          date_to: "2021-10-26"
        }
      });
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data.success).to.be.equal(true);
    });
    it("Write Withdrawal Statement", async () => {
      const res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "writeWithdrawalStatement",
          token: userToken
        },
        data: {
          transfer_id: "8375a68f-c6d6-47e8-b710-0c6a958ac555",
          code: "8375a68f-c6d6-47e8-b710-0c6a958ac553"
        }
      });
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data).to.be.equal(true);
    });
    it("Generate Transfers Trade History Report", async () => {
      const res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "report-service",
          method: "generateReport",
          token: userToken
        },
        data: {
          report_name: "tradeHistoryCsv",
          format: "csv",
          date_from: "2021-10-01",
          date_to: "2021-10-31"
        }
      });
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data.success).to.be.equal(true);
      expect(res.body.data.code).to.be.an.uuid();
    });
    it("Generate Advertising Report", async () => {
      const res = await sendRequest({
        header: {
          id: 111,
          version: config.apiVersion,
          service: "report-service",
          method: "generateReport",
          token: userToken
        },
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
      res.body.header.should.have.deep.property("status", "OK");
      expect(res.body.data.success).to.be.equal(true);
      expect(res.body.data.code).to.be.an.uuid();
    });
  });
});
