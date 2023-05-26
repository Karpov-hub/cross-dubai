import chai from "chai";
import chaiHttp from "chai-http";
import server from "../../src/index.js";
import db from "@lib/db";
import pretest from "@lib/pretest";

import memstore from "@lib/memstore";
import doc from "@lib/chai-documentator";
import config from "@lib/config";

chai.use(require("chai-like"));
chai.use(require("chai-things"));
chai.use(require("chai-uuid"));

let should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);
let account1, account2;
let iban = {};

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

describe("Crypto service integration", async () => {
  before(async () => {
    await pretest.wait(500);

    const realm = await db.realm.findOne({
      where: { token: realmToken },
      attributes: ["id"]
    });

    await db.business_type.truncate({});

    await db.business_type.create({
      id: "779c7126-27a0-11ea-978f-2e728ce88125",
      type: "Type",
      realm: realm.id
    });
  });

  after(async () => {});

  describe("NIL", async () => {
    // Create user's account. Send currency abbreviation.
    it("Withdrawal with Custom Exchange Rate", async () => {
      let data = {
        header: {
          id: 111,
          version: config.apiVersion,
          service: "account-service",
          method: "withdrawalCustomExchangeRate",
          token: userToken
        },
        data: {
          ref_id: orderId,
          acc_no: { type: "string" },
          acc_tech: { type: "string" },
          description: { type: "string" },
          amount: { type: "number" },
          currency: { type: "string" },
          country: { type: "string" },
          custom_exchange_rate: { type: "number" }
        }
      };

      const res = await sendRequest(data);

      res.body.header.should.have.deep.property("status", "OK");
      res.body.data.should.have.deep.property("acc_no");
      res.body.data.should.have.deep.property("currency", "USD");
      res.body.data.should.have.deep.property("status", 1);
    });
  });
});
